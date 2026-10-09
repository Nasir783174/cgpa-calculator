'use strict';
/* HSC GPA Calculator (Bangladesh): engine + UI.
   The engine is pure (no DOM) so it can be tested on its own in Node. */

/* ---------- Grading scale (all Bangladesh general education boards) ---------- */
const HSC_BANDS = Object.freeze([
  { min: 80, letter: 'A+', point: 5 },
  { min: 70, letter: 'A', point: 4 },
  { min: 60, letter: 'A-', point: 3.5 },
  { min: 50, letter: 'B', point: 3 },
  { min: 40, letter: 'C', point: 2 },
  { min: 33, letter: 'D', point: 1 },
  { min: 0, letter: 'F', point: 0 }
]);

/* max: default full marks. maxChoices: HSC marksheets use 100 or 200 depending on the subject, so every row lets the user switch. */
const HSC_SUBJECTS = Object.freeze({
  bangla: { name: 'Bangla', hint: '1st + 2nd paper', max: 200, maxChoices: [200, 100] },
  english: { name: 'English', hint: '1st + 2nd paper', max: 200, maxChoices: [200, 100] },
  ict: { name: 'ICT', max: 100, maxChoices: [100, 200] },
  physics: { name: 'Physics', max: 200, maxChoices: [200, 100] },
  chemistry: { name: 'Chemistry', max: 200, maxChoices: [200, 100] },
  biology: { name: 'Biology', max: 200, maxChoices: [200, 100] },
  higherMath: { name: 'Higher Mathematics', max: 200, maxChoices: [200, 100] },
  history: { name: 'History', max: 200, maxChoices: [200, 100] },
  civics: { name: 'Civics and Good Governance', max: 200, maxChoices: [200, 100] },
  economics: { name: 'Economics', max: 200, maxChoices: [200, 100] },
  geography: { name: 'Geography', max: 200, maxChoices: [200, 100] },
  logic: { name: 'Logic', max: 200, maxChoices: [200, 100] },
  sociology: { name: 'Sociology', max: 200, maxChoices: [200, 100] },
  socialWork: { name: 'Social Work', max: 200, maxChoices: [200, 100] },
  islamicHistory: { name: 'Islamic History and Culture', max: 200, maxChoices: [200, 100] },
  islamicStudies: { name: 'Islamic Studies', max: 200, maxChoices: [200, 100] },
  psychology: { name: 'Psychology', max: 200, maxChoices: [200, 100] },
  agriculture: { name: 'Agriculture Studies', max: 200, maxChoices: [200, 100] },
  accounting: { name: 'Accounting', max: 200, maxChoices: [200, 100] },
  finance: { name: 'Finance, Banking and Insurance', max: 200, maxChoices: [200, 100] },
  businessManagement: { name: 'Business Organization and Management', max: 200, maxChoices: [200, 100] },
  statistics: { name: 'Statistics', max: 200, maxChoices: [200, 100] }
});

const HSC_COMMON = ['bangla', 'english', 'ict'];
const HSC_SCI_CHOICES = ['physics', 'chemistry', 'biology', 'higherMath', 'statistics', 'agriculture'];
const HSC_HUM_CHOICES = ['history', 'civics', 'economics', 'geography', 'logic', 'sociology',
  'socialWork', 'islamicHistory', 'islamicStudies', 'psychology', 'agriculture', 'statistics'];
const HSC_BUS_CHOICES = ['accounting', 'finance', 'businessManagement', 'statistics', 'economics', 'agriculture', 'geography'];

/* main: ordered rows (3 compulsory + 3 group subjects). A row is a subject id (fixed) or { id, choices } (selectable).
   optional: the fourth subject. */
const HSC_GROUPS = Object.freeze({
  science: {
    main: HSC_COMMON.concat([
      { id: 'physics', choices: HSC_SCI_CHOICES },
      { id: 'chemistry', choices: HSC_SCI_CHOICES },
      { id: 'biology', choices: HSC_SCI_CHOICES }
    ]),
    optional: { id: 'higherMath', choices: HSC_SCI_CHOICES }
  },
  humanities: {
    main: HSC_COMMON.concat([
      { id: 'history', choices: HSC_HUM_CHOICES },
      { id: 'civics', choices: HSC_HUM_CHOICES },
      { id: 'economics', choices: HSC_HUM_CHOICES }
    ]),
    optional: { id: 'logic', choices: HSC_HUM_CHOICES }
  },
  business: {
    main: HSC_COMMON.concat([
      { id: 'accounting', choices: HSC_BUS_CHOICES },
      { id: 'finance', choices: HSC_BUS_CHOICES },
      { id: 'businessManagement', choices: HSC_BUS_CHOICES }
    ]),
    optional: { id: 'statistics', choices: HSC_BUS_CHOICES }
  }
});

/* ---------- Engine ---------- */
function hscValidateMark(raw, max) {
  const v = String(raw == null ? '' : raw).trim();
  if (!v) return { valid: false, empty: true, message: '' };
  if (!/^\d+$/.test(v)) return { valid: false, empty: false, message: 'Whole number only' };
  const mark = Number(v);
  if (mark > max) return { valid: false, empty: false, message: 'Max is ' + max };
  return { valid: true, empty: false, mark: mark, message: '' };
}
/* Integer comparison (mark*100 >= min*max) so 79.5% can never round up to A+. */
function hscGradeFromMarks(mark, max) {
  if (!Number.isInteger(mark) || !Number.isInteger(max) || max <= 0 || mark < 0 || mark > max) return null;
  return HSC_BANDS.find(b => mark * 100 >= b.min * max).letter;
}
function hscPoint(letter) {
  const b = HSC_BANDS.find(x => x.letter === letter);
  return b ? b.point : null;
}
function hscBonus(point) {
  return typeof point === 'number' && point >= 0 && point <= 5 ? Math.max(0, point - 2) : null;
}
/* Round (numerator / n) to the nearest integer with exact integer maths (half rounds up). */
function hscDivRound(numerator, n) {
  const q = Math.floor(numerator / n);
  const r = numerator - q * n;
  return 2 * r >= n ? q + 1 : q;
}
/* mainLetters: array of letters for the main subjects (length must equal expectedMain).
   fourthLetter: letter of the fourth subject, or null/undefined when there is none.
   Returns hundredths so callers never touch floating point GPA values. */
function hscCalculate(mainLetters, fourthLetter, expectedMain) {
  if (!Array.isArray(mainLetters) || !Number.isInteger(expectedMain) || expectedMain < 1 || mainLetters.length !== expectedMain) return null;
  const points = mainLetters.map(hscPoint);
  if (points.some(p => p === null)) return null;
  let bonus = 0;
  if (fourthLetter) {
    const fp = hscPoint(fourthLetter);
    if (fp === null) return null;
    bonus = hscBonus(fp);
  }
  const n = expectedMain;
  const failed = [];
  mainLetters.forEach((l, i) => { if (l === 'F') failed.push(i); });
  const mainTotal = points.reduce((s, p) => s + p, 0);
  const totalHalves = Math.round((mainTotal + bonus) * 2);
  const mainHalves = Math.round(mainTotal * 2);
  return {
    n: n,
    mainTotal: mainTotal,
    bonus: bonus,
    total: totalHalves / 2,
    mainGpaHundredths: hscDivRound(mainHalves * 50, n),
    failedIndexes: failed,
    passed: failed.length === 0,
    gpaHundredths: failed.length ? null : Math.min(500, hscDivRound(totalHalves * 50, n)),
    capped: failed.length === 0 && totalHalves * 50 > 500 * n
  };
}
const HSCEngine = Object.freeze({
  BANDS: HSC_BANDS, GROUPS: HSC_GROUPS, SUBJECTS: HSC_SUBJECTS,
  validateMark: hscValidateMark, gradeFromMarks: hscGradeFromMarks, point: hscPoint,
  bonus: hscBonus, calculate: hscCalculate
});
if (typeof module !== 'undefined' && module.exports) module.exports = HSCEngine;

/* ---------- UI ---------- */
function hscInit() {
  const form = document.getElementById('hscForm');
  const mainBox = document.getElementById('hscMainRows');
  const fourthBox = document.getElementById('hscFourthRows');
  const resultBox = document.getElementById('hscResult');
  const msgEl = document.getElementById('hscFormMessage');
  const resetBtn = document.getElementById('hscReset');
  const countEl = document.getElementById('hscMainCount');
  if (!form || !mainBox || !fourthBox || !resultBox || !msgEl || !resetBtn) return;

  let group = 'science';
  let mode = 'grade';
  let rows = [];
  let mainCount = 6;

  const mk = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const f2 = hundredths => (hundredths / 100).toFixed(2);
  const gp2 = n => n.toFixed(2);
  const BN = { '\u09E6': '0', '\u09E7': '1', '\u09E8': '2', '\u09E9': '3', '\u09EA': '4', '\u09EB': '5', '\u09EC': '6', '\u09ED': '7', '\u09EE': '8', '\u09EF': '9' };
  const cleanDigits = s => s.replace(/[\u09E6-\u09EF]/g, d => BN[d]).replace(/\D/g, '');

  function invalidate() {
    resultBox.hidden = true;
    msgEl.textContent = '';
    rows.forEach(r => { r.el.classList.remove('is-error'); r.err.textContent = ''; });
  }

  function currentMax(row) { return Number(row.maxEl.value || row.maxEl.dataset.value); }

  function refreshChip(row) {
    const v = hscValidateMark(row.input.value, currentMax(row));
    const letter = v.valid ? hscGradeFromMarks(v.mark, currentMax(row)) : null;
    row.chip.textContent = letter || '\u2014';
    row.chip.dataset.grade = letter || '';
    row.err.textContent = !v.valid && !v.empty ? v.message : '';
    row.input.setAttribute('aria-invalid', String(!v.valid && !v.empty));
  }

  function setMaxFor(row) {
    const s = HSC_SUBJECTS[row.subjectId];
    row.maxWrap.replaceChildren();
    if (s.maxChoices) {
      const sel = mk('select', 'hsc-max');
      s.maxChoices.forEach(m => { const o = mk('option', '', '/ ' + m); o.value = String(m); sel.append(o); });
      sel.value = String(s.max);
      sel.setAttribute('aria-label', s.name + ' full marks');
      sel.addEventListener('change', () => { invalidate(); refreshChip(row); });
      row.maxEl = sel;
    } else {
      const span = mk('span', 'hsc-max-text', '/ ' + s.max);
      span.dataset.value = String(s.max);
      row.maxEl = span;
    }
    row.maxWrap.append(row.maxEl);
  }

  function clearRow(row) {
    row.grade.value = '';
    row.input.value = '';
    setMaxFor(row);
    refreshChip(row);
    row.input.setAttribute('aria-invalid', 'false');
    row.err.textContent = '';
  }

  function labelRow(row) {
    const s = HSC_SUBJECTS[row.subjectId];
    row.grade.setAttribute('aria-label', s.name + ' grade');
    row.input.setAttribute('aria-label', s.name + ' total marks');
    if (row.hintEl) row.hintEl.textContent = s.hint || '';
  }

  function changeSubject(row, nextId) {
    if (!row.choices || !row.choices.includes(nextId)) return;
    const prevId = row.subjectId;
    const other = rows.find(c => c !== row && c.subjectId === nextId);
    if (other) {
      let replacement = null;
      if (other.choices && other.choices.includes(prevId)) replacement = prevId;
      else if (other.choices) {
        replacement = other.choices.find(id => id !== nextId && !rows.some(c => c !== other && c !== row && c.subjectId === id));
      }
      if (!replacement) { row.select.value = prevId; return; }
      other.subjectId = replacement;
      other.select.value = replacement;
      clearRow(other);
      labelRow(other);
    }
    row.subjectId = nextId;
    row.select.value = nextId;
    clearRow(row);
    labelRow(row);
    invalidate();
  }

  function createRow(spec, index, optional) {
    const subjectId = typeof spec === 'string' ? spec : spec.id;
    const choices = typeof spec === 'string' ? null : spec.choices;
    const row = { subjectId: subjectId, choices: choices, optional: optional };
    const el = mk('div', 'hsc-row');
    row.el = el;

    const nameCell = mk('div', 'hsc-name-cell');
    if (choices) {
      row.select = mk('select', 'hsc-subject-select');
      row.select.id = 'hscSubject' + index;
      row.select.setAttribute('aria-label', optional ? 'Fourth subject' : 'Choose subject ' + (index + 1));
      choices.forEach(id => { const o = mk('option', '', HSC_SUBJECTS[id].name); o.value = id; row.select.append(o); });
      row.select.value = subjectId;
      row.select.addEventListener('change', () => changeSubject(row, row.select.value));
      nameCell.append(row.select);
    } else {
      nameCell.append(mk('span', 'hsc-name', HSC_SUBJECTS[subjectId].name));
    }
    row.hintEl = mk('span', 'hsc-hint');
    nameCell.append(row.hintEl);

    const field = mk('div', 'hsc-field');

    row.grade = mk('select', 'hsc-grade');
    row.grade.id = 'hscGrade' + index;
    const ph = mk('option', '', optional ? 'None' : 'Grade');
    ph.value = '';
    row.grade.append(ph);
    HSC_BANDS.forEach(b => { const o = mk('option', '', b.letter); o.value = b.letter; row.grade.append(o); });
    row.grade.addEventListener('change', invalidate);

    const marks = mk('div', 'hsc-marks');
    row.input = mk('input', 'hsc-input');
    row.input.type = 'text';
    row.input.inputMode = 'numeric';
    row.input.autocomplete = 'off';
    row.input.maxLength = 3;
    row.input.id = 'hscMarks' + index;
    row.input.placeholder = optional ? 'Optional' : 'Marks';
    row.maxWrap = mk('span', 'hsc-max-wrap');
    row.chip = mk('span', 'hsc-chip', '\u2014');
    marks.append(row.input, row.maxWrap, row.chip);

    row.err = mk('p', 'hsc-err');
    row.err.id = 'hscErr' + index;
    row.err.setAttribute('role', 'alert');
    row.input.setAttribute('aria-describedby', row.err.id);

    field.append(row.grade, marks);
    el.append(nameCell, field, row.err);

    setMaxFor(row);
    labelRow(row);
    row.input.addEventListener('input', () => {
      const cleaned = cleanDigits(row.input.value);
      if (cleaned !== row.input.value) row.input.value = cleaned;
      el.classList.remove('is-error');
      resultBox.hidden = true;
      msgEl.textContent = '';
      refreshChip(row);
    });
    return row;
  }

  function buildGroup(next) {
    group = next;
    const cfg = HSC_GROUPS[group];
    mainCount = cfg.main.length;
    mainBox.replaceChildren();
    fourthBox.replaceChildren();
    rows = cfg.main.map((spec, i) => createRow(spec, i, false));
    rows.push(createRow(cfg.optional, mainCount, true));
    rows.slice(0, mainCount).forEach(r => mainBox.append(r.el));
    fourthBox.append(rows[mainCount].el);
    if (countEl) countEl.textContent = String(mainCount);
    invalidate();
  }

  /* Read one row into { name, letter, blank, error } for the active input mode. */
  function readRow(row) {
    const name = HSC_SUBJECTS[row.subjectId].name;
    if (mode === 'grade') {
      const letter = row.grade.value || null;
      return { name: name, letter: letter, blank: !letter, error: false };
    }
    const max = currentMax(row);
    const v = hscValidateMark(row.input.value, max);
    if (v.empty) return { name: name, letter: null, blank: true, error: false };
    if (!v.valid) return { name: name, letter: null, blank: false, error: true };
    return { name: name, letter: hscGradeFromMarks(v.mark, max), blank: false, error: false };
  }

  function showResult(res, main, fourth) {
    resultBox.replaceChildren();
    const failedNames = res.failedIndexes.map(i => main[i].name);
    const head = mk('div', 'hsc-res-head');
    const big = mk('div', 'hsc-res-big');
    big.append(mk('span', 'hsc-res-gpa', res.passed ? f2(res.gpaHundredths) : '\u2014'), mk('span', 'hsc-res-max', '/ 5.00'));
    const pill = mk('span', 'hsc-pill', res.passed ? 'Pass' : 'Fail');
    pill.dataset.state = res.passed ? 'pass' : 'fail';
    head.append(big, pill);
    resultBox.append(head);

    if (!res.passed) {
      resultBox.append(mk('p', 'hsc-res-note', 'Failed: ' + failedNames.join(', ') + '. No GPA is given when a main subject fails.'));
    }

    const stats = mk('div', 'hsc-stats');
    const stat = (label, value) => {
      const b = mk('div', 'hsc-stat');
      b.append(mk('span', 'hsc-stat-val', value), mk('span', 'hsc-stat-label', label));
      return b;
    };
    stats.append(
      stat('Main subjects GPA', f2(res.mainGpaHundredths)),
      stat('4th subject bonus', fourth.letter ? '+' + gp2(res.bonus) : 'None'),
      stat('Total points', gp2(res.total))
    );
    resultBox.append(stats);

    const det = mk('details', 'hsc-details');
    det.append(mk('summary', '', 'Show calculation'));
    const line = (a, b) => {
      const p = mk('p', 'hsc-line');
      p.append(mk('strong', '', a + ': '), document.createTextNode(b));
      det.append(p);
    };
    const pts = main.map(r => gp2(hscPoint(r.letter)));
    line('Main points', pts.join(' + ') + ' = ' + gp2(res.mainTotal));
    line('4th subject', fourth.letter
      ? fourth.name + ' ' + fourth.letter + ': max(0, ' + gp2(hscPoint(fourth.letter)) + ' \u2212 2.00) = ' + gp2(res.bonus)
      : 'not entered, bonus 0.00');
    line('Total', gp2(res.mainTotal) + ' + ' + gp2(res.bonus) + ' = ' + gp2(res.total));
    if (res.passed) {
      line('GPA', gp2(res.total) + ' \u00F7 ' + res.n + ' = ' + (res.total / res.n).toFixed(4) + (res.capped ? ', capped at 5.00' : '') + ' \u2192 ' + f2(res.gpaHundredths));
    }
    resultBox.append(det);

    const note = 'Estimate only. Your official result is the one published by your education board.' +
      (mode === 'marks' ? ' Marks mode cannot see separate MCQ, written or practical pass marks; if your marksheet shows F in any part, choose Grade mode and select F.' : '');
    resultBox.append(mk('p', 'hsc-fine', note));
    resultBox.hidden = false;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (resultBox.scrollIntoView) resultBox.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }

  function calculate() {
    invalidate();
    const read = rows.map(readRow);
    const main = read.slice(0, mainCount);
    const fourth = read[mainCount];
    const problems = [];
    main.forEach((r, i) => {
      if (r.blank || r.error) { problems.push(r.name); rows[i].el.classList.add('is-error'); }
    });
    if (fourth.error) { problems.push(fourth.name + ' (4th)'); rows[mainCount].el.classList.add('is-error'); }
    if (problems.length) {
      msgEl.textContent = (mode === 'grade' ? 'Select a grade for: ' : 'Enter valid marks for: ') + problems.join(', ') + '.';
      const first = rows.find(r => r.el.classList.contains('is-error'));
      if (first) (mode === 'grade' ? first.grade : first.input).focus();
      return;
    }
    const res = hscCalculate(main.map(r => r.letter), fourth.letter, mainCount);
    if (!res) { msgEl.textContent = 'Something went wrong. Please check your entries.'; return; }
    showResult(res, main, fourth);
  }

  function setMode(next) {
    if (next === mode) return;
    if (next === 'grade') {
      // Carry valid marks over so nothing the user typed is lost.
      rows.forEach(r => {
        const v = hscValidateMark(r.input.value, currentMax(r));
        if (v.valid) r.grade.value = hscGradeFromMarks(v.mark, currentMax(r));
      });
    }
    mode = next;
    form.dataset.mode = mode;
    rows.forEach(refreshChip);
    invalidate();
  }

  form.addEventListener('submit', e => { e.preventDefault(); calculate(); });
  form.querySelectorAll('input[name="hscGroup"]').forEach(i => {
    i.addEventListener('change', () => { if (i.checked) buildGroup(i.value); });
  });
  form.querySelectorAll('input[name="hscMode"]').forEach(i => {
    i.addEventListener('change', () => { if (i.checked) setMode(i.value); });
  });
  resetBtn.addEventListener('click', () => { buildGroup(group); });

  form.dataset.mode = mode;
  buildGroup(group);
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hscInit);
  else hscInit();
}

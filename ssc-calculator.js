'use strict';
/* SSC GPA Calculator (Bangladesh): engine + UI.
   The engine is pure (no DOM) so it can be tested on its own in Node. */

/* ---------- Grading scale (all Bangladesh general education boards) ---------- */
const SSC_BANDS = Object.freeze([
  { min: 80, letter: 'A+', point: 5 },
  { min: 70, letter: 'A', point: 4 },
  { min: 60, letter: 'A-', point: 3.5 },
  { min: 50, letter: 'B', point: 3 },
  { min: 40, letter: 'C', point: 2 },
  { min: 33, letter: 'D', point: 1 },
  { min: 0, letter: 'F', point: 0 }
]);

/* max: default full marks. maxChoices: only where sources disagree (ICT 50 vs 100). */
const SSC_SUBJECTS = Object.freeze({
  bangla: { name: 'Bangla', hint: '1st + 2nd paper', max: 200 },
  english: { name: 'English', hint: '1st + 2nd paper', max: 200 },
  math: { name: 'General Mathematics', max: 100 },
  religion: { name: 'Religion & Moral Education', max: 100 },
  bgs: { name: 'Bangladesh & Global Studies', max: 100 },
  ict: { name: 'ICT', max: 50, maxChoices: [50, 100] },
  generalScience: { name: 'General Science', max: 100 },
  physics: { name: 'Physics', max: 100 },
  chemistry: { name: 'Chemistry', max: 100 },
  biology: { name: 'Biology', max: 100 },
  higherMath: { name: 'Higher Mathematics', max: 100 },
  accounting: { name: 'Accounting', max: 100 },
  finance: { name: 'Finance & Banking', max: 100 },
  entrepreneurship: { name: 'Business Entrepreneurship', max: 100 },
  geography: { name: 'Geography & Environment', max: 100 },
  history: { name: 'History of Bangladesh & World Civilization', max: 100 },
  civics: { name: 'Civics & Citizenship', max: 100 },
  economics: { name: 'Economics', max: 100 },
  agriculture: { name: 'Agriculture Studies', max: 100 },
  homeScience: { name: 'Home Science', max: 100 }
});

const SSC_COMMON = ['bangla', 'english', 'math', 'religion', 'bgs', 'ict'];
const SSC_HUM_CHOICES = ['geography', 'history', 'civics', 'economics'];

/* main: ordered rows. A row is a subject id (fixed) or { id, choices } (selectable). */
const SSC_GROUPS = Object.freeze({
  science: {
    main: SSC_COMMON.concat(['physics', 'chemistry', { id: 'biology', choices: ['biology', 'higherMath'] }]),
    optional: { id: 'higherMath', choices: ['higherMath', 'biology', 'agriculture', 'homeScience'] }
  },
  business: {
    main: SSC_COMMON.concat(['generalScience', 'accounting', 'finance', 'entrepreneurship']),
    optional: { id: 'agriculture', choices: ['agriculture', 'homeScience'] }
  },
  humanities: {
    main: SSC_COMMON.concat([
      'generalScience',
      { id: 'geography', choices: SSC_HUM_CHOICES },
      { id: 'history', choices: SSC_HUM_CHOICES },
      { id: 'civics', choices: SSC_HUM_CHOICES }
    ]),
    optional: { id: 'agriculture', choices: ['agriculture', 'homeScience'].concat(SSC_HUM_CHOICES) }
  }
});

/* ---------- Engine ---------- */
function sscValidateMark(raw, max) {
  const v = String(raw == null ? '' : raw).trim();
  if (!v) return { valid: false, empty: true, message: '' };
  if (!/^\d+$/.test(v)) return { valid: false, empty: false, message: 'Whole number only' };
  const mark = Number(v);
  if (mark > max) return { valid: false, empty: false, message: 'Max is ' + max };
  return { valid: true, empty: false, mark: mark, message: '' };
}
/* Integer comparison (mark*100 >= min*max) so 79.5% can never round up to A+. */
function sscGradeFromMarks(mark, max) {
  if (!Number.isInteger(mark) || !Number.isInteger(max) || max <= 0 || mark < 0 || mark > max) return null;
  return SSC_BANDS.find(b => mark * 100 >= b.min * max).letter;
}
function sscPoint(letter) {
  const b = SSC_BANDS.find(x => x.letter === letter);
  return b ? b.point : null;
}
function sscBonus(point) {
  return typeof point === 'number' && point >= 0 && point <= 5 ? Math.max(0, point - 2) : null;
}
/* Round (numerator / n) to the nearest integer with exact integer maths (half rounds up). */
function sscDivRound(numerator, n) {
  const q = Math.floor(numerator / n);
  const r = numerator - q * n;
  return 2 * r >= n ? q + 1 : q;
}
/* mainLetters: array of letters for the main subjects (length must equal expectedMain).
   fourthLetter: letter of the fourth subject, or null/undefined when there is none.
   Returns hundredths so callers never touch floating point GPA values. */
function sscCalculate(mainLetters, fourthLetter, expectedMain) {
  if (!Array.isArray(mainLetters) || !Number.isInteger(expectedMain) || expectedMain < 1 || mainLetters.length !== expectedMain) return null;
  const points = mainLetters.map(sscPoint);
  if (points.some(p => p === null)) return null;
  let bonus = 0;
  if (fourthLetter) {
    const fp = sscPoint(fourthLetter);
    if (fp === null) return null;
    bonus = sscBonus(fp);
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
    mainGpaHundredths: sscDivRound(mainHalves * 50, n),
    failedIndexes: failed,
    passed: failed.length === 0,
    gpaHundredths: failed.length ? null : Math.min(500, sscDivRound(totalHalves * 50, n)),
    capped: failed.length === 0 && totalHalves * 50 > 500 * n
  };
}
const SSCEngine = Object.freeze({
  BANDS: SSC_BANDS, GROUPS: SSC_GROUPS, SUBJECTS: SSC_SUBJECTS,
  validateMark: sscValidateMark, gradeFromMarks: sscGradeFromMarks, point: sscPoint,
  bonus: sscBonus, calculate: sscCalculate
});
if (typeof module !== 'undefined' && module.exports) module.exports = SSCEngine;

/* ---------- UI ---------- */
function sscInit() {
  const form = document.getElementById('sscForm');
  const mainBox = document.getElementById('sscMainRows');
  const fourthBox = document.getElementById('sscFourthRows');
  const resultBox = document.getElementById('sscResult');
  const msgEl = document.getElementById('sscFormMessage');
  const resetBtn = document.getElementById('sscReset');
  const countEl = document.getElementById('sscMainCount');
  if (!form || !mainBox || !fourthBox || !resultBox || !msgEl || !resetBtn) return;

  let group = 'science';
  let mode = 'grade';
  let rows = [];
  let mainCount = 9;

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
    const v = sscValidateMark(row.input.value, currentMax(row));
    const letter = v.valid ? sscGradeFromMarks(v.mark, currentMax(row)) : null;
    row.chip.textContent = letter || '\u2014';
    row.chip.dataset.grade = letter || '';
    row.err.textContent = !v.valid && !v.empty ? v.message : '';
    row.input.setAttribute('aria-invalid', String(!v.valid && !v.empty));
  }

  function setMaxFor(row) {
    const s = SSC_SUBJECTS[row.subjectId];
    row.maxWrap.replaceChildren();
    if (s.maxChoices) {
      const sel = mk('select', 'ssc-max');
      s.maxChoices.forEach(m => { const o = mk('option', '', '/ ' + m); o.value = String(m); sel.append(o); });
      sel.value = String(s.max);
      sel.setAttribute('aria-label', s.name + ' full marks');
      sel.addEventListener('change', () => { invalidate(); refreshChip(row); });
      row.maxEl = sel;
    } else {
      const span = mk('span', 'ssc-max-text', '/ ' + s.max);
      span.dataset.value = String(s.max);
      row.maxEl = span;
    }
    row.maxWrap.append(row.maxEl);
  }

  function paintPills(row) {
    if (!row.pills) return;
    row.pills.querySelectorAll('button').forEach(b => {
      const on = b.dataset.grade === row.grade.value;
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('is-on', on);
    });
  }

  function clearRow(row) {
    row.grade.value = '';
    paintPills(row);
    row.input.value = '';
    setMaxFor(row);
    refreshChip(row);
    row.input.setAttribute('aria-invalid', 'false');
    row.err.textContent = '';
  }

  function labelRow(row) {
    const s = SSC_SUBJECTS[row.subjectId];
    row.grade.setAttribute('aria-label', s.name + ' grade');
    if (row.pills) row.pills.setAttribute('aria-label', s.name + ' grade');
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
    const el = mk('div', 'ssc-row');
    row.el = el;

    const nameCell = mk('div', 'ssc-name-cell');
    if (choices) {
      row.select = mk('select', 'ssc-subject-select');
      row.select.id = 'sscSubject' + index;
      row.select.setAttribute('aria-label', optional ? 'Fourth subject' : 'Choose subject ' + (index + 1));
      choices.forEach(id => { const o = mk('option', '', SSC_SUBJECTS[id].name); o.value = id; row.select.append(o); });
      row.select.value = subjectId;
      row.select.addEventListener('change', () => changeSubject(row, row.select.value));
      nameCell.append(row.select);
    } else {
      nameCell.append(mk('span', 'ssc-name', SSC_SUBJECTS[subjectId].name));
    }
    row.hintEl = mk('span', 'ssc-hint');
    nameCell.append(row.hintEl);

    const field = mk('div', 'ssc-field');

    row.grade = mk('select', 'ssc-grade');
    row.grade.id = 'sscGrade' + index;
    const ph = mk('option', '', optional ? 'None' : 'Grade');
    ph.value = '';
    row.grade.append(ph);
    SSC_BANDS.forEach(b => { const o = mk('option', '', b.letter); o.value = b.letter; row.grade.append(o); });
    row.grade.addEventListener('change', () => { paintPills(row); invalidate(); });

    // Tap-to-pick grade buttons (the <select> above stays as the source of truth, hidden by CSS).
    row.pills = mk('div', 'ssc-pills');
    row.pills.setAttribute('role', 'group');
    SSC_BANDS.forEach(b => {
      const btn = mk('button', 'ssc-pill-btn', b.letter);
      btn.type = 'button';
      btn.dataset.grade = b.letter;
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => {
        row.grade.value = row.grade.value === b.letter ? '' : b.letter; // tap again to unselect
        row.grade.dispatchEvent(new Event('change'));
        row.el.classList.remove('is-error');
      });
      row.pills.append(btn);
    });

    const marks = mk('div', 'ssc-marks');
    row.input = mk('input', 'ssc-input');
    row.input.type = 'text';
    row.input.inputMode = 'numeric';
    row.input.autocomplete = 'off';
    row.input.maxLength = 3;
    row.input.id = 'sscMarks' + index;
    row.input.placeholder = optional ? 'Optional' : 'Marks';
    row.maxWrap = mk('span', 'ssc-max-wrap');
    row.chip = mk('span', 'ssc-chip', '\u2014');
    marks.append(row.input, row.maxWrap, row.chip);

    row.err = mk('p', 'ssc-err');
    row.err.id = 'sscErr' + index;
    row.err.setAttribute('role', 'alert');
    row.input.setAttribute('aria-describedby', row.err.id);

    field.append(row.grade, row.pills, marks);
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
    const cfg = SSC_GROUPS[group];
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
    const name = SSC_SUBJECTS[row.subjectId].name;
    if (mode === 'grade') {
      const letter = row.grade.value || null;
      return { name: name, letter: letter, blank: !letter, error: false };
    }
    const max = currentMax(row);
    const v = sscValidateMark(row.input.value, max);
    if (v.empty) return { name: name, letter: null, blank: true, error: false };
    if (!v.valid) return { name: name, letter: null, blank: false, error: true };
    return { name: name, letter: sscGradeFromMarks(v.mark, max), blank: false, error: false };
  }

  function showResult(res, main, fourth) {
    resultBox.replaceChildren();
    const failedNames = res.failedIndexes.map(i => main[i].name);
    const head = mk('div', 'ssc-res-head');
    const big = mk('div', 'ssc-res-big');
    big.append(mk('span', 'ssc-res-gpa', res.passed ? f2(res.gpaHundredths) : '\u2014'), mk('span', 'ssc-res-max', '/ 5.00'));
    const pill = mk('span', 'ssc-pill', res.passed ? 'Pass' : 'Fail');
    pill.dataset.state = res.passed ? 'pass' : 'fail';
    head.append(big, pill);
    resultBox.append(head);

    if (!res.passed) {
      resultBox.append(mk('p', 'ssc-res-note', 'Failed: ' + failedNames.join(', ') + '. No GPA is given when a main subject fails.'));
    }

    const stats = mk('div', 'ssc-stats');
    const stat = (label, value) => {
      const b = mk('div', 'ssc-stat');
      b.append(mk('span', 'ssc-stat-val', value), mk('span', 'ssc-stat-label', label));
      return b;
    };
    stats.append(
      stat('Main subjects GPA', f2(res.mainGpaHundredths)),
      stat('4th subject bonus', fourth.letter ? '+' + gp2(res.bonus) : 'None'),
      stat('Total points', gp2(res.total))
    );
    resultBox.append(stats);

    const det = mk('details', 'ssc-details');
    det.append(mk('summary', '', 'Show calculation'));
    const line = (a, b) => {
      const p = mk('p', 'ssc-line');
      p.append(mk('strong', '', a + ': '), document.createTextNode(b));
      det.append(p);
    };
    const pts = main.map(r => gp2(sscPoint(r.letter)));
    line('Main points', pts.join(' + ') + ' = ' + gp2(res.mainTotal));
    line('4th subject', fourth.letter
      ? fourth.name + ' ' + fourth.letter + ': max(0, ' + gp2(sscPoint(fourth.letter)) + ' \u2212 2.00) = ' + gp2(res.bonus)
      : 'not entered, bonus 0.00');
    line('Total', gp2(res.mainTotal) + ' + ' + gp2(res.bonus) + ' = ' + gp2(res.total));
    if (res.passed) {
      line('GPA', gp2(res.total) + ' \u00F7 ' + res.n + ' = ' + (res.total / res.n).toFixed(4) + (res.capped ? ', capped at 5.00' : '') + ' \u2192 ' + f2(res.gpaHundredths));
    }
    resultBox.append(det);

    const note = 'Estimate only. Your official result is the one published by your education board.' +
      (mode === 'marks' ? ' Marks mode cannot see separate MCQ, written or practical pass marks; if your marksheet shows F in any part, choose Grade mode and select F.' : '');
    resultBox.append(mk('p', 'ssc-fine', note));
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
      if (first) (mode === 'grade' ? first.pills.querySelector('button') : first.input).focus();
      return;
    }
    const res = sscCalculate(main.map(r => r.letter), fourth.letter, mainCount);
    if (!res) { msgEl.textContent = 'Something went wrong. Please check your entries.'; return; }
    showResult(res, main, fourth);
  }

  function setMode(next) {
    if (next === mode) return;
    if (next === 'grade') {
      // Carry valid marks over so nothing the user typed is lost.
      rows.forEach(r => {
        const v = sscValidateMark(r.input.value, currentMax(r));
        if (v.valid) { r.grade.value = sscGradeFromMarks(v.mark, currentMax(r)); paintPills(r); }
      });
    }
    mode = next;
    form.dataset.mode = mode;
    rows.forEach(refreshChip);
    invalidate();
  }

  form.addEventListener('submit', e => { e.preventDefault(); calculate(); });
  form.querySelectorAll('input[name="sscGroup"]').forEach(i => {
    i.addEventListener('change', () => { if (i.checked) buildGroup(i.value); });
  });
  form.querySelectorAll('input[name="sscMode"]').forEach(i => {
    i.addEventListener('change', () => { if (i.checked) setMode(i.value); });
  });
  resetBtn.addEventListener('click', () => { buildGroup(group); });

  form.dataset.mode = mode;
  buildGroup(group);
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sscInit);
  else sscInit();
}

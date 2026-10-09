'use strict';
/* SSC GPA Calculator (Bangladesh): engine + UI.
   Engine is pure (no DOM) so it can be verified independently. */

const SSC_GRADE_BANDS = Object.freeze([
  { minimum: 80, letter: 'A+', point: 5 },
  { minimum: 70, letter: 'A', point: 4 },
  { minimum: 60, letter: 'A-', point: 3.5 },
  { minimum: 50, letter: 'B', point: 3 },
  { minimum: 40, letter: 'C', point: 2 },
  { minimum: 33, letter: 'D', point: 1 },
  { minimum: 0, letter: 'F', point: 0 }
]);

const SSC_MAXIMUMS = Object.freeze([50, 100, 200]);

const SSC_SUBJECTS = Object.freeze({
  bangla: { name: 'Bangla', label: 'Bangla (1st + 2nd paper)', maximum: 200 },
  english: { name: 'English', label: 'English (1st + 2nd paper)', maximum: 200 },
  math: { name: 'General Mathematics', maximum: 100 },
  religion: { name: 'Religion and Moral Education', maximum: 100 },
  bgs: { name: 'Bangladesh and Global Studies', maximum: 100 },
  ict: { name: 'ICT', maximum: 50 },
  generalScience: { name: 'General Science', maximum: 100 },
  physics: { name: 'Physics', maximum: 100 },
  chemistry: { name: 'Chemistry', maximum: 100 },
  biology: { name: 'Biology', maximum: 100 },
  higherMath: { name: 'Higher Mathematics', maximum: 100 },
  accounting: { name: 'Accounting', maximum: 100 },
  finance: { name: 'Finance and Banking', maximum: 100 },
  entrepreneurship: { name: 'Business Entrepreneurship', maximum: 100 },
  geography: { name: 'Geography and Environment', maximum: 100 },
  history: { name: 'History of Bangladesh and World Civilization', maximum: 100 },
  civics: { name: 'Civics and Citizenship', maximum: 100 },
  economics: { name: 'Economics', maximum: 100 },
  agriculture: { name: 'Agriculture Studies', maximum: 100 },
  homeScience: { name: 'Home Science', maximum: 100 }
});

const SSC_COMMON = ['bangla', 'english', 'math', 'religion', 'bgs', 'ict'];
const SSC_HUMANITIES_CHOICES = ['geography', 'history', 'civics', 'economics'];

/* main: ordered rows. A row is a subject id (fixed) or { id, choices } (selectable).
   optional: default fourth subject and the subjects it may be. */
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
      { id: 'geography', choices: SSC_HUMANITIES_CHOICES },
      { id: 'history', choices: SSC_HUMANITIES_CHOICES },
      { id: 'civics', choices: SSC_HUMANITIES_CHOICES }
    ]),
    optional: { id: 'agriculture', choices: ['agriculture', 'homeScience'].concat(SSC_HUMANITIES_CHOICES) }
  }
});

function sscValidateMark(rawValue, maximum) {
  maximum = maximum || 100;
  const value = String(rawValue == null ? '' : rawValue).trim();
  if (!value) return { valid: false, empty: true, message: 'Enter this subject\u2019s total marks.' };
  if (!SSC_MAXIMUMS.includes(maximum)) return { valid: false, empty: false, message: 'Select a valid maximum.' };
  if (!/^\d+$/.test(value)) {
    return { valid: false, empty: false, message: 'Enter a whole-number mark between 0 and ' + maximum + '.' };
  }
  const mark = Number(value);
  if (!Number.isFinite(mark) || mark < 0 || mark > maximum) {
    return { valid: false, empty: false, message: 'Enter a mark between 0 and ' + maximum + '.' };
  }
  return { valid: true, empty: false, mark: mark, percentage: mark / maximum * 100, message: '' };
}
function sscCalculateGrade(percentage) {
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) return null;
  return SSC_GRADE_BANDS.find(b => percentage >= b.minimum).letter;
}
function sscCalculateGradePoint(letter) {
  const band = SSC_GRADE_BANDS.find(b => b.letter === letter);
  return band ? band.point : null;
}
function sscCalculateOptionalBonus(point) {
  return typeof point === 'number' && Number.isFinite(point) && point >= 0 && point <= 5
    ? Math.max(0, point - 2) : null;
}
function sscDetectFailures(results) {
  return results.filter(r => r.letter === 'F').map(r => r.name);
}
/* options.expectedMain: number of main subjects required (9 Science, 10 Business/Humanities).
   options.noOptional: true when the student has no fourth subject (bonus = 0). */
function sscCalculateFinalGPA(mainResults, optionalPoint, options) {
  options = options || {};
  const n = options.expectedMain;
  if (!Number.isInteger(n) || n < 1 || mainResults.length !== n || mainResults.some(r =>
    !Number.isFinite(r.point) || r.point < 0 || r.point > 5)) return null;
  const bonus = options.noOptional ? 0 : sscCalculateOptionalBonus(optionalPoint);
  if (bonus === null) return null;
  const failed = sscDetectFailures(mainResults);
  const mainTotal = mainResults.reduce((s, r) => s + r.point, 0);
  return {
    count: n, mainTotal: mainTotal, mainGPA: mainTotal / n, bonus: bonus, effectiveTotal: mainTotal + bonus,
    failed: failed, passed: failed.length === 0,
    finalGPA: failed.length ? null : Math.min(5, (mainTotal + bonus) / n)
  };
}
const SSCEngine = Object.freeze({
  validateMark: sscValidateMark, calculateGrade: sscCalculateGrade, calculateGradePoint: sscCalculateGradePoint,
  calculateOptionalBonus: sscCalculateOptionalBonus, detectFailures: sscDetectFailures,
  calculateFinalGPA: sscCalculateFinalGPA, GROUPS: SSC_GROUPS, SUBJECTS: SSC_SUBJECTS
});
if (typeof module !== 'undefined' && module.exports) module.exports = SSCEngine;

function sscInit() {
  const form = document.getElementById('sscForm');
  const rowsContainer = document.getElementById('sscRows');
  const resetButton = document.getElementById('sscReset');
  const exampleButton = document.getElementById('sscExample');
  const noneBox = document.getElementById('sscNoFourth');
  if (!form || !rowsContainer || !resetButton || !exampleButton || !noneBox) return;

  let currentGroup = 'science';
  let rows = [];
  let mainCount = 9;
  let submitted = false;
  let announceTimer;
  const fmt = n => n.toFixed(2);
  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  const mk = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const subjectLabel = id => SSC_SUBJECTS[id].label || SSC_SUBJECTS[id].name;

  function clearRow(row) {
    row.input.value = '';
    row.component.checked = false;
    row.touched = false;
    row.maximum.value = String(SSC_SUBJECTS[row.subjectId].maximum);
  }
  function changeSubject(row, nextId) {
    if (!row.choices || !row.choices.includes(nextId)) return;
    const previousId = row.subjectId;
    const other = rows.find(c => c !== row && c.subjectId === nextId);
    if (other) {
      let replacement = null;
      if (other.choices && other.choices.includes(previousId)) replacement = previousId;
      else if (other.choices) {
        replacement = other.choices.find(id => id !== nextId && !rows.some(c => c !== other && c !== row && c.subjectId === id));
      }
      if (!replacement) { row.select.value = previousId; return; }
      other.subjectId = replacement;
      other.select.value = replacement;
      clearRow(other);
    }
    row.subjectId = nextId;
    row.select.value = nextId;
    clearRow(row);
    submitted = false;
    renderResults();
    setText('sscFormMessage', 'Subject changed. Enter marks again for the changed subjects.');
  }
  function createRow(spec, index, optional) {
    const subjectId = typeof spec === 'string' ? spec : spec.id;
    const choices = typeof spec === 'string' ? null : spec.choices;
    const el = mk('div', 'ssc-row' + (optional ? ' is-optional' : ''));
    const subjectCell = mk('div', 'ssc-subject');
    const label = mk('label', 'ssc-subject-name');
    const meta = mk('span', 'ssc-subject-meta', optional ? 'Fourth / optional subject' : 'Main subject');
    const row = { subjectId: subjectId, choices: choices, optional: optional, touched: false };
    if (!choices) {
      label.htmlFor = 'sscMarks' + index;
      label.textContent = subjectLabel(subjectId);
      row.fixedLabel = label;
      subjectCell.append(label);
    } else {
      label.classList.add('sr-only');
      label.textContent = optional ? 'Choose your fourth subject' : 'Choose subject ' + (index + 1);
      label.htmlFor = 'sscSubject' + index;
      row.select = mk('select', 'ssc-select');
      row.select.id = 'sscSubject' + index;
      choices.forEach(id => {
        const o = mk('option', '', SSC_SUBJECTS[id].name);
        o.value = id;
        row.select.append(o);
      });
      row.select.value = subjectId;
      row.select.addEventListener('change', () => changeSubject(row, row.select.value));
      subjectCell.append(label, row.select);
    }
    subjectCell.append(meta);

    const marksCell = mk('div', 'ssc-marks');
    const controls = mk('div', 'ssc-marks-controls');
    row.input = mk('input', 'ssc-input');
    row.input.type = 'text';
    row.input.inputMode = 'numeric';
    row.input.autocomplete = 'off';
    row.input.id = 'sscMarks' + index;
    row.input.placeholder = '\u2014';
    row.input.setAttribute('aria-describedby', 'sscError' + index);
    row.maximum = mk('select', 'ssc-max');
    row.maximum.id = 'sscMax' + index;
    SSC_MAXIMUMS.forEach(m => {
      const o = mk('option', '', '/ ' + m);
      o.value = String(m);
      row.maximum.append(o);
    });
    row.maximum.value = String(SSC_SUBJECTS[subjectId].maximum);
    row.error = mk('p', 'ssc-row-error');
    row.error.id = 'sscError' + index;
    controls.append(row.input, row.maximum);
    marksCell.append(controls, row.error);

    const gradeCell = mk('div', 'ssc-grade');
    row.badge = mk('span', 'ssc-badge', '\u2014');
    row.point = mk('span', 'ssc-gp', '\u2014');
    gradeCell.append(row.badge, row.point);

    const compLabel = mk('label', 'ssc-component');
    row.component = mk('input');
    row.component.type = 'checkbox';
    compLabel.append(row.component, mk('span', '', 'Failed a required paper or component'));

    el.append(subjectCell, marksCell, gradeCell, compLabel);
    row.el = el;
    row.input.addEventListener('input', () => { row.touched = true; renderResults(); });
    row.input.addEventListener('blur', () => { row.touched = true; renderResults(); });
    row.maximum.addEventListener('change', renderResults);
    row.component.addEventListener('change', renderResults);
    rowsContainer.append(el);
    return row;
  }
  function switchGroup(group) {
    if (!SSC_GROUPS[group]) return;
    currentGroup = group;
    submitted = false;
    noneBox.checked = false;
    rowsContainer.replaceChildren();
    const cfg = SSC_GROUPS[group];
    mainCount = cfg.main.length;
    rows = cfg.main.map((spec, i) => createRow(spec, i, false));
    rows.push(createRow(cfg.optional, mainCount, true));
    document.getElementById('sscTag').textContent = mainCount + ' main + 1 fourth subject';
    renderResults();
    setText('sscFormMessage', '');
  }
  function readRow(row) {
    const name = SSC_SUBJECTS[row.subjectId].name;
    const maximum = Number(row.maximum.value);
    const skipped = row.optional && noneBox.checked;
    [row.input, row.maximum, row.component].forEach(c => { c.disabled = skipped; });
    if (row.select) row.select.disabled = skipped;
    row.el.classList.toggle('is-skipped', skipped);
    row.input.setAttribute('aria-label', name + ' total marks, out of ' + maximum + (row.optional ? ', fourth subject' : ''));
    row.maximum.setAttribute('aria-label', name + ' maximum marks');
    row.component.setAttribute('aria-label', name + ': failed a required paper or component');
    if (skipped) {
      row.input.setAttribute('aria-invalid', 'false');
      row.error.textContent = '';
      row.badge.textContent = '\u2014';
      row.badge.dataset.grade = '';
      row.point.textContent = '\u2014';
      return { name: name, valid: false, empty: true, skipped: true, letter: null, point: null, optional: true };
    }
    const v = sscValidateMark(row.input.value, maximum);
    const invalid = !v.valid && (submitted || row.touched || !v.empty);
    row.input.setAttribute('aria-invalid', String(invalid));
    row.error.textContent = invalid ? v.message : '';
    const letter = row.component.checked ? 'F' : v.valid ? sscCalculateGrade(v.percentage) : null;
    const point = letter === null ? null : sscCalculateGradePoint(letter);
    row.badge.textContent = letter === null ? '\u2014' : letter;
    row.badge.dataset.grade = letter === null ? '' : letter;
    row.point.textContent = point === null ? '\u2014' : fmt(point);
    return Object.assign({ name: name }, v, { letter: letter, point: point, optional: row.optional, skipped: false });
  }
  function renderBreakdown(mainResults, optional, noOptional, calc) {
    const target = document.getElementById('sscBreakdown');
    if (!target) return;
    target.replaceChildren();
    if (!calc) {
      target.append(mk('p', 'ssc-muted', 'Complete all subjects to see the full calculation.'));
      return;
    }
    const lines = [
      ['Main GP', mainResults.map(r => fmt(r.point)).join(' + ') + ' = ' + fmt(calc.mainTotal)],
      [noOptional ? 'Fourth subject' : 'Fourth subject bonus',
        noOptional ? 'None selected, bonus 0.00' : 'max(0, ' + fmt(optional.point) + ' \u2212 2.00) = ' + fmt(calc.bonus)],
      ['Effective total', fmt(calc.mainTotal) + ' + ' + fmt(calc.bonus) + ' = ' + fmt(calc.effectiveTotal)]
    ];
    if (calc.passed) {
      lines.push(['Final GPA', 'min(5.00, ' + fmt(calc.effectiveTotal) + ' \u00f7 ' + calc.count + ') = ' + fmt(calc.finalGPA)]);
    } else {
      lines.push(['Final GPA', 'Withheld: a main subject failed. Fourth subject points cannot override a failure.']);
    }
    lines.forEach(l => {
      const p = mk('p', 'ssc-line');
      p.append(mk('strong', '', l[0] + ': '), document.createTextNode(l[1]));
      target.append(p);
    });
    if (calc.passed && calc.effectiveTotal > 5 * calc.count) {
      target.append(mk('p', 'ssc-muted', 'The uncapped average exceeds 5.00, so the maximum GPA applies.'));
    }
  }
  function renderResults() {
    const results = rows.map(readRow);
    const mainResults = results.slice(0, mainCount);
    const optional = results[mainCount];
    const noOptional = optional.skipped;
    const counted = results.filter(r => !r.skipped);
    const total = counted.length;
    const entered = counted.filter(r => r.valid).length;
    const mainComplete = mainResults.every(r => r.valid);
    const optionalReady = noOptional || optional.valid;
    const complete = mainComplete && optionalReady;
    const invalid = counted.some(r => !r.valid && !r.empty);
    const failed = sscDetectFailures(mainResults);
    const calc = complete
      ? sscCalculateFinalGPA(mainResults, noOptional ? null : optional.point, { expectedMain: mainCount, noOptional: noOptional })
      : null;
    const progress = entered + ' / ' + total;

    setText('sscProgress', progress);
    setText('sscStickyProgress', progress);
    setText('sscMainGpa', mainComplete
      ? fmt(mainResults.reduce((s, r) => s + r.point, 0) / mainCount) + (failed.length ? ' (failed)' : '') : '\u2014');
    setText('sscBonus', noOptional ? 'None'
      : optional.point === null ? '\u2014' : '+' + fmt(sscCalculateOptionalBonus(optional.point)));

    let state = 'empty', status = 'Awaiting marks';
    let message = 'Enter marks for all main subjects to calculate your final GPA. Enter the fourth subject too to include its bonus.';
    if (failed.length) {
      state = 'fail'; status = 'Overall result: Fail';
      message = 'Failed subject' + (failed.length > 1 ? 's' : '') + ': ' + failed.join(', ') + '. No passing GPA can be reported.';
    } else if (invalid) {
      state = 'invalid'; status = 'Check your marks';
      message = 'Correct the highlighted marks before calculating your final GPA.';
    } else if (calc && calc.passed) {
      state = 'pass'; status = 'Overall result: Pass (estimate)';
      message = noOptional
        ? 'All ' + mainCount + ' main subjects pass under the rules entered here. No fourth subject bonus is included.'
        : 'All ' + mainCount + ' main subjects pass under the rules entered here. Your fourth subject bonus is included.';
    } else if (mainComplete) {
      status = 'Fourth subject needed';
      message = 'Your main subjects are complete. Enter the fourth subject marks, or tick that you have no fourth subject.';
    }
    const gpaText = calc && calc.passed ? fmt(calc.finalGPA) : '\u2014';
    setText('sscGpa', gpaText);
    setText('sscStickyGpa', gpaText);
    setText('sscStatus', status);
    setText('sscStickyStatus', state === 'pass' ? 'Pass' : state === 'fail' ? 'Fail' : '\u2014');
    const statusEl = document.getElementById('sscStatus');
    if (statusEl) statusEl.dataset.state = state;
    setText('sscMessage', message);
    renderBreakdown(mainResults, optional, noOptional, calc);
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => {
      setText('sscAnnounce', status + '. ' + (calc && calc.passed ? 'Final GPA ' + fmt(calc.finalGPA) + '. ' : '') + message);
    }, 350);
    setText('sscFormMessage', '');
    return counted;
  }
  function resetCalculator() {
    const initial = form.querySelector('input[name="sscGroup"][value="science"]');
    if (initial) initial.checked = true;
    switchGroup('science');
    setText('sscFormMessage', 'Calculator reset. All marks have been cleared.');
  }
  function loadExample() {
    // Three A grades and the rest A+ in the main subjects: (5N - 3) points. A+ fourth subject adds 3 = 5N, so GPA 5.00.
    noneBox.checked = false;
    rows.forEach((row, i) => {
      const pct = row.optional ? 80 : (i < 3 ? 70 : 80);
      row.maximum.value = String(SSC_SUBJECTS[row.subjectId].maximum);
      row.input.value = String(pct / 100 * Number(row.maximum.value));
      row.component.checked = false;
      row.touched = true;
    });
    submitted = false;
    renderResults();
    setText('sscFormMessage', 'Example loaded: ' + (5 * mainCount - 3) + ' main grade points + 3 bonus = GPA 5.00.');
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    submitted = true;
    const counted = renderResults();
    const bad = counted.filter(r => !r.valid);
    if (bad.length) {
      setText('sscFormMessage', 'Check marks for: ' + bad.map(r => r.name).join(', ') + '.');
      const idx = rows.findIndex(r => !(r.optional && noneBox.checked) && !sscValidateMark(r.input.value, Number(r.maximum.value)).valid);
      if (idx >= 0) rows[idx].input.focus();
    } else {
      setText('sscFormMessage', 'Calculation updated. See your result and breakdown.');
    }
  });
  form.querySelectorAll('input[name="sscGroup"]').forEach(input => {
    input.addEventListener('change', () => { if (input.checked) switchGroup(input.value); });
  });
  noneBox.addEventListener('change', () => { submitted = false; renderResults(); });
  resetButton.addEventListener('click', resetCalculator);
  exampleButton.addEventListener('click', loadExample);
  switchGroup(currentGroup);

  // Sticky live-result bar: shown while the calculator is on screen but the result card is not.
  const bar = document.getElementById('sscStickyBar');
  const card = document.getElementById('sscResultCard');
  const wrap = document.getElementById('sscCalc');
  if (bar && card && wrap && 'IntersectionObserver' in window) {
    const seen = { card: true, calc: false };
    const update = () => bar.classList.toggle('visible', seen.calc && !seen.card);
    new IntersectionObserver(e => { seen.card = e[0].isIntersecting; update(); }).observe(card);
    new IntersectionObserver(e => { seen.calc = e[0].isIntersecting; update(); }).observe(wrap);
  }
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sscInit);
  else sscInit();
}

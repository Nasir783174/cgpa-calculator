'use strict';
/* HSC Result Calculator (Bangladesh): engine + UI.
   Engine is pure (no DOM) so it can be verified independently. */

const HSC_GRADE_BANDS = Object.freeze([
  { minimum: 80, letter: 'A+', point: 5 },
  { minimum: 70, letter: 'A', point: 4 },
  { minimum: 60, letter: 'A-', point: 3.5 },
  { minimum: 50, letter: 'B', point: 3 },
  { minimum: 40, letter: 'C', point: 2 },
  { minimum: 33, letter: 'D', point: 1 },
  { minimum: 0, letter: 'F', point: 0 }
]);

const HSC_SUBJECTS = Object.freeze({
  bangla: { name: 'Bangla', maximum: 200 },
  english: { name: 'English', maximum: 200 },
  ict: { name: 'ICT', maximum: 100 },
  physics: { name: 'Physics', maximum: 200 },
  chemistry: { name: 'Chemistry', maximum: 200 },
  biology: { name: 'Biology', maximum: 200 },
  higherMath: { name: 'Higher Mathematics', maximum: 200 },
  history: { name: 'History', maximum: 200 },
  civics: { name: 'Civics and Good Governance', maximum: 200 },
  economics: { name: 'Economics', maximum: 200 },
  geography: { name: 'Geography', maximum: 200 },
  logic: { name: 'Logic', maximum: 200 },
  sociology: { name: 'Sociology', maximum: 200 },
  socialWork: { name: 'Social Work', maximum: 200 },
  islamicHistory: { name: 'Islamic History and Culture', maximum: 200 },
  islamicStudies: { name: 'Islamic Studies', maximum: 200 },
  psychology: { name: 'Psychology', maximum: 200 },
  agriculture: { name: 'Agriculture Studies', maximum: 200 },
  accounting: { name: 'Accounting', maximum: 200 },
  finance: { name: 'Finance, Banking and Insurance', maximum: 200 },
  businessManagement: { name: 'Business Organization and Management', maximum: 200 },
  statistics: { name: 'Statistics', maximum: 200 }
});

const HSC_GROUPS = Object.freeze({
  science: {
    defaults: ['physics', 'chemistry', 'biology', 'higherMath'],
    choices: ['physics', 'chemistry', 'biology', 'higherMath', 'statistics', 'agriculture']
  },
  humanities: {
    defaults: ['history', 'civics', 'economics', 'logic'],
    choices: ['history', 'civics', 'economics', 'geography', 'logic', 'sociology',
      'socialWork', 'islamicHistory', 'islamicStudies', 'psychology', 'agriculture', 'statistics']
  },
  business: {
    defaults: ['accounting', 'finance', 'businessManagement', 'statistics'],
    choices: ['accounting', 'finance', 'businessManagement', 'statistics', 'economics', 'agriculture', 'geography']
  }
});

function hscValidateMark(rawValue, maximum) {
  maximum = maximum || 100;
  const value = String(rawValue == null ? '' : rawValue).trim();
  if (!value) return { valid: false, empty: true, message: 'Enter this subject\u2019s total marks.' };
  if (![100, 200].includes(maximum)) return { valid: false, empty: false, message: 'Select a valid maximum.' };
  if (!/^\d+$/.test(value)) {
    return { valid: false, empty: false, message: 'Enter a whole-number mark between 0 and ' + maximum + '.' };
  }
  const mark = Number(value);
  if (!Number.isFinite(mark) || mark < 0 || mark > maximum) {
    return { valid: false, empty: false, message: 'Enter a mark between 0 and ' + maximum + '.' };
  }
  return { valid: true, empty: false, mark: mark, percentage: mark / maximum * 100, message: '' };
}
function hscCalculateGrade(percentage) {
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) return null;
  return HSC_GRADE_BANDS.find(b => percentage >= b.minimum).letter;
}
function hscCalculateGradePoint(letter) {
  const band = HSC_GRADE_BANDS.find(b => b.letter === letter);
  return band ? band.point : null;
}
function hscCalculateOptionalBonus(point) {
  return typeof point === 'number' && Number.isFinite(point) && point >= 0 && point <= 5
    ? Math.max(0, point - 2) : null;
}
function hscDetectFailures(results) {
  return results.filter(r => r.letter === 'F').map(r => r.name);
}
function hscCalculateFinalGPA(mainResults, optionalPoint) {
  if (mainResults.length !== 6 || mainResults.some(r =>
    !Number.isFinite(r.point) || r.point < 0 || r.point > 5)) return null;
  const bonus = hscCalculateOptionalBonus(optionalPoint);
  if (bonus === null) return null;
  const failed = hscDetectFailures(mainResults);
  const mainTotal = mainResults.reduce((s, r) => s + r.point, 0);
  return {
    mainTotal: mainTotal, mainGPA: mainTotal / 6, bonus: bonus, effectiveTotal: mainTotal + bonus,
    failed: failed, passed: failed.length === 0,
    finalGPA: failed.length ? null : Math.min(5, (mainTotal + bonus) / 6)
  };
}
const HSCEngine = Object.freeze({
  validateMark: hscValidateMark, calculateGrade: hscCalculateGrade, calculateGradePoint: hscCalculateGradePoint,
  calculateOptionalBonus: hscCalculateOptionalBonus, detectFailures: hscDetectFailures,
  calculateFinalGPA: hscCalculateFinalGPA
});
if (typeof module !== 'undefined' && module.exports) module.exports = HSCEngine;

function hscInit() {
  const form = document.getElementById('hscForm');
  const rowsContainer = document.getElementById('hscRows');
  const resetButton = document.getElementById('hscReset');
  const exampleButton = document.getElementById('hscExample');
  if (!form || !rowsContainer || !resetButton || !exampleButton) return;

  let currentGroup = 'science';
  let rows = [];
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

  function clearRow(row) {
    row.input.value = '';
    row.component.checked = false;
    row.touched = false;
    row.maximum.value = String(HSC_SUBJECTS[row.subjectId].maximum);
  }
  function changeSubject(row, nextId) {
    if (!HSC_GROUPS[currentGroup].choices.includes(nextId)) return;
    const other = rows.find(c => c !== row && c.subjectId === nextId);
    if (other) {
      other.subjectId = row.subjectId;
      other.select.value = other.subjectId;
      clearRow(other);
    }
    row.subjectId = nextId;
    clearRow(row);
    submitted = false;
    renderResults();
    setText('hscFormMessage', 'Subject changed. Enter marks again for the changed subjects.');
  }
  function createRow(subjectId, index) {
    const optional = index === 6;
    const el = mk('div', 'hsc-row' + (optional ? ' is-optional' : ''));
    const subjectCell = mk('div', 'hsc-subject');
    const label = mk('label', 'hsc-subject-name');
    const meta = mk('span', 'hsc-subject-meta', optional ? 'Fourth / optional subject' : 'Main subject');
    const row = { subjectId: subjectId, optional: optional, touched: false };
    if (index < 3) {
      label.htmlFor = 'hscMarks' + index;
      label.textContent = HSC_SUBJECTS[subjectId].name;
      subjectCell.append(label);
    } else {
      label.classList.add('sr-only');
      label.textContent = optional ? 'Choose your optional subject' : 'Choose main subject ' + (index + 1);
      label.htmlFor = 'hscSubject' + index;
      row.select = mk('select', 'hsc-select');
      row.select.id = 'hscSubject' + index;
      HSC_GROUPS[currentGroup].choices.forEach(id => {
        const o = mk('option', '', HSC_SUBJECTS[id].name);
        o.value = id;
        row.select.append(o);
      });
      row.select.value = subjectId;
      row.select.addEventListener('change', () => changeSubject(row, row.select.value));
      subjectCell.append(label, row.select);
    }
    subjectCell.append(meta);

    const marksCell = mk('div', 'hsc-marks');
    const controls = mk('div', 'hsc-marks-controls');
    row.input = mk('input', 'hsc-input');
    row.input.type = 'text';
    row.input.inputMode = 'numeric';
    row.input.autocomplete = 'off';
    row.input.id = 'hscMarks' + index;
    row.input.placeholder = '\u2014';
    row.input.setAttribute('aria-describedby', 'hscError' + index);
    row.maximum = mk('select', 'hsc-max');
    row.maximum.id = 'hscMax' + index;
    [100, 200].forEach(m => {
      const o = mk('option', '', '/ ' + m);
      o.value = String(m);
      row.maximum.append(o);
    });
    row.maximum.value = String(HSC_SUBJECTS[subjectId].maximum);
    row.error = mk('p', 'hsc-row-error');
    row.error.id = 'hscError' + index;
    controls.append(row.input, row.maximum);
    marksCell.append(controls, row.error);

    const gradeCell = mk('div', 'hsc-grade');
    row.badge = mk('span', 'hsc-badge', '\u2014');
    row.point = mk('span', 'hsc-gp', '\u2014');
    gradeCell.append(row.badge, row.point);

    const compLabel = mk('label', 'hsc-component');
    row.component = mk('input');
    row.component.type = 'checkbox';
    compLabel.append(row.component, mk('span', '', 'Failed a required paper or component'));

    el.append(subjectCell, marksCell, gradeCell, compLabel);
    row.input.addEventListener('input', () => { row.touched = true; renderResults(); });
    row.input.addEventListener('blur', () => { row.touched = true; renderResults(); });
    row.maximum.addEventListener('change', renderResults);
    row.component.addEventListener('change', renderResults);
    rowsContainer.append(el);
    return row;
  }
  function switchGroup(group) {
    if (!HSC_GROUPS[group]) return;
    currentGroup = group;
    submitted = false;
    rowsContainer.replaceChildren();
    rows = ['bangla', 'english', 'ict'].concat(HSC_GROUPS[group].defaults).map(createRow);
    renderResults();
    setText('hscFormMessage', '');
  }
  function readRow(row) {
    const name = HSC_SUBJECTS[row.subjectId].name;
    const maximum = Number(row.maximum.value);
    row.input.setAttribute('aria-label', name + ' total marks, out of ' + maximum + (row.optional ? ', optional subject' : ''));
    row.maximum.setAttribute('aria-label', name + ' maximum marks');
    row.component.setAttribute('aria-label', name + ': failed a required paper or component');
    const v = hscValidateMark(row.input.value, maximum);
    const invalid = !v.valid && (submitted || row.touched || !v.empty);
    row.input.setAttribute('aria-invalid', String(invalid));
    row.error.textContent = invalid ? v.message : '';
    const letter = row.component.checked ? 'F' : v.valid ? hscCalculateGrade(v.percentage) : null;
    const point = letter === null ? null : hscCalculateGradePoint(letter);
    row.badge.textContent = letter === null ? '\u2014' : letter;
    row.badge.dataset.grade = letter === null ? '' : letter;
    row.point.textContent = point === null ? '\u2014' : fmt(point);
    return Object.assign({ name: name }, v, { letter: letter, point: point, optional: row.optional });
  }
  function renderBreakdown(results, calc) {
    const target = document.getElementById('hscBreakdown');
    if (!target) return;
    target.replaceChildren();
    if (!calc) {
      target.append(mk('p', 'hsc-muted', 'Complete all seven subjects to see the full calculation.'));
      return;
    }
    const lines = [
      ['Main GP', results.slice(0, 6).map(r => fmt(r.point)).join(' + ') + ' = ' + fmt(calc.mainTotal)],
      ['Optional bonus', 'max(0, ' + fmt(results[6].point) + ' \u2212 2.00) = ' + fmt(calc.bonus)],
      ['Effective total', fmt(calc.mainTotal) + ' + ' + fmt(calc.bonus) + ' = ' + fmt(calc.effectiveTotal)]
    ];
    if (calc.passed) {
      lines.push(['Final GPA', 'min(5.00, ' + fmt(calc.effectiveTotal) + ' \u00f7 6) = ' + fmt(calc.finalGPA)]);
    } else {
      lines.push(['Final GPA', 'Withheld: a main subject failed. Optional points cannot override a failure.']);
    }
    lines.forEach(l => {
      const p = mk('p', 'hsc-line');
      p.append(mk('strong', '', l[0] + ': '), document.createTextNode(l[1]));
      target.append(p);
    });
    if (calc.passed && calc.effectiveTotal > 30) {
      target.append(mk('p', 'hsc-muted', 'The uncapped average exceeds 5.00, so the maximum GPA applies.'));
    }
  }
  function renderResults() {
    const results = rows.map(readRow);
    const complete = results.every(r => r.valid);
    const invalid = results.some(r => !r.valid && !r.empty);
    const failed = hscDetectFailures(results.slice(0, 6));
    const calc = complete ? hscCalculateFinalGPA(results.slice(0, 6), results[6].point) : null;
    const mainComplete = results.slice(0, 6).every(r => r.valid);
    const optionalPoint = results[6].point;

    setText('hscProgress', results.filter(r => r.valid).length + ' / 7');
    setText('hscMainGpa', mainComplete
      ? fmt(results.slice(0, 6).reduce((s, r) => s + r.point, 0) / 6) + (failed.length ? ' (failed)' : '') : '\u2014');
    setText('hscBonus', optionalPoint === null ? '\u2014' : '+' + fmt(hscCalculateOptionalBonus(optionalPoint)));

    let state = 'empty', status = 'Awaiting marks';
    let message = 'Enter marks for all main subjects to calculate your final GPA. Enter the optional subject too to include its bonus.';
    if (failed.length) {
      state = 'fail'; status = 'Overall result: Fail';
      message = 'Failed subject' + (failed.length > 1 ? 's' : '') + ': ' + failed.join(', ') + '. No passing GPA can be reported.';
    } else if (invalid) {
      state = 'invalid'; status = 'Check your marks';
      message = 'Correct the highlighted marks before calculating your final GPA.';
    } else if (calc && calc.passed) {
      state = 'pass'; status = 'Overall result: Pass (estimate)';
      message = 'All six main subjects pass under the rules entered here. Your optional bonus is included.';
    } else if (mainComplete) {
      status = 'Optional marks needed';
      message = 'Your main subjects are complete. Enter the fourth subject marks to calculate the final GPA.';
    }
    const gpaText = calc && calc.passed ? fmt(calc.finalGPA) : '\u2014';
    setText('hscGpa', gpaText);
    setText('hscStickyGpa', gpaText);
    setText('hscStickyProgress', results.filter(r => r.valid).length + ' / 7');
    setText('hscStatus', status);
    setText('hscStickyStatus', state === 'pass' ? 'Pass' : state === 'fail' ? 'Fail' : '\u2014');
    const statusEl = document.getElementById('hscStatus');
    if (statusEl) statusEl.dataset.state = state;
    setText('hscMessage', message);
    renderBreakdown(results, calc);
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => {
      setText('hscAnnounce', status + '. ' + (calc && calc.passed ? 'Final GPA ' + fmt(calc.finalGPA) + '. ' : '') + message);
    }, 350);
    setText('hscFormMessage', '');
    return results;
  }
  function resetCalculator() {
    const initial = form.querySelector('input[name="hscGroup"][value="science"]');
    if (initial) initial.checked = true;
    switchGroup('science');
    setText('hscFormMessage', 'Calculator reset. All marks have been cleared.');
  }
  function loadExample() {
    // Alternating A+ / A in six main subjects totals 27; optional A+ adds 3.
    const pct = [80, 70, 80, 70, 80, 70, 80];
    rows.forEach((row, i) => {
      row.input.value = String(pct[i] / 100 * Number(row.maximum.value));
      row.component.checked = false;
      row.touched = true;
    });
    submitted = false;
    renderResults();
    setText('hscFormMessage', 'Example loaded: 27 main grade points + 3 optional bonus = GPA 5.00.');
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    submitted = true;
    const results = renderResults();
    const bad = results.filter(r => !r.valid);
    if (bad.length) {
      setText('hscFormMessage', 'Check marks for: ' + bad.map(r => r.name).join(', ') + '.');
      rows[results.findIndex(r => !r.valid)].input.focus();
    } else {
      setText('hscFormMessage', 'Calculation updated. See your result and breakdown.');
    }
  });
  form.querySelectorAll('input[name="hscGroup"]').forEach(input => {
    input.addEventListener('change', () => { if (input.checked) switchGroup(input.value); });
  });
  resetButton.addEventListener('click', resetCalculator);
  exampleButton.addEventListener('click', loadExample);
  switchGroup(currentGroup);

  // Sticky live-result bar: shown while the calculator is on screen but the result card is not.
  const bar = document.getElementById('hscStickyBar');
  const card = document.getElementById('hscResultCard');
  const calc = document.getElementById('hscCalc');
  if (bar && card && calc && 'IntersectionObserver' in window) {
    const seen = { card: true, calc: false };
    const update = () => bar.classList.toggle('visible', seen.calc && !seen.card);
    new IntersectionObserver(e => { seen.card = e[0].isIntersecting; update(); }).observe(card);
    new IntersectionObserver(e => { seen.calc = e[0].isIntersecting; update(); }).observe(calc);
  }
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hscInit);
  else hscInit();
}

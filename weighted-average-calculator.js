/* Weighted Average Calculator: UI logic.
   Requires weighted-math.js (exact decimal/rational arithmetic, exposes window.WeightedMath).
   FAQ accordion and mobile menu are handled by nav.js. */
(function () {
  'use strict';

  var M = window.WeightedMath;
  if (!M) return;

  var $ = function (id) { return document.getElementById(id); };
  var rowsEl = $('wacRows');
  if (!rowsEl) return;

  var stats = null;
  var decimals = 2;
  var targetResult = null;
  var serial = 0;
  var revision = 0;

  var PRESETS = {
    general: [['Item 1', '80', '2'], ['Item 2', '90', '3'], ['Item 3', '70', '5']],
    grades: [['Homework', '80', '20'], ['Midterm', '90', '30'], ['Final', '70', '50']],
    gpa: [['Course 1', '3.5', '3'], ['Course 2', '4', '4'], ['Course 3', '3', '2']],
    price: [['Purchase 1', '10', '100'], ['Purchase 2', '12', '50'], ['Purchase 3', '9', '200']],
    frequency: [['Value 2', '2', '3'], ['Value 4', '4', '2'], ['Value 7', '7', '1']]
  };

  var LABELS = {
    general: ['Value', 'Weight'],
    grades: ['Score (%)', 'Weight'],
    gpa: ['Grade points', 'Credits'],
    price: ['Unit price', 'Quantity'],
    frequency: ['Value', 'Frequency']
  };

  var HELP = {
    general: 'Use one consistent weight scale. Weights can total any positive number.',
    grades: 'Enter percentage scores and syllabus weights. For categories, enter each category\u2019s average. Incomplete weights give a current average.',
    gpa: 'Enter numeric grade points and GPA-eligible credits from your school. Letter grades and honors weighting are not converted automatically.',
    price: 'Enter unit prices and quantities in the same currency and units. Values exclude fees and taxes unless you account for them.',
    frequency: 'Enter each distinct value and its non-negative occurrence count. Counts should be whole numbers for a frequency table.'
  };

  var DEFAULT_TARGET_MESSAGE = 'Enter a target average and the remaining weight.';

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Display formatting: rounds only for display. Tiny nonzero values use scientific notation. */
  function fmt(n, roundUp) {
    var text = M.format(n, decimals, !!roundUp);
    if (!roundUp && n.n !== 0n && /^0(?:\.0+)?$/.test(text)) return M.scientific(n);
    return text;
  }

  function setText(id, value) { var el = $(id); if (el) el.textContent = value; }

  /* Use-case picker is a radio group (name="wacPreset"). */
  function getPreset() {
    var r = document.querySelector('input[name="wacPreset"]:checked');
    return r ? r.value : 'general';
  }
  function setPreset(kind) {
    var r = document.querySelector('input[name="wacPreset"][value="' + kind + '"]');
    if (r) r.checked = true;
  }

  /* The result box stays hidden until the first Calculate / example / import, then updates live. */
  function revealResult() { var box = $('wacResult'); if (box) box.hidden = false; }

  /* ---------- Rows ---------- */
  function createRow(data) {
    data = data || {};
    var el = document.createElement('div');
    el.className = 'wac-row';
    el.setAttribute('role', 'listitem');
    serial += 1;
    var id = serial;
    var titles = LABELS[getPreset()];

    [['label', 'Label (optional)'], ['value', titles[0]], ['weight', titles[1]]].forEach(function (pair) {
      var field = pair[0], title = pair[1];
      var wrap = document.createElement('label');
      wrap.className = 'wac-cell';
      var mobile = document.createElement('span');
      mobile.className = 'wac-mobile-label';
      mobile.textContent = title;
      var input = document.createElement('input');
      input.type = 'text';
      input.className = field;
      input.value = data[field] || '';
      input.autocomplete = 'off';
      input.setAttribute('aria-label', title);
      input.maxLength = field === 'label' ? 80 : 160;
      if (field === 'label') input.placeholder = 'e.g. Final exam';
      else { input.inputMode = 'decimal'; input.placeholder = field === 'value' ? titles[0] : titles[1]; }
      var error = document.createElement('span');
      error.className = 'wac-row-error';
      error.id = 'wacErr-' + id + '-' + field;
      input.setAttribute('aria-describedby', error.id);
      wrap.appendChild(mobile);
      wrap.appendChild(input);
      wrap.appendChild(error);
      el.appendChild(wrap);
    });

    var remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'wac-remove';
    remove.textContent = '\u00d7';
    remove.setAttribute('aria-label', 'Remove row');
    el.appendChild(remove);
    return el;
  }

  function renumber() {
    var titles = LABELS[getPreset()];
    Array.prototype.forEach.call(rowsEl.children, function (el, i) {
      [['label', 'Label (optional)', null], ['value', titles[0], titles[0]], ['weight', titles[1], titles[1]]].forEach(function (f) {
        var input = el.querySelector('.' + f[0]);
        input.setAttribute('aria-label', f[1] + ', row ' + (i + 1));
        input.parentElement.querySelector('.wac-mobile-label').textContent = f[1];
        if (f[2]) input.placeholder = f[2];
      });
      el.querySelector('.wac-remove').setAttribute('aria-label', 'Remove row ' + (i + 1));
    });
    $('wacAddRow').disabled = rowsEl.children.length >= M.MAX_ROWS;
  }

  function readRows() {
    return Array.prototype.map.call(rowsEl.children, function (el) {
      return {
        label: el.querySelector('.label').value,
        value: el.querySelector('.value').value,
        weight: el.querySelector('.weight').value
      };
    });
  }

  function loadRows(list) {
    rowsEl.replaceChildren.apply(rowsEl, list.map(createRow));
    renumber();
    calculate();
  }

  /* ---------- Result display ---------- */
  function setResultDashes() {
    ['wacAverage', 'wacTotal', 'wacSum', 'wacSimple'].forEach(function (id) { setText(id, '\u2014'); });
    setText('wacCount', '0');
    setText('wacStickyAvg', '\u2014');
    setText('wacStickyTotal', '\u2014');
    setText('wacStickyRows', '0');
    $('wacCopy').disabled = true;
    $('wacExport').disabled = true;
    setText('wacStatusLabel', 'Waiting for valid data');
    setText('wacStepsStatus', 'Waiting for valid data');
    $('wacBreakdown').innerHTML = '<p class="wac-help">Enter valid value and weight pairs to see the calculation.</p>';
  }

  function calculate() {
    revision += 1;
    setText('wacActionStatus', '');
    $('wacManualCopy').hidden = true;
    Array.prototype.forEach.call(rowsEl.querySelectorAll('input'), function (i) { i.removeAttribute('aria-invalid'); });
    Array.prototype.forEach.call(rowsEl.querySelectorAll('.wac-row-error'), function (e) { e.textContent = ''; });

    stats = M.analyze(readRows(), $('wacScale').value);
    setText('wacFormError', '');

    if (!stats.average) {
      setResultDashes();
      if (stats.errors.length) {
        stats.errors.forEach(function (e) {
          var input = rowsEl.children[e.row].querySelector('.' + e.field);
          input.setAttribute('aria-invalid', 'true');
          input.parentElement.querySelector('.wac-row-error').textContent = e.message;
        });
        setText('wacFormError', 'Fix the highlighted fields. No partial result is calculated.');
        setText('wacResultNote', 'Complete each value and weight pair.');
      } else {
        setText('wacFormError', stats.message || '');
        setText('wacResultNote', stats.message || 'Add your values and weights to get started.');
      }
      calculateTarget();
      return;
    }

    var average = fmt(stats.average);
    setText('wacAverage', average);
    setText('wacTotal', fmt(stats.total));
    setText('wacSum', fmt(stats.sum));
    setText('wacSimple', fmt(stats.simple));
    setText('wacCount', String(stats.entries.length));
    setText('wacStickyAvg', average);
    setText('wacStickyTotal', fmt(stats.total));
    setText('wacStickyRows', String(stats.entries.length));
    $('wacCopy').disabled = false;
    $('wacExport').disabled = false;
    setText('wacStatusLabel', 'Calculated exactly');
    setText('wacStepsStatus', 'Calculated exactly');

    var scale = $('wacScale').value;
    var base = scale === 'percent' ? M.rat(100n) : M.rat(1n);
    var note = 'Weights are normalized by their actual total.';
    if (scale !== 'relative') {
      var c = M.cmp(stats.total, base);
      var remaining = M.sub(base, stats.total);
      if (c === 0) {
        note = 'Weights total ' + (scale === 'percent' ? '100%.' : '1 (100%).');
      } else if (c < 0) {
        note = 'Weights total ' + fmt(scale === 'percent' ? stats.total : M.mul(stats.total, M.rat(100n))) +
          '%. This is an average of the entered items; ' +
          fmt(scale === 'percent' ? remaining : M.mul(remaining, M.rat(100n))) + '% is unassigned.';
      } else {
        note = 'Weights exceed 100%. Check for duplicated or inconsistent weights. This is a normalized average, not an unnormalized final total.';
      }
    }
    if (stats.entries.some(function (e) { return e.weight.n === 0n; })) note += ' Zero-weight rows do not affect this result.';
    setText('wacResultNote', note);

    var body = stats.entries.map(function (e) {
      var product = M.mul(e.value, e.weight);
      var share = M.div(e.weight, stats.total);
      return '<tr><th scope="row">' + escapeHtml(e.label) + '</th><td>' + fmt(e.value) + ' \u00d7 ' + fmt(e.weight) +
        '</td><td>' + fmt(product) + '</td><td>' + fmt(M.mul(share, M.rat(100n))) + '%</td><td>' +
        fmt(M.mul(e.value, share)) + '</td></tr>';
    }).join('');

    $('wacBreakdown').innerHTML =
      '<div class="table-wrap wac-steps-scroll" tabindex="0" role="region" aria-label="Calculation breakdown table">' +
      '<table><caption class="wac-sr">Each value multiplied by its weight, with normalized shares and contributions</caption>' +
      '<thead><tr><th scope="col">Item</th><th scope="col">Value \u00d7 weight</th><th scope="col">Product</th>' +
      '<th scope="col">Weight share</th><th scope="col">Contribution</th></tr></thead><tbody>' + body + '</tbody></table></div>' +
      '<div class="wac-equation"><strong>Weighted sum \u00f7 total weight</strong><br>' +
      fmt(stats.sum) + ' \u00f7 ' + fmt(stats.total) + ' \u2248 ' + average + '</div>';

    calculateTarget();
  }

  /* ---------- Target solver ---------- */
  function setTargetState(state) {
    var box = $('wacTargetResult');
    box.classList.remove('wac-state-ok', 'wac-state-secured', 'wac-state-bad');
    if (state) box.classList.add('wac-state-' + state);
  }

  function calculateTarget() {
    targetResult = null;
    setText('wacRequired', '\u2014');
    setTargetState(null);
    var ids = ['wacTargetValue', 'wacTargetWeight', 'wacTargetMin', 'wacTargetMax'];
    ids.forEach(function (id) { $(id).removeAttribute('aria-invalid'); });

    var t = $('wacTargetValue').value;
    var w = $('wacTargetWeight').value;
    if (!t.trim() && !w.trim()) { setText('wacTargetMessage', DEFAULT_TARGET_MESSAGE); return; }

    try {
      if ($('wacScale').value === 'fraction' && w.indexOf('%') !== -1) {
        throw new Error('Use decimal proportions for remaining weight, without %.');
      }
      targetResult = M.target(stats, t, w, $('wacTargetMin').value, $('wacTargetMax').value);
      setText('wacRequired', fmt(targetResult.needed, true));
      var message;
      if (targetResult.status === 'unreachable') { message = 'Target is not reachable within your maximum value.'; setTargetState('bad'); }
      else if (targetResult.status === 'secured') { message = 'Your minimum possible value already meets or exceeds this target.'; setTargetState('secured'); }
      else { message = 'This value reaches at least your target.'; setTargetState('ok'); }
      if ($('wacScale').value !== 'relative') {
        var base = $('wacScale').value === 'percent' ? M.rat(100n) : M.rat(1n);
        if (M.cmp(targetResult.combined, base) !== 0) {
          message += ' Completed plus remaining weights do not total 100%; the solver uses their actual combined total.';
        }
      }
      setText('wacTargetMessage', message);
    } catch (e) {
      setText('wacTargetMessage', e.message);
    }
  }

  /* ---------- Use-case configuration ---------- */
  function configure() {
    var kind = getPreset();
    var titles = LABELS[kind];
    setText('wacValueHead', titles[0]);
    setText('wacWeightHead', titles[1]);
    setText('wacUseHelp', HELP[kind]);
    renumber();
  }

  function loadExample(kind) {
    kind = kind || getPreset();
    setPreset(kind);
    $('wacScale').value = kind === 'grades' ? 'percent' : 'relative';
    configure();
    loadRows(PRESETS[kind].map(function (p) { return { label: p[0], value: p[1], weight: p[2] }; }));
    setText('wacFormError', '');
    revealResult();
  }

  /* ---------- Copy and CSV ---------- */
  function calculationText() {
    if (!stats || !stats.average) return '';
    var lines = [
      'Weighted average: ' + fmt(stats.average),
      'Weight format: ' + $('wacScale').selectedOptions[0].textContent,
      'Total weight: ' + fmt(stats.total),
      'Weighted sum: ' + fmt(stats.sum),
      'Simple average of entered rows: ' + fmt(stats.simple),
      'Rows entered: ' + stats.entries.length,
      'Display decimal places: ' + decimals,
      'Interpretation: ' + $('wacResultNote').textContent,
      ''
    ];
    stats.entries.forEach(function (e) {
      lines.push(e.label + ': ' + fmt(e.value) + ' \u00d7 ' + fmt(e.weight) + ' = ' + fmt(M.mul(e.value, e.weight)));
    });
    lines.push('Weighted average = ' + fmt(stats.sum) + ' \u00f7 ' + fmt(stats.total) + ' \u2248 ' + fmt(stats.average));
    lines.push('Displayed values are rounded; calculations use exact inputs.');
    if (targetResult) {
      lines.push('', 'Required remaining value (rounded up): ' + fmt(targetResult.needed, true), $('wacTargetMessage').textContent);
    }
    return lines.join('\n');
  }

  function csvCell(s) {
    s = String(s);
    if (/^[\s]*[=+@-]/.test(s)) {
      try { M.parseNumber(s, true); } catch (e) { s = "'" + s; }
    }
    return '"' + s.replace(/"/g, '""') + '"';
  }

  function copyResult() {
    var text = calculationText();
    var version = revision;
    if (!text) return;
    Promise.resolve().then(function () {
      if (!navigator.clipboard) throw new Error('No clipboard');
      return navigator.clipboard.writeText(text);
    }).then(function () {
      if (version !== revision) return;
      setText('wacActionStatus', 'Calculation copied.');
    }).catch(function () {
      if (version !== revision) return;
      var box = $('wacManualCopy');
      box.hidden = false;
      box.open = true;
      $('wacCopyText').value = text;
      $('wacCopyText').focus();
      $('wacCopyText').select();
      setText('wacActionStatus', 'Automatic copy is unavailable. Copy the selected text below.');
    });
  }

  function exportCsv() {
    if (!stats || !stats.average) return;
    var active = readRows().filter(function (e) { return e.value.trim() || e.weight.trim(); });
    var lines = [['Label', 'Value', 'Weight']].concat(active.map(function (e) { return [e.label, e.value, e.weight]; }));
    lines.push([], ['Metric', 'Displayed result'],
      ['Weighted average', fmt(stats.average)],
      ['Total weight', fmt(stats.total)],
      ['Weighted sum', fmt(stats.sum)],
      ['Simple average', fmt(stats.simple)],
      ['Weight format', $('wacScale').selectedOptions[0].textContent],
      ['Interpretation', $('wacResultNote').textContent],
      ['Decimals', decimals],
      ['Note', 'Input text is preserved; displayed results are rounded. Import only the first Label/Value/Weight table.']);
    if (targetResult) {
      lines.push(['Required remaining value (rounded up)', fmt(targetResult.needed, true)], ['Target interpretation', $('wacTargetMessage').textContent]);
    }
    var csv = '\uFEFF' + lines.map(function (line) { return line.map(csvCell).join(','); }).join('\r\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'weighted-average-calculation.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    setText('wacActionStatus', 'Calculation CSV downloaded.');
  }

  /* ---------- Events ---------- */
  rowsEl.addEventListener('input', calculate);
  rowsEl.addEventListener('click', function (event) {
    var btn = event.target.closest('.wac-remove');
    if (!btn) return;
    var index = Array.prototype.indexOf.call(rowsEl.children, btn.parentElement);
    btn.parentElement.remove();
    if (!rowsEl.children.length) rowsEl.appendChild(createRow());
    renumber();
    calculate();
    rowsEl.children[Math.min(index, rowsEl.children.length - 1)].querySelector('input').focus();
  });

  $('wacAddRow').addEventListener('click', function () {
    if (rowsEl.children.length >= M.MAX_ROWS) return;
    rowsEl.appendChild(createRow());
    renumber();
    calculate();
    rowsEl.lastElementChild.querySelector('input').focus();
  });

  Array.prototype.forEach.call(document.querySelectorAll('input[name="wacPreset"]'), function (radio) {
    radio.addEventListener('change', function () {
      if (!radio.checked) return;
      $('wacScale').value = radio.value === 'grades' ? 'percent' : 'relative';
      configure();
      calculate();
    });
  });

  /* Calculate button (and Enter key): show the result box and surface any invalid fields. */
  $('wacForm').addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
    revealResult();
    var bad = rowsEl.querySelector('input[aria-invalid="true"]');
    if (bad) { bad.focus(); return; }
    var box = $('wacResult');
    if (box && box.scrollIntoView) box.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  });
  $('wacExample').addEventListener('click', function () { loadExample(); });

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('[data-example]'), function (b) {
    b.addEventListener('click', function () {
      loadExample(b.getAttribute('data-example'));
      $('wacCalc').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      rowsEl.firstElementChild.querySelector('.value').focus({ preventScroll: true });
    });
  });

  $('wacScale').addEventListener('change', calculate);
  $('wacDecimals').addEventListener('change', function () {
    decimals = Number($('wacDecimals').value);
    calculate();
  });

  $('wacReset').addEventListener('click', function () {
    setPreset('general');
    $('wacScale').value = 'relative';
    $('wacResult').hidden = true;
    $('wacDecimals').value = '2';
    decimals = 2;
    ['wacTargetValue', 'wacTargetWeight', 'wacTargetMin', 'wacTargetMax', 'wacPasteData'].forEach(function (id) { $(id).value = ''; });
    setText('wacImportError', '');
    $('wacImportPanel').open = false;
    setText('wacTargetMessage', DEFAULT_TARGET_MESSAGE);
    configure();
    loadRows([{}, {}, {}]);
    rowsEl.firstElementChild.querySelector('.value').focus();
  });

  $('wacImport').addEventListener('click', function () {
    try {
      var imported = M.parsePaste($('wacPasteData').value, $('wacScale').value);
      var check = M.analyze(imported, $('wacScale').value);
      if (check.errors.length) throw new Error('Line ' + (check.errors[0].row + 1) + ': ' + check.errors[0].message);
      loadRows(imported);
      revealResult();
      setText('wacImportError', '');
      setText('wacActionStatus', 'Imported ' + imported.length + ' rows.');
    } catch (e) {
      setText('wacImportError', e.message);
    }
  });

  ['wacTargetValue', 'wacTargetWeight', 'wacTargetMin', 'wacTargetMax'].forEach(function (id) {
    $(id).addEventListener('input', function () {
      revision += 1;
      calculateTarget();
      setText('wacActionStatus', '');
      $('wacManualCopy').hidden = true;
    });
  });

  $('wacCopy').addEventListener('click', copyResult);
  $('wacExport').addEventListener('click', exportCsv);

  /* Sticky live-result bar: appears while the calculator is in view (same pattern as the CGPA calculator). */
  var bar = $('wacStickyBar');
  var section = document.querySelector('.calculator-section');
  if (bar && section && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var entry = entries[0];
      if (entry.isIntersecting) bar.classList.add('visible');
      else if (entry.boundingClientRect.top > 0) bar.classList.remove('visible');
    }, { threshold: 0, rootMargin: '-60px 0px 0px 0px' }).observe(section);
  }

  configure();
  loadRows([{}, {}, {}]);
})();

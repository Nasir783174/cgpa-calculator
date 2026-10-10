'use strict';
/* IELTS Band Score Calculator: engine + UI.
   The engine is pure (no DOM) so it can be tested on its own in Node. */

/* ---------- Conversion tables: [minimum correct answers, band], highest first ----------
   Listening is shared by Academic and General Training. Reading differs by module.
   Source: published IELTS raw-score tables (average marks needed; exact marks can vary by test version). */
const IELTS_TABLES = Object.freeze({
  listening: [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [11, 4], [8, 3.5], [6, 3], [4, 2.5], [2, 2], [1, 1], [0, 0]],
  academic: [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [2, 2], [1, 1], [0, 0]],
  general: [[40, 9], [39, 8.5], [37, 8], [36, 7.5], [34, 7], [32, 6.5], [30, 6], [27, 5.5], [23, 5], [19, 4.5], [15, 4], [12, 3.5], [9, 3], [6, 2.5], [4, 2], [1, 1], [0, 0]]
});
const IELTS_LABELS = Object.freeze({ listening: 'Listening', academic: 'Academic Reading', general: 'General Training Reading' });

/* ---------- Engine ---------- */
function ieltsValidateRaw(raw) {
  const v = String(raw == null ? '' : raw).trim();
  if (!v) return { valid: false, empty: true, message: 'Enter your correct answers.' };
  if (!/^\d+$/.test(v)) return { valid: false, empty: false, message: 'Enter a whole number from 0 to 40.' };
  const n = Number(v);
  if (n > 40) return { valid: false, empty: false, message: 'The test has 40 questions, so the maximum is 40.' };
  return { valid: true, empty: false, raw: n, message: '' };
}
function ieltsBandFromRaw(kind, raw) {
  const t = IELTS_TABLES[kind];
  if (!t || !Number.isInteger(raw) || raw < 0 || raw > 40) return null;
  return t.find(r => raw >= r[0])[1];
}
/* Correct-answer range that gives `band`, e.g. listening 7 -> { min: 30, max: 31 }. */
function ieltsRangeForBand(kind, band) {
  const t = IELTS_TABLES[kind];
  const i = t.findIndex(r => r[1] === band);
  if (i < 0) return null;
  return { min: t[i][0], max: i === 0 ? 40 : t[i - 1][0] - 1 };
}
/* Next band up and how many more correct answers it needs. null at band 9. */
function ieltsNextBand(kind, raw) {
  const t = IELTS_TABLES[kind];
  const i = t.findIndex(r => raw >= r[0]);
  if (i <= 0) return null;
  return { band: t[i - 1][1], needs: t[i - 1][0], more: t[i - 1][0] - raw };
}
/* Overall band: mean of four bands, rounded to the nearest half band.
   IELTS rule: .25 rounds up to the next half band, .75 rounds up to the next whole band.
   Integer maths in half-bands avoids floating point error. */
function ieltsValidBand(b) {
  return typeof b === 'number' && b >= 0 && b <= 9 && Number.isInteger(b * 2);
}
function ieltsOverall(bands) {
  if (!Array.isArray(bands) || bands.length !== 4 || !bands.every(ieltsValidBand)) return null;
  const halves = bands.reduce((s, b) => s + b * 2, 0); // sum of the four bands in half-band units
  const roundedHalves = Math.floor((halves + 2) / 4);   // (halves / 4), .5 and above rounds up
  return {
    sum: halves / 2,
    average: halves / 8,
    averageText: String(Number((halves / 8).toFixed(3))),
    overall: roundedHalves / 2
  };
}
const IELTSEngine = Object.freeze({
  TABLES: IELTS_TABLES, validateRaw: ieltsValidateRaw, bandFromRaw: ieltsBandFromRaw,
  rangeForBand: ieltsRangeForBand, nextBand: ieltsNextBand, overall: ieltsOverall
});
if (typeof module !== 'undefined' && module.exports) module.exports = IELTSEngine;

/* ---------- UI ---------- */
function ieltsInit() {
  const root = document.getElementById('ieltsCalc');
  if (!root) return;
  const mk = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const fmt = b => b.toFixed(1);
  const BN = { '\u09E6': '0', '\u09E7': '1', '\u09E8': '2', '\u09E9': '3', '\u09EA': '4', '\u09EB': '5', '\u09EC': '6', '\u09ED': '7', '\u09EE': '8', '\u09EF': '9' };
  const cleanDigits = s => s.replace(/[\u09E6-\u09EF]/g, d => BN[d]).replace(/\D/g, '');

  const tabs = Array.from(root.querySelectorAll('input[name="ieltsTab"]'));
  const panels = {};
  root.querySelectorAll('.ielts-panel').forEach(p => { panels[p.dataset.panel] = p; });
  function showPanel(id) {
    Object.keys(panels).forEach(k => { panels[k].hidden = k !== id; });
    const t = tabs.find(x => x.value === id);
    if (t) t.checked = true;
  }
  tabs.forEach(t => t.addEventListener('change', () => { if (t.checked) showPanel(t.value); }));

  /* ----- shared result helpers ----- */
  function stat(val, label) {
    const d = mk('div', 'ssc-stat');
    d.append(mk('span', 'ssc-stat-val', val), mk('span', 'ssc-stat-label', label));
    return d;
  }
  function details(lines) {
    const d = mk('details', 'ssc-details');
    d.append(mk('summary', '', 'Show calculation'));
    lines.forEach(l => d.append(mk('p', 'ssc-line', l)));
    return d;
  }

  /* ----- Overall panel ----- */
  const oForm = document.getElementById('ieltsOverallForm');
  const oRes = document.getElementById('ieltsOverallResult');
  const oMsg = document.getElementById('ieltsOverallMsg');
  const selects = Array.from(oForm.querySelectorAll('select'));
  selects.forEach(sel => {
    for (let i = 18; i >= 0; i--) {
      const o = mk('option', '', fmt(i / 2));
      o.value = String(i / 2);
      sel.append(o);
    }
    sel.value = '';
    sel.addEventListener('change', () => { oRes.hidden = true; oMsg.textContent = ''; sel.classList.remove('is-error'); });
  });
  const placeholder = () => selects.forEach(sel => {
    const o = mk('option', '', 'Select band'); o.value = ''; o.disabled = true; sel.prepend(o); sel.value = '';
  });
  placeholder();

  oForm.addEventListener('submit', e => {
    e.preventDefault();
    const missing = selects.filter(s => s.value === '');
    selects.forEach(s => s.classList.toggle('is-error', s.value === ''));
    if (missing.length) {
      oRes.hidden = true;
      oMsg.textContent = 'Select all four section bands to calculate your overall score.';
      missing[0].focus();
      return;
    }
    oMsg.textContent = '';
    const bands = selects.map(s => Number(s.value));
    const r = ieltsOverall(bands);
    oRes.replaceChildren();
    const head = mk('div', 'ssc-res-head');
    const big = mk('div', 'ssc-res-big');
    big.append(mk('span', 'ssc-res-gpa', fmt(r.overall)), mk('span', 'ssc-res-max', 'Overall band'));
    head.append(big);
    const stats = mk('div', 'ssc-stats');
    stats.append(stat(r.averageText, 'Average of 4'), stat(String(r.sum), 'Total of bands'), stat(fmt(r.overall), 'Rounded band'));
    const frac = r.average - Math.floor(r.average);
    const ruleLine = Math.abs(r.average - r.overall) < 1e-9
      ? 'The average is already a whole or half band, so no rounding is needed.'
      : 'IELTS rounds an average ending in .25 up to the next half band and .75 up to the next whole band; ' + r.averageText + ' rounds ' + (r.overall > r.average ? 'up' : 'down') + ' to ' + fmt(r.overall) + '.';
    oRes.append(head, stats, details([
      'Bands: ' + bands.map(fmt).join(' + ') + ' = ' + r.sum.toFixed(1),
      'Average: ' + r.sum.toFixed(1) + ' \u00F7 4 = ' + r.averageText,
      ruleLine
    ]), mk('p', 'ssc-fine', 'An estimate for planning. Your official overall band is on your Test Report Form.'));
    oRes.hidden = false;
  });
  oForm.addEventListener('reset', () => {
    setTimeout(() => { selects.forEach(s => { s.value = ''; s.classList.remove('is-error'); }); oRes.hidden = true; oMsg.textContent = ''; }, 0);
  });

  /* ----- Raw-score panels ----- */
  const SELECT_FOR = { listening: 'ieltsListeningBand', academic: 'ieltsReadingBand', general: 'ieltsReadingBand' };
  root.querySelectorAll('.ielts-raw-form').forEach(form => {
    const kind = form.dataset.kind;
    const input = form.querySelector('.ielts-input');
    const msg = form.querySelector('.ssc-form-message');
    const res = form.querySelector('.ielts-raw-result');
    input.addEventListener('input', () => {
      const c = cleanDigits(input.value);
      if (c !== input.value) input.value = c;
      res.hidden = true; msg.textContent = '';
      input.setAttribute('aria-invalid', 'false');
    });
    form.addEventListener('reset', () => { setTimeout(() => { res.hidden = true; msg.textContent = ''; input.setAttribute('aria-invalid', 'false'); }, 0); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const v = ieltsValidateRaw(input.value);
      if (!v.valid) {
        res.hidden = true; msg.textContent = v.message;
        input.setAttribute('aria-invalid', 'true'); input.focus();
        return;
      }
      msg.textContent = ''; input.setAttribute('aria-invalid', 'false');
      const band = ieltsBandFromRaw(kind, v.raw);
      const range = ieltsRangeForBand(kind, band);
      const next = ieltsNextBand(kind, v.raw);
      res.replaceChildren();
      const head = mk('div', 'ssc-res-head');
      const big = mk('div', 'ssc-res-big');
      big.append(mk('span', 'ssc-res-gpa', fmt(band)), mk('span', 'ssc-res-max', IELTS_LABELS[kind] + ' band'));
      head.append(big);
      const stats = mk('div', 'ssc-stats');
      stats.append(
        stat(v.raw + ' / 40', 'Correct answers'),
        stat(range.min === range.max ? String(range.min) : range.min + '\u2013' + range.max, 'Answers for band ' + fmt(band)),
        stat(next ? fmt(next.band) : 'Top band', next ? next.more + ' more correct needed' : 'Maximum reached')
      );
      const lines = [
        v.raw + ' correct answers on the ' + IELTS_LABELS[kind] + ' table gives band ' + fmt(band) + '.',
        'Band ' + fmt(band) + ' covers ' + (range.min === range.max ? range.min : range.min + ' to ' + range.max) + ' correct answers.'
      ];
      if (next) lines.push('Band ' + fmt(next.band) + ' starts at ' + next.needs + ' correct answers, which is ' + next.more + ' more than you have.');
      const use = mk('button', 'ssc-btn-secondary ielts-use', 'Use in overall calculator');
      use.type = 'button';
      use.addEventListener('click', () => {
        const sel = document.getElementById(SELECT_FOR[kind]);
        sel.value = String(band);
        sel.classList.remove('is-error');
        oRes.hidden = true; oMsg.textContent = '';
        showPanel('overall');
        sel.focus();
      });
      res.append(head, stats, details(lines), use);
      if (v.raw < 4) res.append(mk('p', 'ssc-fine', 'Very low raw scores are less reliable because conversion tables for them are only approximate.'));
      res.append(mk('p', 'ssc-fine', 'Estimate from published tables. Exact thresholds can shift slightly between test versions.'));
      res.hidden = false;
    });
  });
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ieltsInit);
  else ieltsInit();
}

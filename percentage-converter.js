// Percentage Converter Page JS
// ─── CGPA ↔ PERCENTAGE CONVERTER ────────────────────────────

(function() {
  "use strict";

  if (!document.getElementById("inputValue") || !document.getElementById("formulaSelect")) return;

  let mode = "cgpa"; // "cgpa" | "percentage"

  const FORMULAS = {
    cbse: {
      toPercent: (c) => c * 9.5,
      toCgpa: (p) => p / 9.5,
      display: (v) => mode === "cgpa" ?
        `${v} × 9.5 = ${(v * 9.5).toFixed(2)}%` :
        `${v} ÷ 9.5 = ${(v / 9.5).toFixed(2)} CGPA`,
    },
    aicte: {
      toPercent: (c) => (c - 0.75) * 10,
      toCgpa: (p) => p / 10 + 0.75,
      display: (v) => mode === "cgpa" ?
        `(${v} − 0.75) × 10 = ${((v - 0.75) * 10).toFixed(2)}%` :
        `(${v} ÷ 10) + 0.75 = ${(v / 10 + 0.75).toFixed(2)} CGPA`,
    },
    "10pt": {
      toPercent: (c) => c * 10,
      toCgpa: (p) => p / 10,
      display: (v) => mode === "cgpa" ?
        `${v} × 10 = ${(v * 10).toFixed(2)}%` :
        `${v} ÷ 10 = ${(v / 10).toFixed(2)} CGPA`,
    },
    "4pt": {
      toPercent: (c) => (c / 4) * 100,
      toCgpa: (p) => (p / 100) * 4,
      display: (v) => mode === "cgpa" ?
        `(${v} ÷ 4.0) × 100 = ${((v / 4) * 100).toFixed(2)}%` :
        `(${v} ÷ 100) × 4.0 = ${((v / 100) * 4).toFixed(2)} CGPA`,
    },
    "5pt": {
      toPercent: (c) => c * 20,
      toCgpa: (p) => p / 20,
      display: (v) => mode === "cgpa" ?
        `${v} × 20 = ${(v * 20).toFixed(2)}%` :
        `${v} ÷ 20 = ${(v / 20).toFixed(2)} CGPA`,
    },
  };

  function showError(msg) {
    const el = document.getElementById("fieldError");
    el.textContent = msg;
    el.style.display = "block";
  }

  function clearError() {
    document.getElementById("fieldError").style.display = "none";
  }

  function hideResult() {
    document.getElementById("resultPanel").classList.remove("visible");
  }

  function shakeInput() {
    const el = document.getElementById("inputValue");
    el.classList.add("error-shake");
    setTimeout(() => el.classList.remove("error-shake"), 400);
  }

  // Valid ranges per formula. Max percentage is derived from the max CGPA, so
  // CBSE tops out at 95% (10 x 9.5) and AICTE at 92.5% ((10 - 0.75) x 10).
  // That way a percentage can never convert to a CGPA above the scale's maximum.
  const LIMITS = {
    cbse:   { maxCgpa: 10, minCgpa: 0 },
    aicte:  { maxCgpa: 10, minCgpa: 0.75 }, // (CGPA - 0.75) x 10 would go negative below 0.75
    "10pt": { maxCgpa: 10, minCgpa: 0 },
    "4pt":  { maxCgpa: 4,  minCgpa: 0 },
    "5pt":  { maxCgpa: 5,  minCgpa: 0 },
  };

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function getLimits(formula) {
    const l = LIMITS[formula];
    return {
      maxCgpa: l.maxCgpa,
      minCgpa: l.minCgpa,
      maxPct: round2(Math.min(100, FORMULAS[formula].toPercent(l.maxCgpa))),
      minPct: 0,
    };
  }

  function updateInputMax() {
    const formula = document.getElementById("formulaSelect").value;
    const inputEl = document.getElementById("inputValue");
    const lim = getLimits(formula);
    if (mode === "cgpa") {
      inputEl.min = lim.minCgpa;
      inputEl.max = lim.maxCgpa;
      inputEl.placeholder = `e.g. ${round2(Math.min(8.5, lim.maxCgpa))} (${lim.minCgpa} to ${lim.maxCgpa})`;
    } else {
      inputEl.min = lim.minPct;
      inputEl.max = lim.maxPct;
      inputEl.placeholder = `e.g. 85 (0 to ${lim.maxPct})`;
    }
    // Clear a stale error when the range changes under the user.
    clearError();
  }

  window.switchTab = function(tab) {
    mode = tab;
    const inputEl = document.getElementById("inputValue");
    const labelEl = document.getElementById("inputLabel");
    const tabCgpa = document.getElementById("tabCgpa");
    const tabPct = document.getElementById("tabPct");
    const resultLbl = document.getElementById("resultLabel");

    if (mode === "cgpa") {
      tabCgpa.classList.add("active");
      tabCgpa.setAttribute("aria-selected", "true");
      tabPct.classList.remove("active");
      tabPct.setAttribute("aria-selected", "false");
      labelEl.textContent = "Enter CGPA";
      resultLbl.textContent = "Your Percentage";
    } else {
      tabPct.classList.add("active");
      tabPct.setAttribute("aria-selected", "true");
      tabCgpa.classList.remove("active");
      tabCgpa.setAttribute("aria-selected", "false");
      labelEl.textContent = "Enter Percentage";
      resultLbl.textContent = "Your CGPA";
    }

    updateInputMax();
    clearError();
    hideResult();
  };

  window.calculate = function() {
    const formula = document.getElementById("formulaSelect").value;
    const value = parseFloat(document.getElementById("inputValue").value.trim());
    const fn = FORMULAS[formula];

    if (isNaN(value) || value < 0) {
      showError("Please enter a valid number.");
      shakeInput();
      return;
    }

    const lim = getLimits(formula);
    if (mode === "cgpa") {
      if (value > lim.maxCgpa) {
        showError(`CGPA cannot exceed ${lim.maxCgpa} for this scale.`);
        shakeInput();
        return;
      }
      if (value < lim.minCgpa) {
        showError(`CGPA cannot be below ${lim.minCgpa} for this scale.`);
        shakeInput();
        return;
      }
    } else if (value > lim.maxPct) {
      showError(`Percentage cannot exceed ${lim.maxPct}% for this scale (that equals the maximum CGPA of ${lim.maxCgpa}).`);
      shakeInput();
      return;
    }

    clearError();

    let result, display;
    if (mode === "cgpa") {
      result = fn.toPercent(value);
      display = `${round2(result)}%`;
    } else {
      result = fn.toCgpa(value);
      display = `${round2(result)}`;
    }

    document.getElementById("resultValue").textContent = display;
    document.getElementById("resultFormula").textContent = "Formula: " + fn.display(value);
    document.getElementById("resultPanel").classList.add("visible");
  };

  window.resetAll = function() {
    document.getElementById("inputValue").value = "";
    clearError();
    hideResult();
  };

  window.copyResult = function() {
    const text = document.getElementById("resultValue").textContent;
    const btn = document.getElementById("copyBtn");

    function onCopied() {
      btn.textContent = "Copied!";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = "Copy";
        btn.classList.remove("copied");
      }, 1800);
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onCopied);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      onCopied();
    }
  };

  window.toggleFaq = function(el) {
    const item = el.closest(".faq-item");
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach((i) => i.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
  };

  document.addEventListener("DOMContentLoaded", function() {
    const input = document.getElementById("inputValue");
    if (input) input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") window.calculate();
    });

    const formulaSelect = document.getElementById("formulaSelect");
    if (formulaSelect) formulaSelect.addEventListener("change", updateInputMax);

    // Set the correct max on first load.
    updateInputMax();
  });
})();

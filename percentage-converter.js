/* CGPA <-> Percentage converter page. */
(function () {
  "use strict";

  var inputEl = document.getElementById("inputValue");
  var formulaEl = document.getElementById("formulaSelect");
  if (!inputEl || !formulaEl) return;

  var mode = "cgpa"; // "cgpa" (CGPA -> %) or "percent" (% -> CGPA)

  /* Each conversion: how to calculate, the highest CGPA it supports and how to print the working. */
  var FORMULAS = {
    cbse: {
      maxCgpa: 10,
      toPercent: function (c) {
        return c * 9.5;
      },
      toCgpa: function (p) {
        return p / 9.5;
      },
      working: function (v, r) {
        return mode === "cgpa" ? v + " × 9.5 = " + r + "%" : v + " ÷ 9.5 = " + r + " CGPA";
      },
    },
    aicte: {
      maxCgpa: 10,
      toPercent: function (c) {
        return (c - 0.75) * 10;
      },
      toCgpa: function (p) {
        return p / 10 + 0.75;
      },
      working: function (v, r) {
        return mode === "cgpa"
          ? "(" + v + " − 0.75) × 10 = " + r + "%"
          : "(" + v + " ÷ 10) + 0.75 = " + r + " CGPA";
      },
    },
    "10pt": {
      maxCgpa: 10,
      toPercent: function (c) {
        return c * 10;
      },
      toCgpa: function (p) {
        return p / 10;
      },
      working: function (v, r) {
        return mode === "cgpa" ? v + " × 10 = " + r + "%" : v + " ÷ 10 = " + r + " CGPA";
      },
    },
    "4pt": {
      maxCgpa: 4,
      toPercent: function (c) {
        return (c / 4) * 100;
      },
      toCgpa: function (p) {
        return (p / 100) * 4;
      },
      working: function (v, r) {
        return mode === "cgpa"
          ? "(" + v + " ÷ 4.0) × 100 = " + r + "%"
          : "(" + v + " ÷ 100) × 4.0 = " + r + " CGPA";
      },
    },
    "5pt": {
      maxCgpa: 5,
      toPercent: function (c) {
        return c * 20;
      },
      toCgpa: function (p) {
        return p / 20;
      },
      working: function (v, r) {
        return mode === "cgpa" ? v + " × 20 = " + r + "%" : v + " ÷ 20 = " + r + " CGPA";
      },
    },
  };

  var errorEl = document.getElementById("fieldError");
  var panelEl = document.getElementById("resultPanel");
  var tabCgpa = document.getElementById("tabCgpa");
  var tabPct = document.getElementById("tabPct");

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    inputEl.classList.add("error-shake");
    setTimeout(function () {
      inputEl.classList.remove("error-shake");
    }, 400);
  }

  function clearOutput() {
    errorEl.hidden = true;
    panelEl.classList.remove("visible");
  }

  /* The number input's max follows the selected scale (4, 5 or 10 for CGPA, 100 for percentage). */
  function updateInputMax() {
    inputEl.max = mode === "cgpa" ? FORMULAS[formulaEl.value].maxCgpa : 100;
  }

  function setMode(next) {
    mode = next;
    var isCgpa = mode === "cgpa";
    tabCgpa.classList.toggle("active", isCgpa);
    tabCgpa.setAttribute("aria-selected", String(isCgpa));
    tabPct.classList.toggle("active", !isCgpa);
    tabPct.setAttribute("aria-selected", String(!isCgpa));
    document.getElementById("inputLabel").textContent = isCgpa ? "Enter CGPA" : "Enter Percentage";
    document.getElementById("resultLabel").textContent = isCgpa ? "Your Percentage" : "Your CGPA";
    inputEl.placeholder = isCgpa ? "e.g. 8.5" : "e.g. 85";
    updateInputMax();
    clearOutput();
  }

  function calculate() {
    var formula = FORMULAS[formulaEl.value];
    var value = parseFloat(inputEl.value.trim());

    if (isNaN(value) || value < 0) return showError("Please enter a valid number.");
    if (mode === "cgpa" && value > formula.maxCgpa)
      return showError("CGPA cannot exceed " + formula.maxCgpa + " for this scale.");
    if (mode === "percent" && value > 100) return showError("Percentage cannot exceed 100.");

    errorEl.hidden = true;
    var result = mode === "cgpa" ? formula.toPercent(value) : formula.toCgpa(value);
    var rounded = Math.round(result * 100) / 100;
    document.getElementById("resultValue").textContent = mode === "cgpa" ? rounded + "%" : String(rounded);
    document.getElementById("resultFormula").textContent =
      "Formula: " + formula.working(value, result.toFixed(2));
    panelEl.classList.add("visible");
  }

  function copyResult() {
    var button = document.getElementById("copyBtn");
    window.copyText(document.getElementById("resultValue").textContent).then(function () {
      button.textContent = "Copied!";
      button.classList.add("copied");
      setTimeout(function () {
        button.textContent = "Copy";
        button.classList.remove("copied");
      }, 1800);
    });
  }

  tabCgpa.addEventListener("click", function () {
    setMode("cgpa");
  });
  tabPct.addEventListener("click", function () {
    setMode("percent");
  });
  document.getElementById("calcBtn").addEventListener("click", calculate);
  document.getElementById("resetBtn").addEventListener("click", function () {
    inputEl.value = "";
    clearOutput();
  });
  document.getElementById("copyBtn").addEventListener("click", copyResult);
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") calculate();
  });
  formulaEl.addEventListener("change", updateInputMax);
  updateInputMax();
})();

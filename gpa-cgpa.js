/* GPA <-> CGPA converter page: scales a value from one grading scale to another. */
(function () {
  "use strict";

  var page = document.getElementById("gpaConverterPage");
  if (!page) return;

  /* Each direction (GPA -> CGPA and CGPA -> GPA) uses the same markup with different ids. */
  var DIRECTIONS = {
    gpa: {
      label: "GPA",
      input: "gpaInput",
      from: "gpaScale",
      to: "cgpaTargetScale",
      error: "gpaInputError",
      panel: "gpaToCgpaPanel",
      value: "gpaToCgpaValue",
      pct: "gpaToCgpaPct",
      formula: "gpaToCgpaFormula",
    },
    cgpa: {
      label: "CGPA",
      input: "cgpaInput",
      from: "cgpaScale",
      to: "gpaTargetScale",
      error: "cgpaInputError",
      panel: "cgpaToGpaPanel",
      value: "cgpaToGpaValue",
      pct: "cgpaToGpaPct",
      formula: "cgpaToGpaFormula",
    },
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function convert(dir) {
    var input = byId(dir.input);
    var panel = byId(dir.panel);
    var error = byId(dir.error);
    var raw = input.value.trim();
    var value = parseFloat(raw);
    var fromScale = parseFloat(byId(dir.from).value) || 0;
    var toScale = parseFloat(byId(dir.to).value) || 0;

    error.hidden = true;
    if (raw === "") {
      panel.classList.remove("visible");
      return;
    }
    if (isNaN(value) || value < 0 || value > fromScale) {
      error.textContent = "Enter a valid " + dir.label + " between 0 and " + fromScale + ".";
      error.hidden = false;
      input.classList.add("error-shake");
      setTimeout(function () {
        input.classList.remove("error-shake");
      }, 400);
      panel.classList.remove("visible");
      return;
    }

    var converted = fromScale > 0 ? (value / fromScale) * toScale : 0;
    var percent = fromScale > 0 ? (value / fromScale) * 100 : 0;
    byId(dir.value).textContent = converted.toFixed(2);
    byId(dir.pct).textContent = percent.toFixed(2) + "%";
    byId(dir.formula).textContent =
      "Formula: (" + value + " ÷ " + fromScale + ") × " + toScale + " = " + converted.toFixed(2);
    panel.classList.add("visible");
  }

  function reset(dir) {
    byId(dir.input).value = "";
    byId(dir.error).hidden = true;
    byId(dir.panel).classList.remove("visible");
  }

  function copyResult(button) {
    var panel = byId(button.dataset.copy);
    var text =
      panel.querySelector(".gpa-result-value").textContent +
      " (" +
      panel.querySelector(".gpa-result-pct").textContent +
      ")";
    window.copyText(text).then(function () {
      button.textContent = "Copied!";
      button.classList.add("copied");
      setTimeout(function () {
        button.textContent = "Copy";
        button.classList.remove("copied");
      }, 1800);
    });
  }

  Object.keys(DIRECTIONS).forEach(function (key) {
    var dir = DIRECTIONS[key];
    var run = function () {
      convert(dir);
    };
    [dir.input, dir.from, dir.to].forEach(function (id) {
      var el = byId(id);
      el.addEventListener("input", run);
      el.addEventListener("change", run);
    });
    byId(dir.input).addEventListener("keydown", function (e) {
      if (e.key === "Enter") run();
    });
  });

  page.addEventListener("click", function (e) {
    var resetBtn = e.target.closest("[data-reset]");
    if (resetBtn) return reset(DIRECTIONS[resetBtn.dataset.reset]);
    var copyBtn = e.target.closest("[data-copy]");
    if (copyBtn) copyResult(copyBtn);
  });
})();

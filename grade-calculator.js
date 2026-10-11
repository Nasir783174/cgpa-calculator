/* Grade calculator page: marks -> letter grade, GPA, average and a "what do I need" predictor. */
(function () {
  "use strict";

  var tableBody = document.getElementById("gradeTableBody");
  if (!tableBody) return;

  /* Grade bands per scale: [minimum marks, letter, grade points]. Highest band first. */
  var GRADE_SYSTEMS = {
    4: [
      [80, "A+", 4],
      [75, "A", 3.75],
      [70, "A−", 3.5],
      [65, "B+", 3.25],
      [60, "B", 3],
      [55, "B−", 2.75],
      [50, "C+", 2.5],
      [45, "C", 2.25],
      [40, "D", 2],
      [0, "F", 0],
    ],
    5: [
      [80, "A+", 5],
      [75, "A", 4.5],
      [70, "A−", 4],
      [65, "B+", 3.5],
      [60, "B", 3],
      [55, "B−", 2.5],
      [50, "C", 2],
      [40, "D", 1],
      [0, "F", 0],
    ],
    10: [
      [90, "O", 10],
      [80, "A+", 9],
      [70, "A", 8],
      [60, "B+", 7],
      [55, "B", 6],
      [50, "C", 5],
      [40, "P", 4],
      [0, "F", 0],
    ],
  };
  var DEFAULT_TARGET = "B+";
  var DEFAULT_CREDITS = 3;
  var START_ROWS = 3;

  var activeSystem = "4";

  function byId(id) {
    return document.getElementById(id);
  }

  function gradeFor(marks) {
    var bands = GRADE_SYSTEMS[activeSystem];
    for (var i = 0; i < bands.length; i++) {
      if (marks >= bands[i][0]) return { letter: bands[i][1], point: bands[i][2] };
    }
  }

  function parseMarks(input) {
    var value = parseFloat(input.value);
    return input.value === "" || isNaN(value) ? null : value;
  }

  function addRow() {
    var row = document.createElement("div");
    row.className = "grade-row";
    row.innerHTML =
      '<input class="gr-subject" placeholder="Subject name" aria-label="Subject" />' +
      '<input type="number" class="gr-marks" placeholder="0–100" min="0" max="100" aria-label="Marks" />' +
      '<input type="number" class="gr-credit" placeholder="Credits" min="0.5" step="0.5" value="' +
      DEFAULT_CREDITS +
      '" aria-label="Credits" />' +
      '<div class="gr-grade-cell">–</div>' +
      '<button class="btn-del-gr" aria-label="Remove row">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    tableBody.appendChild(row);
    recalculate();
  }

  function recalculate() {
    var totalPoints = 0,
      totalCredits = 0,
      totalMarks = 0,
      subjects = 0,
      fails = 0;

    tableBody.querySelectorAll(".grade-row").forEach(function (row) {
      var marks = parseMarks(row.querySelector(".gr-marks"));
      var cell = row.querySelector(".gr-grade-cell");
      if (marks === null) {
        cell.textContent = "–";
        cell.className = "gr-grade-cell";
        return;
      }
      marks = Math.min(100, Math.max(0, marks));
      var credit = parseFloat(row.querySelector(".gr-credit").value);
      if (!credit || credit <= 0) credit = DEFAULT_CREDITS;

      var grade = gradeFor(marks);
      cell.textContent = grade.letter;
      cell.className = "gr-grade-cell " + (grade.letter === "F" ? "grade-f" : "grade-pass");

      totalPoints += grade.point * credit;
      totalCredits += credit;
      totalMarks += marks;
      subjects++;
      if (grade.letter === "F") fails++;
    });

    byId("grGPA").textContent = (totalCredits > 0 ? totalPoints / totalCredits : 0).toFixed(2);
    byId("grPct").textContent = (subjects > 0 ? totalMarks / subjects : 0).toFixed(1) + "%";
    var status = byId("grStatus");
    status.textContent = fails > 0 ? "Fail" : subjects > 0 ? "Pass" : "–";
    status.classList.toggle("status-fail", fails > 0);
    status.classList.toggle("status-pass", fails === 0);
    byId("grSubjects").textContent = subjects;
  }

  function filledMarks() {
    var list = [];
    tableBody.querySelectorAll(".gr-marks").forEach(function (input) {
      var value = parseMarks(input);
      if (value !== null) list.push(value);
    });
    return list;
  }

  /* Rebuild the "target grade" dropdown from the active scale's bands (F is not a target). */
  function updateTargetDropdown() {
    var select = byId("grTargetGrade");
    select.innerHTML = "";
    GRADE_SYSTEMS[activeSystem].forEach(function (band) {
      if (band[1] === "F") return;
      var option = document.createElement("option");
      option.value = band[1];
      option.textContent = band[1] + " (" + band[0] + "%+)";
      option.selected = band[1] === DEFAULT_TARGET;
      select.appendChild(option);
    });
  }

  function predictGrade() {
    var target = byId("grTargetGrade").value;
    var needed = 0;
    GRADE_SYSTEMS[activeSystem].forEach(function (band) {
      if (band[1] === target) needed = band[0];
    });
    if (!needed) return;

    var marks = filledMarks();
    var result = byId("grPredResult");
    var card = result.querySelector(".pred-result-card");
    var value = result.querySelector(".pred-stat-val");
    var label = result.querySelector(".pred-stat-label");
    var note = result.querySelector(".pred-note");
    result.classList.add("visible");

    if (!marks.length) {
      value.textContent = needed + "%";
      label.textContent = "Avg needed";
      card.className = "pred-result-card";
      note.textContent = "Add subject marks first to get a personalised prediction.";
      return;
    }

    var avg =
      marks.reduce(function (a, b) {
        return a + b;
      }, 0) / marks.length;
    if (avg >= needed) {
      value.textContent = "✓ Met";
      label.textContent = "Target reached";
      card.className = "pred-result-card pred-achieved";
      note.textContent =
        "You're already averaging " + avg.toFixed(1) + "% — you've met the target for " + target + "!";
    } else {
      value.textContent = needed + "%";
      label.textContent = "Target avg";
      card.className = "pred-result-card";
      note.textContent =
        "Aim for at least " +
        needed +
        "% average. You're " +
        (needed - avg).toFixed(1) +
        "% below the " +
        target +
        " threshold right now.";
    }
  }

  function resetRows() {
    tableBody.innerHTML = "";
    for (var i = 0; i < START_ROWS; i++) addRow();
  }

  var resultPanel = byId("grResultPanel");
  var errorEl = byId("grError");

  document.querySelectorAll(".gsys-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      activeSystem = tab.dataset.sys;
      document.querySelectorAll(".gsys-tab").forEach(function (t) {
        t.classList.toggle("active", t.dataset.sys === activeSystem);
      });
      updateTargetDropdown();
      recalculate();
    });
  });

  tableBody.addEventListener("input", function (e) {
    if (e.target.matches(".gr-marks, .gr-credit")) recalculate();
    if (e.target.matches(".gr-marks")) errorEl.hidden = true;
  });
  tableBody.addEventListener("click", function (e) {
    var del = e.target.closest(".btn-del-gr");
    if (!del) return;
    var row = del.closest(".grade-row");
    row.classList.add("removing");
    setTimeout(function () {
      row.remove();
      recalculate();
    }, 180);
  });

  byId("grAddSubjectBtn").addEventListener("click", addRow);
  byId("grPredictBtn").addEventListener("click", predictGrade);
  byId("grPrintBtn").addEventListener("click", function () {
    window.print();
  });

  byId("grCalcBtn").addEventListener("click", function () {
    if (!filledMarks().length) {
      errorEl.hidden = false;
      resultPanel.hidden = true;
      return;
    }
    errorEl.hidden = true;
    recalculate();
    resultPanel.hidden = false;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultPanel.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  });

  byId("grResetBtn").addEventListener("click", function () {
    resetRows();
    resultPanel.hidden = true;
    errorEl.hidden = true;
    byId("grPredResult").classList.remove("visible");
  });

  resetRows();
})();

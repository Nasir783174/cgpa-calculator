/* CGPA calculator engine, shared by every CGPA calculator page.
   The grading scale is chosen by <body data-scale="...">: standard, na, ten, nigerian, australian or canadian. */
(function () {
  "use strict";

  /* ---------- Grading scales ---------- */
  var SCALES = {
    standard: {
      name: "Standard 4.0 Scale",
      max: 4,
      /* [dropdown label, grade points] */
      grades: [
        ["A+ (4.00)", 4],
        ["A  (3.75)", 3.75],
        ["A− (3.50)", 3.5],
        ["B+ (3.25)", 3.25],
        ["B  (3.00)", 3],
        ["B− (2.75)", 2.75],
        ["C+ (2.50)", 2.5],
        ["C  (2.25)", 2.25],
        ["D  (2.00)", 2],
        ["F  (0.00)", 0],
      ],
      /* [minimum CGPA, remark], highest first */
      remarks: [
        [3.75, "Excellent"],
        [3.5, "Very Good"],
        [3, "Good"],
        [2.5, "Average"],
        [2, "Below Average"],
        [0, "Poor"],
      ],
    },
    na: {
      name: "North American 4.0 Scale",
      max: 4,
      /* [dropdown label, grade points] */
      grades: [
        ["A  (4.00)", 4],
        ["A− (3.70)", 3.7],
        ["B+ (3.30)", 3.3],
        ["B  (3.00)", 3],
        ["B− (2.70)", 2.7],
        ["C+ (2.30)", 2.3],
        ["C  (2.00)", 2],
        ["C− (1.70)", 1.7],
        ["D+ (1.30)", 1.3],
        ["D  (1.00)", 1],
        ["F  (0.00)", 0],
      ],
      /* [minimum CGPA, remark], highest first */
      remarks: [
        [3.75, "Excellent"],
        [3.5, "Very Good"],
        [3, "Good"],
        [2.5, "Average"],
        [2, "Below Average"],
        [0, "Poor"],
      ],
    },
    ten: {
      name: "10-Point Scale",
      max: 10,
      /* [dropdown label, grade points] */
      grades: [
        ["O  (10.00)", 10],
        ["A+ (9.00)", 9],
        ["A  (8.00)", 8],
        ["B+ (7.00)", 7],
        ["B  (6.00)", 6],
        ["C  (5.00)", 5],
        ["P  (4.00)", 4],
        ["F  (0.00)", 0],
      ],
      /* [minimum CGPA, remark], highest first */
      remarks: [
        [9, "Outstanding"],
        [8, "Excellent"],
        [7, "Very Good"],
        [6, "Good"],
        [5, "Average"],
        [4, "Pass"],
        [0, "Fail"],
      ],
    },
    nigerian: {
      name: "Nigerian 5.0 Scale",
      max: 5,
      /* [dropdown label, grade points] */
      grades: [
        ["A  (5.00)", 5],
        ["B  (4.00)", 4],
        ["C  (3.00)", 3],
        ["D  (2.00)", 2],
        ["E  (1.00)", 1],
        ["F  (0.00)", 0],
      ],
      /* [minimum CGPA, remark], highest first */
      remarks: [
        [4.5, "Excellent"],
        [3.5, "Very Good"],
        [3, "Good"],
        [2, "Average"],
        [1, "Pass"],
        [0, "Fail"],
      ],
    },
    australian: {
      name: "Australian 7.0 Scale",
      max: 7,
      /* [dropdown label, grade points] */
      grades: [
        ["HD (7.00)", 7],
        ["D  (6.00)", 6],
        ["C  (5.00)", 5],
        ["P  (4.00)", 4],
        ["F  (0.00)", 0],
      ],
      /* [minimum CGPA, remark], highest first */
      remarks: [
        [6.5, "High Distinction"],
        [5.5, "Distinction"],
        [4.5, "Credit"],
        [4, "Pass"],
        [0, "Fail"],
      ],
    },
    canadian: {
      name: "Canadian 4.33 Scale",
      max: 4.33,
      /* [dropdown label, grade points] */
      grades: [
        ["A+ (4.33)", 4.33],
        ["A  (4.00)", 4],
        ["A− (3.67)", 3.67],
        ["B+ (3.33)", 3.33],
        ["B  (3.00)", 3],
        ["B− (2.67)", 2.67],
        ["C+ (2.33)", 2.33],
        ["C  (2.00)", 2],
        ["C− (1.67)", 1.67],
        ["D+ (1.33)", 1.33],
        ["D  (1.00)", 1],
        ["F  (0.00)", 0],
      ],
      /* [minimum CGPA, remark], highest first */
      remarks: [
        [3.7, "Excellent"],
        [3, "Good"],
        [2, "Satisfactory"],
        [1, "Pass"],
        [0, "Fail"],
      ],
    },
  };

  var scaleKey = document.body.dataset.scale;
  var scale = SCALES[scaleKey];
  if (!scale || !document.getElementById("semestersContainer")) return;

  var semesterCount = 0;
  var sgpaRowCount = 0;

  /* ---------- Small helpers ---------- */
  function byId(id) {
    return document.getElementById(id);
  }

  function num(value) {
    return parseFloat(value) || 0;
  }

  function remarkFor(cgpa) {
    for (var i = 0; i < scale.remarks.length; i++) {
      if (cgpa >= scale.remarks[i][0]) return scale.remarks[i][1];
    }
    return "–";
  }

  function gradeOptions(selectedValue) {
    var html = '<option value="" disabled' + (selectedValue === null ? " selected" : "") + ">Grade</option>";
    scale.grades.forEach(function (g) {
      var selected = selectedValue !== null && selectedValue === g[1] ? " selected" : "";
      html += '<option value="' + g[1] + '"' + selected + ">" + g[0] + "</option>";
    });
    return html;
  }

  var ICON_CLOSE =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var ICON_PLUS =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  var ICON_TRASH =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';

  /* Fade an element in after it is added to the page (styles live in calculator.css). */
  function fadeIn(el) {
    el.classList.add("is-entering");
    requestAnimationFrame(function () {
      el.classList.add("is-animating");
      el.classList.remove("is-entering");
      setTimeout(function () {
        el.classList.remove("is-animating");
      }, 350);
    });
  }

  function showToast(message) {
    var old = document.querySelector(".toast");
    if (old) old.remove();
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add("toast-visible");
    });
    setTimeout(function () {
      toast.classList.remove("toast-visible");
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 3000);
  }

  function animateValue(el, from, to, duration) {
    if (el._frame) cancelAnimationFrame(el._frame);
    var start = performance.now();
    el._frame = requestAnimationFrame(function tick(now) {
      var t = Math.min((now - start) / duration, 1);
      var ease = t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1;
      el.textContent = (from + (to - from) * ease).toFixed(2);
      el._frame = t < 1 ? requestAnimationFrame(tick) : null;
    });
  }

  /* ---------- Building rows ---------- */
  function createCourseRow(semId) {
    var row = document.createElement("div");
    row.className = "course-row";
    row.dataset.semId = semId;
    row.innerHTML =
      '<input type="text" class="course-name" placeholder="Course name" />' +
      '<input type="number" class="course-credit" placeholder="Credits" min="0.5" step="0.5" />' +
      '<select class="course-grade" aria-label="Grade">' +
      gradeOptions(null) +
      "</select>" +
      '<button class="btn-delete-course" title="Remove course">' +
      ICON_CLOSE +
      "</button>";
    return row;
  }

  function createSemester() {
    semesterCount++;
    var id = semesterCount;
    var box = document.createElement("div");
    box.className = "semester-box";
    box.dataset.semId = id;
    box.innerHTML =
      '<div class="semester-header"><div class="semester-title-wrap"><span class="semester-num">Semester ' +
      id +
      "</span></div>" +
      '<div class="semester-right-wrap"><div class="semester-sgpa-wrap"><span class="sgpa-tag-label">SGPA</span>' +
      '<span class="sgpa-tag-val" id="sgpa-sem-' +
      id +
      '">0.00</span></div>' +
      '<button class="btn-delete-semester" title="Remove semester">' +
      ICON_TRASH +
      "</button></div></div>" +
      '<div class="courses-container" id="courses-' +
      id +
      '"></div>' +
      '<button class="btn-add-course" data-sem-id="' +
      id +
      '">' +
      ICON_PLUS +
      " Add Course</button>";
    box.querySelector(".courses-container").appendChild(createCourseRow(id));
    return box;
  }

  function createSgpaRow() {
    sgpaRowCount++;
    var id = sgpaRowCount;
    var row = document.createElement("div");
    row.className = "sgpa-row";
    row.innerHTML =
      '<input type="text" class="sgpa-sem-name" placeholder="Semester ' +
      id +
      '" value="Semester ' +
      id +
      '" />' +
      '<input type="number" class="sgpa-val-input" placeholder="SGPA" min="0" max="' +
      scale.max +
      '" step="0.01" />' +
      '<input type="number" class="sgpa-credit-input" placeholder="Credits" min="1" step="1" title="Total credits for this semester" />' +
      '<button class="btn-delete-sgpa" title="Remove row">' +
      ICON_CLOSE.replace(/14/g, "13") +
      "</button>";
    return row;
  }

  /* ---------- Reading rows ---------- */
  function rowCredit(row) {
    return num(row.querySelector(".course-credit").value);
  }

  function rowGradeRaw(row) {
    return row.querySelector(".course-grade").value;
  }

  /* A course with credits but no grade yet is flagged and left out of every total. */
  function rowMissingGrade(row) {
    return rowCredit(row) > 0 && rowGradeRaw(row) === "";
  }

  /* ---------- Calculations ---------- */
  function semesterSgpa(semId) {
    var points = 0,
      credits = 0;
    document.querySelectorAll('.course-row[data-sem-id="' + semId + '"]').forEach(function (row) {
      var raw = rowGradeRaw(row);
      if (raw === "") return;
      var credit = rowCredit(row);
      points += credit * parseFloat(raw);
      credits += credit;
    });
    return credits > 0 ? points / credits : 0;
  }

  /* Retakes: rows sharing a course name count once, using the best grade; the others are dimmed.
     Rows without a name are never grouped. */
  function overallTotals() {
    var rows = Array.prototype.slice.call(document.querySelectorAll(".course-row"));
    rows.forEach(function (row) {
      row.classList.remove("course-row-superseded");
    });

    var counted = rows.filter(function (row) {
      return !rowMissingGrade(row) && rowGradeRaw(row) !== "" && rowCredit(row) > 0;
    });

    var groups = {};
    var singles = [];
    counted.forEach(function (row) {
      var name = row.querySelector(".course-name").value.trim().toLowerCase();
      if (name === "") singles.push(row);
      else (groups[name] = groups[name] || []).push(row);
    });
    Object.keys(groups).forEach(function (name) {
      var best = groups[name].reduce(function (a, b) {
        return parseFloat(rowGradeRaw(b)) > parseFloat(rowGradeRaw(a)) ? b : a;
      });
      groups[name].forEach(function (row) {
        if (row === best) singles.push(row);
        else row.classList.add("course-row-superseded");
      });
    });

    var weightedSum = 0,
      totalCredits = 0;
    singles.forEach(function (row) {
      weightedSum += parseFloat(rowGradeRaw(row)) * rowCredit(row);
      totalCredits += rowCredit(row);
    });
    return { weightedSum: weightedSum, totalCredits: totalCredits };
  }

  function recalcAll() {
    var semesters = document.querySelectorAll(".semester-box");
    semesters.forEach(function (box) {
      var el = byId("sgpa-sem-" + box.dataset.semId);
      if (el) el.textContent = semesterSgpa(box.dataset.semId).toFixed(2);
    });
    document.querySelectorAll(".course-row").forEach(function (row) {
      row.querySelector(".course-grade").classList.toggle("course-grade-missing", rowMissingGrade(row));
    });

    var totals = overallTotals();
    var cgpa = totals.totalCredits > 0 ? totals.weightedSum / totals.totalCredits : 0;
    var remark = cgpa > 0 ? remarkFor(cgpa) : "–";
    var credits = totals.totalCredits.toFixed(1);

    var display = byId("cgpaDisplay");
    animateValue(display, parseFloat(display.textContent) || 0, cgpa, 400);
    byId("totalCredits").textContent = credits;
    byId("totalSemesters").textContent = semesters.length;
    byId("cgpaGradeLabel").textContent = remark;
    byId("cgpaBar").style.width = (cgpa / scale.max) * 100 + "%";
    byId("stickyCGPA").textContent = cgpa.toFixed(2);
    byId("stickyCredits").textContent = credits;
    byId("stickySemesters").textContent = semesters.length;
    byId("stickyGrade").textContent = remark;

    // Target planner inputs follow the table unless the person is typing in them
    var current = byId("currentCGPA");
    if (document.activeElement !== current) current.value = cgpa > 0 ? cgpa.toFixed(2) : "";
    var completed = byId("completedCredits");
    if (document.activeElement !== completed) completed.value = totals.totalCredits > 0 ? credits : "";
    calcTarget();
  }

  function calcTarget() {
    var earned = num(byId("completedCredits").value);
    var current = num(byId("currentCGPA").value);
    var target = num(byId("targetCGPA").value);
    var remaining = num(byId("remainingCredits").value);
    var requiredEl = byId("requiredGPA");
    var resultEl = byId("targetResult");
    resultEl.className = "target-result";

    function show(text, state) {
      requiredEl.textContent = text;
      if (state) resultEl.classList.add(state);
    }

    if (!target || !remaining) return show("–");
    if (current > 0 && earned === 0) return show("Enter Completed Credits", "target-impossible");
    if (target > scale.max) return show("Exceeds scale max", "target-impossible");

    var required = (target * (earned + remaining) - current * earned) / remaining;
    if (required > scale.max) show("Not Possible", "target-impossible");
    else if (required < 0) show("Already Achieved!", "target-achieved");
    else show(required.toFixed(2), "target-possible");
  }

  function calcSgpaToCgpa() {
    var weighted = 0,
      credits = 0,
      simple = 0,
      count = 0;
    var missing = []; // rows that have an SGPA but no credit

    document.querySelectorAll(".sgpa-row").forEach(function (row) {
      var sgpa = parseFloat(row.querySelector(".sgpa-val-input").value);
      var creditEl = row.querySelector(".sgpa-credit-input");
      var credit = parseFloat(creditEl.value);
      creditEl.classList.remove("sgpa-credit-missing");
      if (isNaN(sgpa)) return;
      simple += sgpa;
      count++;
      if (credit > 0) {
        weighted += sgpa * credit;
        credits += credit;
      } else {
        missing.push(row);
      }
    });

    var weightedMode = credits > 0;
    var result = weightedMode ? weighted / credits : count > 0 ? simple / count : 0;
    byId("sgpaCGPA").textContent = result.toFixed(2);
    var weightedNote = byId("sgpaWeightedNote"); // only some pages show this label
    if (weightedNote) weightedNote.hidden = !weightedMode;

    // In weighted mode, semesters without credits are flagged instead of silently dropped
    var warn = byId("sgpaMissingCreditWarning");
    var flagged = weightedMode && missing.length > 0;
    warn.hidden = !flagged;
    warn.textContent = "";
    if (!flagged) return;
    missing.forEach(function (row) {
      row.querySelector(".sgpa-credit-input").classList.add("sgpa-credit-missing");
    });
    var names = missing
      .map(function (row) {
        return row.querySelector(".sgpa-sem-name").value || "This semester";
      })
      .join(", ");
    warn.textContent =
      missing.length === 1
        ? '⚠ "' +
          names +
          '" has no credit entered, so it is NOT counted in the CGPA above. Add its credit to include it.'
        : "⚠ These semesters have no credit entered, so they are NOT counted in the CGPA above: " +
          names +
          ". Add their credits to include them.";
  }

  /* ---------- Report download (template is loaded only when needed) ---------- */
  var reportLoader = null;
  function loadReportTemplate(src) {
    if (window.buildCgpaReport) return Promise.resolve();
    if (!reportLoader) {
      reportLoader = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return reportLoader;
  }

  function collectReportData() {
    var totals = overallTotals();
    var cgpa = (totals.totalCredits > 0 ? totals.weightedSum / totals.totalCredits : 0).toFixed(2);
    var target = byId("targetCGPA").value;
    var remaining = byId("remainingCredits").value;
    var required = byId("requiredGPA").textContent;

    var data = {
      cgpa: cgpa,
      remark: remarkFor(parseFloat(cgpa)),
      credits: byId("totalCredits").textContent,
      semesters: byId("totalSemesters").textContent,
      scaleName: scale.name,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      target: null,
      semesterList: [],
    };

    if (target && remaining) {
      data.target = {
        current: byId("currentCGPA").value || cgpa, // matches what Required GPA was based on
        completed: byId("completedCredits").value,
        target: target,
        remaining: remaining,
        required: required,
        tone:
          required === "Not Possible"
            ? "impossible"
            : required === "Already Achieved!"
              ? "achieved"
              : "possible",
      };
    }

    document.querySelectorAll(".semester-box").forEach(function (box) {
      var id = box.dataset.semId;
      var sem = { name: "Semester " + id, sgpa: byId("sgpa-sem-" + id).textContent, credits: 0, rows: [] };
      box.querySelectorAll(".course-row").forEach(function (row) {
        var select = row.querySelector(".course-grade");
        var credit = row.querySelector(".course-credit").value || "–";
        var points = parseFloat(select.value) || 0;
        if (parseFloat(credit) && !rowMissingGrade(row)) sem.credits += parseFloat(credit);
        sem.rows.push({
          name: row.querySelector(".course-name").value.trim() || "Unnamed Course",
          credit: credit,
          grade: select.selectedIndex > 0 ? select.options[select.selectedIndex].text : "–",
          points: points > 0 ? points.toFixed(2) : "–",
        });
      });
      sem.credits = sem.credits.toFixed(1);
      data.semesterList.push(sem);
    });
    return data;
  }

  function downloadReport(button) {
    loadReportTemplate(button.dataset.reportSrc).then(
      function () {
        var html = window.buildCgpaReport(collectReportData());
        var url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
        var link = document.createElement("a");
        link.href = url;
        link.download = "CGPA-Report-" + new Date().toISOString().slice(0, 10) + ".html";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("Report downloaded successfully!");
      },
      function () {
        showToast("Could not prepare the report. Please check your connection and try again.");
      },
    );
  }

  /* ---------- Wiring ---------- */
  function init() {
    // Replace the pre-rendered static Semester 1 / SGPA row with live, editable ones
    document.querySelectorAll("[data-prerender]").forEach(function (el) {
      el.remove();
    });

    var semesters = byId("semestersContainer");
    var sgpaRows = byId("sgpaRowsContainer");
    semesters.appendChild(createSemester());
    sgpaRows.appendChild(createSgpaRow());

    // Scale limits for the inputs
    byId("currentCGPA").max = scale.max;
    byId("targetCGPA").max = scale.max;

    semesters.addEventListener("input", function (e) {
      if (e.target.matches(".course-name, .course-credit")) recalcAll();
    });
    semesters.addEventListener("change", function (e) {
      if (e.target.matches(".course-grade")) recalcAll();
    });
    semesters.addEventListener("click", function (e) {
      var addCourse = e.target.closest(".btn-add-course");
      if (addCourse) {
        var row = createCourseRow(addCourse.dataset.semId);
        byId("courses-" + addCourse.dataset.semId).appendChild(row);
        fadeIn(row);
        return recalcAll();
      }
      var delCourse = e.target.closest(".btn-delete-course");
      if (delCourse) {
        var courseRow = delCourse.closest(".course-row");
        if (courseRow.closest(".semester-box").querySelectorAll(".course-row").length <= 1) {
          return showToast("At least one course is required per semester.");
        }
        courseRow.classList.add("removing");
        return setTimeout(function () {
          courseRow.remove();
          recalcAll();
        }, 250);
      }
      var delSemester = e.target.closest(".btn-delete-semester");
      if (delSemester) {
        if (semesters.querySelectorAll(".semester-box").length <= 1)
          return showToast("At least one semester is required.");
        var box = delSemester.closest(".semester-box");
        box.classList.add("is-animating", "is-leaving");
        setTimeout(function () {
          box.remove();
          recalcAll();
        }, 250);
      }
    });

    byId("addSemesterBtn").addEventListener("click", function () {
      var box = createSemester();
      semesters.appendChild(box);
      fadeIn(box);
      recalcAll();
    });

    sgpaRows.addEventListener("input", calcSgpaToCgpa);
    sgpaRows.addEventListener("click", function (e) {
      var del = e.target.closest(".btn-delete-sgpa");
      if (!del) return;
      if (sgpaRows.querySelectorAll(".sgpa-row").length <= 1) return showToast("At least one row required.");
      del.closest(".sgpa-row").remove();
      calcSgpaToCgpa();
    });
    byId("addSGPARow").addEventListener("click", function () {
      sgpaRows.appendChild(createSgpaRow());
      calcSgpaToCgpa();
    });

    ["targetCGPA", "remainingCredits", "currentCGPA", "completedCredits"].forEach(function (id) {
      byId(id).addEventListener("input", calcTarget);
    });

    var downloadBtn = byId("downloadPDF");
    downloadBtn.addEventListener("click", function () {
      downloadReport(downloadBtn);
    });

    // The live bar appears once the calculator is on screen
    var stickyBar = byId("stickyBar");
    var section = document.querySelector(".calculator-section");
    if (section && "IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          var entry = entries[0];
          if (entry.isIntersecting) stickyBar.classList.add("visible");
          else if (entry.boundingClientRect.top > 0) stickyBar.classList.remove("visible");
        },
        { threshold: 0, rootMargin: "-60px 0px 0px 0px" },
      ).observe(section);
    }

    recalcAll();
  }

  init();
})();

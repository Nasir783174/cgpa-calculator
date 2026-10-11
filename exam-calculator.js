/* Shared SSC / HSC GPA calculator: grading engine and form UI.
   Each page first loads its own data file (ssc-data.js or hsc-data.js) which defines window.EXAM.
   The engine is pure (no DOM) so the maths stays easy to reason about. */
(function () {
  "use strict";

  var EXAM = window.EXAM;
  if (!EXAM) return;
  var ID = EXAM.id;
  var SUBJECTS = EXAM.subjects;
  var GROUPS = EXAM.groups;

  /* ---------- Grading scale (all Bangladesh general education boards) ---------- */
  var BANDS = [
    { min: 80, letter: "A+", point: 5 },
    { min: 70, letter: "A", point: 4 },
    { min: 60, letter: "A-", point: 3.5 },
    { min: 50, letter: "B", point: 3 },
    { min: 40, letter: "C", point: 2 },
    { min: 33, letter: "D", point: 1 },
    { min: 0, letter: "F", point: 0 },
  ];

  /* ---------- Engine ---------- */
  function validateMark(raw, max) {
    const v = String(raw == null ? "" : raw).trim();
    if (!v) return { valid: false, empty: true, message: "" };
    if (!/^\d+$/.test(v)) return { valid: false, empty: false, message: "Whole number only" };
    const mark = Number(v);
    if (mark > max) return { valid: false, empty: false, message: "Max is " + max };
    return { valid: true, empty: false, mark: mark, message: "" };
  }
  /* Integer comparison (mark*100 >= min*max) so 79.5% can never round up to A+. */
  function gradeFromMarks(mark, max) {
    if (!Number.isInteger(mark) || !Number.isInteger(max) || max <= 0 || mark < 0 || mark > max) return null;
    return BANDS.find((b) => mark * 100 >= b.min * max).letter;
  }
  function pointOf(letter) {
    const b = BANDS.find((x) => x.letter === letter);
    return b ? b.point : null;
  }
  function bonusOf(point) {
    return typeof point === "number" && point >= 0 && point <= 5 ? Math.max(0, point - 2) : null;
  }
  /* Round (numerator / n) to the nearest integer with exact integer maths (half rounds up). */
  function divRound(numerator, n) {
    const q = Math.floor(numerator / n);
    const r = numerator - q * n;
    return 2 * r >= n ? q + 1 : q;
  }
  /* mainLetters: array of letters for the main subjects (length must equal expectedMain).
     fourthLetter: letter of the fourth subject, or null/undefined when there is none.
     Returns hundredths so callers never touch floating point GPA values. */
  function calculateGpa(mainLetters, fourthLetter, expectedMain) {
    if (
      !Array.isArray(mainLetters) ||
      !Number.isInteger(expectedMain) ||
      expectedMain < 1 ||
      mainLetters.length !== expectedMain
    )
      return null;
    const points = mainLetters.map(pointOf);
    if (points.some((p) => p === null)) return null;
    let bonus = 0;
    if (fourthLetter) {
      const fp = pointOf(fourthLetter);
      if (fp === null) return null;
      bonus = bonusOf(fp);
    }
    const n = expectedMain;
    const failed = [];
    mainLetters.forEach((l, i) => {
      if (l === "F") failed.push(i);
    });
    const mainTotal = points.reduce((s, p) => s + p, 0);
    const totalHalves = Math.round((mainTotal + bonus) * 2);
    const mainHalves = Math.round(mainTotal * 2);
    return {
      n: n,
      mainTotal: mainTotal,
      bonus: bonus,
      total: totalHalves / 2,
      mainGpaHundredths: divRound(mainHalves * 50, n),
      failedIndexes: failed,
      passed: failed.length === 0,
      gpaHundredths: failed.length ? null : Math.min(500, divRound(totalHalves * 50, n)),
      capped: failed.length === 0 && totalHalves * 50 > 500 * n,
    };
  }

  /* ---------- UI ---------- */
  function init() {
    const form = document.getElementById(ID + "Form");
    const mainBox = document.getElementById(ID + "MainRows");
    const fourthBox = document.getElementById(ID + "FourthRows");
    const resultBox = document.getElementById(ID + "Result");
    const msgEl = document.getElementById(ID + "FormMessage");
    const resetBtn = document.getElementById(ID + "Reset");
    const countEl = document.getElementById(ID + "MainCount");
    if (!form || !mainBox || !fourthBox || !resultBox || !msgEl || !resetBtn) return;

    let group = EXAM.defaultGroup;
    let mode = "grade";
    let rows = [];
    let mainCount = 0;

    const mk = (tag, cls, text) => {
      const el = document.createElement(tag);
      if (cls) el.className = cls;
      if (text !== undefined) el.textContent = text;
      return el;
    };
    const f2 = (hundredths) => (hundredths / 100).toFixed(2);
    const gp2 = (n) => n.toFixed(2);
    const BN = {
      "\u09E6": "0",
      "\u09E7": "1",
      "\u09E8": "2",
      "\u09E9": "3",
      "\u09EA": "4",
      "\u09EB": "5",
      "\u09EC": "6",
      "\u09ED": "7",
      "\u09EE": "8",
      "\u09EF": "9",
    };
    const cleanDigits = (s) => s.replace(/[\u09E6-\u09EF]/g, (d) => BN[d]).replace(/\D/g, "");

    function invalidate() {
      resultBox.hidden = true;
      msgEl.textContent = "";
      rows.forEach((r) => {
        r.el.classList.remove("is-error");
        r.err.textContent = "";
      });
    }

    function currentMax(row) {
      return Number(row.maxEl.value || row.maxEl.dataset.value);
    }

    function refreshChip(row) {
      const v = validateMark(row.input.value, currentMax(row));
      const letter = v.valid ? gradeFromMarks(v.mark, currentMax(row)) : null;
      row.chip.textContent = letter || "\u2014";
      row.chip.dataset.grade = letter || "";
      row.err.textContent = !v.valid && !v.empty ? v.message : "";
      row.input.setAttribute("aria-invalid", String(!v.valid && !v.empty));
    }

    function setMaxFor(row) {
      const s = SUBJECTS[row.subjectId];
      row.maxWrap.replaceChildren();
      if (s.maxChoices) {
        const sel = mk("select", "ex-max");
        s.maxChoices.forEach((m) => {
          const o = mk("option", "", "/ " + m);
          o.value = String(m);
          sel.append(o);
        });
        sel.value = String(s.max);
        sel.setAttribute("aria-label", s.name + " full marks");
        sel.addEventListener("change", () => {
          invalidate();
          refreshChip(row);
        });
        row.maxEl = sel;
      } else {
        const span = mk("span", "ex-max-text", "/ " + s.max);
        span.dataset.value = String(s.max);
        row.maxEl = span;
      }
      row.maxWrap.append(row.maxEl);
    }

    function clearRow(row) {
      row.grade.value = "";
      row.input.value = "";
      setMaxFor(row);
      refreshChip(row);
      row.input.setAttribute("aria-invalid", "false");
      row.err.textContent = "";
    }

    function labelRow(row) {
      const s = SUBJECTS[row.subjectId];
      row.grade.setAttribute("aria-label", s.name + " grade");
      row.input.setAttribute("aria-label", s.name + " total marks");
      if (row.hintEl) row.hintEl.textContent = s.hint || "";
    }

    function changeSubject(row, nextId) {
      if (!row.choices || !row.choices.includes(nextId)) return;
      const prevId = row.subjectId;
      const other = rows.find((c) => c !== row && c.subjectId === nextId);
      if (other) {
        let replacement = null;
        if (other.choices && other.choices.includes(prevId)) replacement = prevId;
        else if (other.choices) {
          replacement = other.choices.find(
            (id) => id !== nextId && !rows.some((c) => c !== other && c !== row && c.subjectId === id),
          );
        }
        if (!replacement) {
          row.select.value = prevId;
          return;
        }
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
      const subjectId = typeof spec === "string" ? spec : spec.id;
      const choices = typeof spec === "string" ? null : spec.choices;
      const row = { subjectId: subjectId, choices: choices, optional: optional };
      const el = mk("div", "ex-row");
      row.el = el;

      const nameCell = mk("div", "ex-name-cell");
      if (choices) {
        row.select = mk("select", "ex-subject-select");
        row.select.id = ID + "Subject" + index;
        row.select.setAttribute("aria-label", optional ? "Fourth subject" : "Choose subject " + (index + 1));
        choices.forEach((id) => {
          const o = mk("option", "", SUBJECTS[id].name);
          o.value = id;
          row.select.append(o);
        });
        row.select.value = subjectId;
        row.select.addEventListener("change", () => changeSubject(row, row.select.value));
        nameCell.append(row.select);
      } else {
        nameCell.append(mk("span", "ex-name", SUBJECTS[subjectId].name));
      }
      row.hintEl = mk("span", "ex-hint");
      nameCell.append(row.hintEl);

      const field = mk("div", "ex-field");

      row.grade = mk("select", "ex-grade");
      row.grade.id = ID + "Grade" + index;
      const ph = mk("option", "", optional ? "None" : "Grade");
      ph.value = "";
      row.grade.append(ph);
      BANDS.forEach((b) => {
        const o = mk("option", "", b.letter);
        o.value = b.letter;
        row.grade.append(o);
      });
      row.grade.addEventListener("change", invalidate);

      const marks = mk("div", "ex-marks");
      row.input = mk("input", "ex-input");
      row.input.type = "text";
      row.input.inputMode = "numeric";
      row.input.autocomplete = "off";
      row.input.maxLength = 3;
      row.input.id = ID + "Marks" + index;
      row.input.placeholder = optional ? "Optional" : "Marks";
      row.maxWrap = mk("span", "ex-max-wrap");
      row.chip = mk("span", "ex-chip", "\u2014");
      marks.append(row.input, row.maxWrap, row.chip);

      row.err = mk("p", "ex-err");
      row.err.id = ID + "Err" + index;
      row.err.setAttribute("role", "alert");
      row.input.setAttribute("aria-describedby", row.err.id);

      field.append(row.grade, marks);
      el.append(nameCell, field, row.err);

      setMaxFor(row);
      labelRow(row);
      row.input.addEventListener("input", () => {
        const cleaned = cleanDigits(row.input.value);
        if (cleaned !== row.input.value) row.input.value = cleaned;
        el.classList.remove("is-error");
        resultBox.hidden = true;
        msgEl.textContent = "";
        refreshChip(row);
      });
      return row;
    }

    function buildGroup(next) {
      group = next;
      const cfg = GROUPS[group];
      mainCount = cfg.main.length;
      mainBox.replaceChildren();
      fourthBox.replaceChildren();
      rows = cfg.main.map((spec, i) => createRow(spec, i, false));
      rows.push(createRow(cfg.optional, mainCount, true));
      rows.slice(0, mainCount).forEach((r) => mainBox.append(r.el));
      fourthBox.append(rows[mainCount].el);
      if (countEl) countEl.textContent = String(mainCount);
      invalidate();
    }

    /* Read one row into { name, letter, blank, error } for the active input mode. */
    function readRow(row) {
      const name = SUBJECTS[row.subjectId].name;
      if (mode === "grade") {
        const letter = row.grade.value || null;
        return { name: name, letter: letter, blank: !letter, error: false };
      }
      const max = currentMax(row);
      const v = validateMark(row.input.value, max);
      if (v.empty) return { name: name, letter: null, blank: true, error: false };
      if (!v.valid) return { name: name, letter: null, blank: false, error: true };
      return { name: name, letter: gradeFromMarks(v.mark, max), blank: false, error: false };
    }

    function showResult(res, main, fourth) {
      resultBox.replaceChildren();
      const failedNames = res.failedIndexes.map((i) => main[i].name);
      const head = mk("div", "ex-res-head");
      const big = mk("div", "ex-res-big");
      big.append(
        mk("span", "ex-res-gpa", res.passed ? f2(res.gpaHundredths) : "\u2014"),
        mk("span", "ex-res-max", "/ 5.00"),
      );
      const pill = mk("span", "ex-pill", res.passed ? "Pass" : "Fail");
      pill.dataset.state = res.passed ? "pass" : "fail";
      head.append(big, pill);
      resultBox.append(head);

      if (!res.passed) {
        resultBox.append(
          mk(
            "p",
            "ex-res-note",
            "Failed: " + failedNames.join(", ") + ". No GPA is given when a main subject fails.",
          ),
        );
      }

      const stats = mk("div", "ex-stats");
      const stat = (label, value) => {
        const b = mk("div", "ex-stat");
        b.append(mk("span", "ex-stat-val", value), mk("span", "ex-stat-label", label));
        return b;
      };
      stats.append(
        stat("Main subjects GPA", f2(res.mainGpaHundredths)),
        stat("4th subject bonus", fourth.letter ? "+" + gp2(res.bonus) : "None"),
        stat("Total points", gp2(res.total)),
      );
      resultBox.append(stats);

      const det = mk("details", "ex-details");
      det.append(mk("summary", "", "Show calculation"));
      const line = (a, b) => {
        const p = mk("p", "ex-line");
        p.append(mk("strong", "", a + ": "), document.createTextNode(b));
        det.append(p);
      };
      const pts = main.map((r) => gp2(pointOf(r.letter)));
      line("Main points", pts.join(" + ") + " = " + gp2(res.mainTotal));
      line(
        "4th subject",
        fourth.letter
          ? fourth.name +
              " " +
              fourth.letter +
              ": max(0, " +
              gp2(pointOf(fourth.letter)) +
              " \u2212 2.00) = " +
              gp2(res.bonus)
          : "not entered, bonus 0.00",
      );
      line("Total", gp2(res.mainTotal) + " + " + gp2(res.bonus) + " = " + gp2(res.total));
      if (res.passed) {
        line(
          "GPA",
          gp2(res.total) +
            " \u00F7 " +
            res.n +
            " = " +
            (res.total / res.n).toFixed(4) +
            (res.capped ? ", capped at 5.00" : "") +
            " \u2192 " +
            f2(res.gpaHundredths),
        );
      }
      resultBox.append(det);

      const note =
        "Estimate only. Your official result is the one published by your education board." +
        (mode === "marks"
          ? " Marks mode cannot see separate MCQ, written or practical pass marks; if your marksheet shows F in any part, choose Grade mode and select F."
          : "");
      resultBox.append(mk("p", "ex-fine", note));
      resultBox.hidden = false;
      const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (resultBox.scrollIntoView)
        resultBox.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    }

    function calculate() {
      invalidate();
      const read = rows.map(readRow);
      const main = read.slice(0, mainCount);
      const fourth = read[mainCount];
      const problems = [];
      main.forEach((r, i) => {
        if (r.blank || r.error) {
          problems.push(r.name);
          rows[i].el.classList.add("is-error");
        }
      });
      if (fourth.error) {
        problems.push(fourth.name + " (4th)");
        rows[mainCount].el.classList.add("is-error");
      }
      if (problems.length) {
        msgEl.textContent =
          (mode === "grade" ? "Select a grade for: " : "Enter valid marks for: ") + problems.join(", ") + ".";
        const first = rows.find((r) => r.el.classList.contains("is-error"));
        if (first) (mode === "grade" ? first.grade : first.input).focus();
        return;
      }
      const res = calculateGpa(
        main.map((r) => r.letter),
        fourth.letter,
        mainCount,
      );
      if (!res) {
        msgEl.textContent = "Something went wrong. Please check your entries.";
        return;
      }
      showResult(res, main, fourth);
    }

    function setMode(next) {
      if (next === mode) return;
      if (next === "grade") {
        // Carry valid marks over so nothing the user typed is lost.
        rows.forEach((r) => {
          const v = validateMark(r.input.value, currentMax(r));
          if (v.valid) r.grade.value = gradeFromMarks(v.mark, currentMax(r));
        });
      }
      mode = next;
      form.dataset.mode = mode;
      rows.forEach(refreshChip);
      invalidate();
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      calculate();
    });
    form.querySelectorAll('input[name="' + ID + 'Group"]').forEach((i) => {
      i.addEventListener("change", () => {
        if (i.checked) buildGroup(i.value);
      });
    });
    form.querySelectorAll('input[name="' + ID + 'Mode"]').forEach((i) => {
      i.addEventListener("change", () => {
        if (i.checked) setMode(i.value);
      });
    });
    resetBtn.addEventListener("click", () => {
      buildGroup(group);
    });

    form.dataset.mode = mode;
    buildGroup(group);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

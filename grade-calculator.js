// Grade Calculator Page JS
// ─── GRADE CALCULATOR PAGE ───────────────────────────────────

(function () {
  if (!document.getElementById("gradeTableBody")) return;

  const GRADE_SYSTEMS = {
    4: {
      label: "4.0 Scale",
      getGrade: (marks) => {
        if (marks >= 80) return { letter: "A+", point: 4   };
        if (marks >= 75) return { letter: "A",  point: 3.75 };
        if (marks >= 70) return { letter: "A−", point: 3.5  };
        if (marks >= 65) return { letter: "B+", point: 3.25 };
        if (marks >= 60) return { letter: "B",  point: 3    };
        if (marks >= 55) return { letter: "B−", point: 2.75 };
        if (marks >= 50) return { letter: "C",  point: 2.5  };
        if (marks >= 40) return { letter: "D",  point: 2    };
        return { letter: "F", point: 0 };
      },
      passMin: 40,
    },
    5: {
      label: "5.0 Scale",
      getGrade: (marks) => {
        if (marks >= 80) return { letter: "A+", point: 5   };
        if (marks >= 75) return { letter: "A",  point: 4.5  };
        if (marks >= 70) return { letter: "A−", point: 4    };
        if (marks >= 65) return { letter: "B+", point: 3.5  };
        if (marks >= 60) return { letter: "B",  point: 3    };
        if (marks >= 55) return { letter: "B−", point: 2.5  };
        if (marks >= 50) return { letter: "C",  point: 2    };
        if (marks >= 40) return { letter: "D",  point: 1    };
        return { letter: "F", point: 0 };
      },
      passMin: 40,
    },
    10: {
      label: "10.0 Scale",
      getGrade: (marks) => {
        if (marks >= 90) return { letter: "O",  point: 10 };
        if (marks >= 80) return { letter: "A+", point: 9  };
        if (marks >= 70) return { letter: "A",  point: 8  };
        if (marks >= 60) return { letter: "B+", point: 7  };
        if (marks >= 55) return { letter: "B",  point: 6  };
        if (marks >= 50) return { letter: "C",  point: 5  };
        if (marks >= 40) return { letter: "P",  point: 4  };
        return { letter: "F", point: 0 };
      },
      passMin: 40,
    },
  };

  let activeSystem = "4";
  let rowCount     = 0;

  function getSystem() {
    return GRADE_SYSTEMS[activeSystem];
  }

  function addRow() {
    rowCount++;
    const id  = rowCount;
    const row = document.createElement("div");
    row.className    = "grade-row";
    row.dataset.rowId = id;

    row.innerHTML = `
      <input class="gr-subject"  placeholder="Subject name" aria-label="Subject" />
      <input type="number" class="gr-marks"   placeholder="0–100" min="0" max="100" aria-label="Marks" />
      <input type="number" class="gr-credit"  placeholder="Credits" min="0.5" step="0.5" value="3" aria-label="Credits" />
      <div class="gr-grade-cell">–</div>
      <button class="btn-del-gr" aria-label="Remove row">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6"  x2="6"  y2="18"/>
          <line x1="6"  y1="6"  x2="18" y2="18"/>
        </svg>
      </button>`;

    document.getElementById("gradeTableBody").appendChild(row);

    row.querySelector(".gr-marks").addEventListener("input", recalcGrade);
    row.querySelector(".gr-credit").addEventListener("input", recalcGrade);
    row.querySelector(".btn-del-gr").addEventListener("click", function () {
      row.classList.add("removing");
      setTimeout(() => { row.remove(); recalcGrade(); }, 180);
    });

    recalcGrade();
  }

  function recalcGrade() {
    const rows   = document.querySelectorAll("#gradeTableBody .grade-row");
    const system = getSystem();
    let totalPoints  = 0;
    let totalCredits = 0;
    let totalMarks   = 0;
    let subjectCount = 0;
    let failCount    = 0;

    rows.forEach((row) => {
      const marksInput  = row.querySelector(".gr-marks");
      const creditInput = row.querySelector(".gr-credit");
      const gradeCell   = row.querySelector(".gr-grade-cell");

      let marks  = parseFloat(marksInput.value);
      let credit = parseFloat(creditInput.value);

      if (isNaN(marks) || marksInput.value === "") {
        gradeCell.textContent = "–";
        gradeCell.className   = "gr-grade-cell";
        return;
      }

      marks  = Math.min(100, Math.max(0, marks));
      credit = (!credit || credit <= 0) ? 3 : credit;

      const { letter, point } = system.getGrade(marks);
      gradeCell.textContent = letter;
      gradeCell.className   = "gr-grade-cell " + (letter === "F" ? "grade-f" : "grade-pass");

      totalPoints  += point * credit;
      totalCredits += credit;
      totalMarks   += marks;
      subjectCount++;
      if (letter === "F") failCount++;
    });

    const gpa    = totalCredits > 0 ? totalPoints / totalCredits : 0;
    const avgPct = subjectCount  > 0 ? totalMarks / subjectCount  : 0;
    const status = failCount > 0 ? "Fail" : subjectCount > 0 ? "Pass" : "–";
    const color  = failCount > 0 ? "#DC2626" : "#059669";

    const gpaEl      = document.getElementById("grGPA");
    const pctEl      = document.getElementById("grPct");
    const statusEl   = document.getElementById("grStatus");
    const subjectsEl = document.getElementById("grSubjects");

    if (gpaEl)      gpaEl.textContent      = gpa.toFixed(2);
    if (pctEl)      pctEl.textContent      = avgPct.toFixed(1) + "%";
    if (statusEl)   { statusEl.textContent = status; statusEl.style.color = color; }
    if (subjectsEl) subjectsEl.textContent = subjectCount;
  }

  function predictGrade() {
    const targetGrade = document.getElementById("grTargetGrade").value;
    const system      = getSystem();

    const thresholds = {
      4:  { "A+": 80, "A": 75, "A−": 70, "B+": 65, "B": 60, "C": 50, "D": 40 },
      5:  { "A+": 80, "A": 75, "A−": 70, "B+": 65, "B": 60, "C": 50, "D": 40 },
      10: { "O": 90, "A+": 80, "A": 70, "B+": 60, "B": 55, "C": 50, "P": 40  },
    };

    const needed = thresholds[activeSystem][targetGrade];
    if (needed === undefined) return;

    const rows  = document.querySelectorAll("#gradeTableBody .grade-row");
    let total   = 0;
    let count   = 0;

    rows.forEach((row) => {
      const val = parseFloat(row.querySelector(".gr-marks").value);
      if (!isNaN(val) && row.querySelector(".gr-marks").value !== "") {
        total += val;
        count++;
      }
    });

    const resultEl  = document.getElementById("grPredResult");
    const card      = resultEl.querySelector(".pred-result-card");
    const statVal   = resultEl.querySelector(".pred-stat-val");
    const statLbl   = resultEl.querySelector(".pred-stat-label");
    const noteEl    = resultEl.querySelector(".pred-note");

    resultEl.className = "pred-result visible";

    if (count === 0) {
      statVal.textContent  = needed + "%";
      statLbl.textContent  = "Avg needed";
      card.className       = "pred-result-card";
      noteEl.textContent   = "Add subject marks first to get a personalised prediction.";
      return;
    }

    const avg = total / count;
    if (avg >= needed) {
      statVal.textContent  = "✓ Met";
      statLbl.textContent  = "Target reached";
      card.className       = "pred-result-card pred-achieved";
      noteEl.textContent   = `You're already averaging ${avg.toFixed(1)}% — you've met the target for ${targetGrade}!`;
    } else {
      statVal.textContent  = needed + "%";
      statLbl.textContent  = "Target avg";
      card.className       = "pred-result-card";
      noteEl.textContent   = `Aim for at least ${needed}% average. You're ${(needed - avg).toFixed(1)}% below the ${targetGrade} threshold right now.`;
    }
  }

  function updateTargetDropdown() {
    const sel = document.getElementById("grTargetGrade");
    if (!sel) return;
    if (activeSystem === "10") {
      sel.innerHTML = `
        <option value="O">O (90%+)</option>
        <option value="A+">A+ (80%+)</option>
        <option value="A">A (70%+)</option>
        <option value="B+" selected>B+ (60%+)</option>
        <option value="B">B (55%+)</option>
        <option value="C">C (50%+)</option>
        <option value="P">P (40%+)</option>`;
    } else {
      sel.innerHTML = `
        <option value="A+">A+ (80%+)</option>
        <option value="A">A (75%+)</option>
        <option value="A−">A− (70%+)</option>
        <option value="B+" selected>B+ (65%+)</option>
        <option value="B">B (60%+)</option>
        <option value="C">C (50%+)</option>
        <option value="D">D (40%+)</option>`;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    // System tabs
    document.querySelectorAll(".gsys-tab").forEach((tab) => {
      tab.addEventListener("click", function () {
        activeSystem = this.dataset.sys;
        document.querySelectorAll(".gsys-tab").forEach((t) =>
          t.classList.toggle("active", t.dataset.sys === activeSystem)
        );
        updateTargetDropdown();
        recalcGrade();
      });
    });

    const addBtn     = document.getElementById("grAddSubjectBtn");
    const predictBtn = document.getElementById("grPredictBtn");
    const printBtn   = document.getElementById("grPrintBtn");

    if (addBtn)     addBtn.addEventListener("click", addRow);
    if (predictBtn) predictBtn.addEventListener("click", predictGrade);
    if (printBtn)   printBtn.addEventListener("click", () => window.print());

    // Start with 3 default rows
    addRow(); addRow(); addRow();
  });
})();

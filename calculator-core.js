// ─── SCALE HELPERS ───────────────────────────────────────────
function getScale() {
  return SCALES[currentScale];
}

function getScaleMax() {
  return SCALES[currentScale].max;
}

function buildDropdown(selectedValue = null) {
  const scale = getScale();
  let html = `<option value="" disabled ${selectedValue === null ? "selected" : ""}>Grade</option>`;
  scale.grades.forEach((grade) => {
    const selected = selectedValue !== null && parseFloat(selectedValue) === grade.value ? "selected" : "";
    html += `<option value="${grade.value}" ${selected}>${grade.label}</option>`;
  });
  return html;
}

function getCGPAGrade(cgpa) {
  const max = getScaleMax();
  if (max === 10) {
    if (cgpa >= 9) return "Outstanding";
    if (cgpa >= 8) return "Excellent";
    if (cgpa >= 7) return "Very Good";
    if (cgpa >= 6) return "Good";
    if (cgpa >= 5) return "Average";
    if (cgpa >= 4) return "Pass";
    return "Fail";
  }
  if (max === 5) {
    if (cgpa >= 4.5) return "Excellent";
    if (cgpa >= 3.5) return "Very Good";
    if (cgpa >= 3) return "Good";
    if (cgpa >= 2) return "Average";
    if (cgpa >= 1) return "Pass";
    return "Fail";
  }
  if (max === 7) {
    if (cgpa >= 6.5) return "High Distinction";
    if (cgpa >= 5.5) return "Distinction";
    if (cgpa >= 4.5) return "Credit";
    if (cgpa >= 4) return "Pass";
    return "Fail";
  }
  if (max === 4.33) {
    if (cgpa >= 3.7) return "Excellent";
    if (cgpa >= 3) return "Good";
    if (cgpa >= 2) return "Satisfactory";
    if (cgpa >= 1) return "Pass";
    return "Fail";
  }
  if (cgpa >= 3.75) return "Excellent";
  if (cgpa >= 3.5) return "Very Good";
  if (cgpa >= 3) return "Good";
  if (cgpa >= 2.5) return "Average";
  if (cgpa >= 2) return "Below Average";
  return "Poor";
}

function getScaleLabelFull(scale) {
  const labels = {
    standard: "Standard 4.0 Scale",
    na: "North American 4.0 Scale",
    ten: "10-Point Scale",
    nigerian: "Nigerian 5.0 Scale",
    australian: "Australian 7.0 Scale",
    canadian: "Canadian 4.33 Scale"
  };
  return labels[scale] || "Standard 4.0 Scale";
}

// ─── COURSE ROW ──────────────────────────────────────────────
function createCourseRow(semId) {
  const row = document.createElement("div");
  row.className = "course-row";
  row.dataset.semId = semId;
  row.innerHTML = `
    <input type="text" class="course-name" placeholder="Course name" />
    <input type="number" class="course-credit" placeholder="Credits" min="0.5" step="0.5" />
    <select class="course-grade" aria-label="Grade">${buildDropdown(null)}</select>
    <button class="btn-delete-course" title="Remove course">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>`;
  row.querySelector(".course-grade").addEventListener("change", recalcAll);
  row.querySelector(".course-credit").addEventListener("input", recalcAll);
  row.querySelector(".course-name").addEventListener("input", recalcAll);
  row.querySelector(".btn-delete-course").addEventListener("click", function() {
    const semBox = document.querySelector(`.semester-box[data-sem-id="${semId}"]`);
    if (semBox.querySelectorAll(".course-row").length <= 1) {
      showToast("At least one course is required per semester.");
      return;
    }
    row.classList.add("removing");
    setTimeout(() => {
      row.remove();
      recalcAll();
    }, 250);
  });
  return row;
}

// ─── SEMESTER BOX ────────────────────────────────────────────
function createSemester() {
  semesterCount++;
  const id = semesterCount;
  const box = document.createElement("div");
  box.className = "semester-box";
  box.dataset.semId = id;
  box.innerHTML = `
    <div class="semester-header">
      <div class="semester-title-wrap">
        <span class="semester-num">Semester ${id}</span>
      </div>
      <div class="semester-right-wrap">
        <div class="semester-sgpa-wrap">
          <span class="sgpa-tag-label">SGPA</span>
          <span class="sgpa-tag-val" id="sgpa-sem-${id}">0.00</span>
        </div>
        <button class="btn-delete-semester" title="Remove semester">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </div>
    <div class="courses-container" id="courses-${id}"></div>
    <button class="btn-add-course" data-sem-id="${id}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      + Add Course
    </button>`;
  box.querySelector(".btn-delete-semester").addEventListener("click", function() {
    if (document.querySelectorAll(".semester-box").length <= 1) {
      showToast("At least one semester is required.");
      return;
    }
    box.style.transition = "opacity 0.25s, transform 0.25s";
    box.style.opacity = "0";
    box.style.transform = "translateY(-8px)";
    setTimeout(() => {
      box.remove();
      recalcAll();
    }, 250);
  });
  box.querySelector(".btn-add-course").addEventListener("click", function() {
    const semId = parseInt(this.dataset.semId);
    const container = document.getElementById(`courses-${semId}`);
    const newRow = createCourseRow(semId);
    newRow.style.opacity = "0";
    container.appendChild(newRow);
    requestAnimationFrame(() => {
      newRow.style.transition = "opacity 0.2s";
      newRow.style.opacity = "1";
    });
    recalcAll();
  });
  box.querySelector(`#courses-${id}`).appendChild(createCourseRow(id));
  return box;
}

// ─── SGPA ROW ────────────────────────────────────────────────
function createSGPARow() {
  sgpaRowCount++;
  const id = sgpaRowCount;
  const row = document.createElement("div");
  row.className = "sgpa-row";
  row.dataset.rowId = id;
  row.innerHTML = `
    <input type="text" class="sgpa-sem-name" placeholder="Semester ${id}" value="Semester ${id}" />
    <input type="number" class="sgpa-val-input" placeholder="SGPA" min="0" max="${getScaleMax()}" step="0.01" />
    <input type="number" class="sgpa-credit-input" placeholder="Credits" min="1" step="1" title="Total credits for this semester" />
    <button class="btn-delete-sgpa" title="Remove row">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>`;
  row.querySelector(".sgpa-val-input").addEventListener("input", calcSGPAtoCGPA);
  row.querySelector(".sgpa-credit-input").addEventListener("input", calcSGPAtoCGPA);
  row.querySelector(".btn-delete-sgpa").addEventListener("click", function() {
    if (document.querySelectorAll(".sgpa-row").length <= 1) {
      showToast("At least one row required.");
      return;
    }
    row.remove();
    calcSGPAtoCGPA();
  });
  return row;
}

// ─── CALCULATIONS ─────────────────────────────────────────────
function calcSGPA(semId) {
  // Courses with no grade selected are skipped (no points, no credit).
  let totalPoints = 0,
    totalCredits = 0;
  document.querySelectorAll(`.course-row[data-sem-id="${semId}"]`).forEach((row) => {
    const gradeRaw = row.querySelector(".course-grade").value;
    if (gradeRaw === "" || gradeRaw === null) return;
    const credit = parseFloat(row.querySelector(".course-credit").value) || 0;
    const grade = parseFloat(gradeRaw);
    if (isNaN(grade)) return;
    totalPoints += credit * grade;
    totalCredits += credit;
  });
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

// True when a course has credits entered but no grade selected yet.
function courseRowMissingGrade(row) {
  const credit = parseFloat(row.querySelector(".course-credit").value) || 0;
  const gradeRaw = row.querySelector(".course-grade").value;
  return credit > 0 && (gradeRaw === "" || gradeRaw === null);
}

function updateMissingGradeUI() {
  document.querySelectorAll(".course-row").forEach((row) => {
    const gradeSelect = row.querySelector(".course-grade");
    if (courseRowMissingGrade(row)) {
      gradeSelect.classList.add("course-grade-missing");
    } else {
      gradeSelect.classList.remove("course-grade-missing");
    }
  });
}

// Retakes: when several rows share the same course name, only the best grade
// counts toward CGPA; the others are dimmed and excluded. Unnamed rows are
// never grouped.
function computeOverallTotals() {
  const allRows = Array.from(document.querySelectorAll(".course-row"));
  allRows.forEach((row) => row.classList.remove("course-row-superseded"));

  const validRows = allRows.filter((row) => {
    if (courseRowMissingGrade(row)) return false;
    const gradeRaw = row.querySelector(".course-grade").value;
    if (gradeRaw === "" || gradeRaw === null) return false;
    const credit = parseFloat(row.querySelector(".course-credit").value) || 0;
    return credit > 0;
  });

  const groups = new Map();
  const ungrouped = [];
  validRows.forEach((row) => {
    const name = row.querySelector(".course-name").value.trim().toLowerCase();
    if (name === "") {
      ungrouped.push(row);
      return;
    }
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(row);
  });

  let weightedSum = 0,
    totalCredits = 0;
  const countRow = (row) => {
    const grade = parseFloat(row.querySelector(".course-grade").value);
    const credit = parseFloat(row.querySelector(".course-credit").value) || 0;
    weightedSum += grade * credit;
    totalCredits += credit;
  };

  ungrouped.forEach(countRow);
  groups.forEach((rows) => {
    if (rows.length === 1) {
      countRow(rows[0]);
      return;
    }
    let best = rows[0];
    rows.forEach((r) => {
      const g = parseFloat(r.querySelector(".course-grade").value);
      const bg = parseFloat(best.querySelector(".course-grade").value);
      if (g > bg) best = r;
    });
    countRow(best);
    rows.forEach((r) => {
      if (r !== best) r.classList.add("course-row-superseded");
    });
  });

  return { weightedSum, totalCredits };
}

function recalcAll() {
  const max = getScaleMax();
  const semesters = document.querySelectorAll(".semester-box");
  semesters.forEach((semBox) => {
    const semId = parseInt(semBox.dataset.semId);
    // SGPA is per-semester and unaffected by retake handling.
    const sgpa = calcSGPA(semId);
    const sgpaEl = document.getElementById(`sgpa-sem-${semId}`);
    if (sgpaEl) sgpaEl.textContent = sgpa.toFixed(2);
  });
  updateMissingGradeUI();
  const { weightedSum, totalCredits } = computeOverallTotals();
  const cgpa = totalCredits > 0 ? weightedSum / totalCredits : 0;
  const gradeLabel = cgpa > 0 ? getCGPAGrade(cgpa) : "–";
  animateValue(document.getElementById("cgpaDisplay"), parseFloat(document.getElementById("cgpaDisplay").textContent) || 0, cgpa, 400);
  document.getElementById("totalCredits").textContent = totalCredits.toFixed(1);
  document.getElementById("totalSemesters").textContent = semesters.length;
  document.getElementById("cgpaGradeLabel").textContent = gradeLabel;
  document.getElementById("cgpaBar").style.width = (cgpa / max * 100) + "%";
  document.getElementById("stickyCGPA").textContent = cgpa.toFixed(2);
  document.getElementById("stickyCredits").textContent = totalCredits.toFixed(1);
  document.getElementById("stickySemesters").textContent = semesters.length;
  document.getElementById("stickyGrade").textContent = gradeLabel;
  // Auto-fill Current CGPA unless the user is typing in it
  const _currentCGPAEl = document.getElementById("currentCGPA");
  if (document.activeElement !== _currentCGPAEl) {
    _currentCGPAEl.value = cgpa > 0 ? cgpa.toFixed(2) : "";
  }
  // Completed Credits auto-fills from the course table but stays editable, so a
  // hand-typed Current CGPA can be matched with its real credits.
  const _completedCreditsEl = document.getElementById("completedCredits");
  if (_completedCreditsEl && document.activeElement !== _completedCreditsEl) {
    _completedCreditsEl.value = totalCredits > 0 ? totalCredits.toFixed(1) : "";
  }
  calcTarget();
}

function calcTarget() {
  const max = getScaleMax();
  const completedCreditsEl = document.getElementById("completedCredits");
  const earnedCredits = completedCreditsEl ?
    (parseFloat(completedCreditsEl.value) || 0) :
    (parseFloat(document.getElementById("totalCredits").textContent) || 0);
  const currentCGPA = parseFloat(document.getElementById("currentCGPA").value) || 0;
  const targetCGPA = parseFloat(document.getElementById("targetCGPA").value) || 0;
  const remainCredits = parseFloat(document.getElementById("remainingCredits").value) || 0;
  const requiredEl = document.getElementById("requiredGPA");
  const resultEl = document.getElementById("targetResult");
  resultEl.className = "target-result";
  if (!targetCGPA || !remainCredits) {
    requiredEl.textContent = "–";
    return;
  }
  // A Current CGPA without Completed Credits would be silently ignored, so ask for it.
  if (currentCGPA > 0 && earnedCredits === 0) {
    requiredEl.textContent = "Enter Completed Credits";
    resultEl.classList.add("target-impossible");
    return;
  }
  if (targetCGPA > max) {
    requiredEl.textContent = "Exceeds scale max";
    resultEl.classList.add("target-impossible");
    return;
  }
  const required = (targetCGPA * (earnedCredits + remainCredits) - currentCGPA * earnedCredits) / remainCredits;
  if (required > max) {
    requiredEl.textContent = "Not Possible";
    resultEl.classList.add("target-impossible");
  } else if (required < 0) {
    requiredEl.textContent = "Already Achieved!";
    resultEl.classList.add("target-achieved");
  } else {
    requiredEl.textContent = required.toFixed(2);
    resultEl.classList.add("target-possible");
  }
}

function calcSGPAtoCGPA() {
  let weightedTotal = 0,
    totalCredits = 0,
    hasAnyCredit = false;
  let simpleTotal = 0,
    simpleCount = 0;
  const missingCreditRows = []; // rows with an SGPA but no credit

  document.querySelectorAll(".sgpa-row").forEach((row) => {
    const sgpaVal = parseFloat(row.querySelector(".sgpa-val-input").value);
    const creditEl = row.querySelector(".sgpa-credit-input");
    const creditVal = creditEl ? parseFloat(creditEl.value) : NaN;
    const hasCredit = !isNaN(creditVal) && creditVal > 0;

    // Always clear any previous highlight first, then re-apply if still missing.
    if (creditEl) creditEl.classList.remove("sgpa-credit-missing");

    if (!isNaN(sgpaVal)) {
      simpleTotal += sgpaVal;
      simpleCount++;
      if (hasCredit) {
        weightedTotal += sgpaVal * creditVal;
        totalCredits += creditVal;
        hasAnyCredit = true;
      } else {
        missingCreditRows.push(row);
      }
    }
  });

  // Weighted mode: semesters with an SGPA but no credit are flagged, not silently dropped.
  if (hasAnyCredit && missingCreditRows.length > 0) {
    missingCreditRows.forEach((row) => {
      const creditEl = row.querySelector(".sgpa-credit-input");
      if (creditEl) creditEl.classList.add("sgpa-credit-missing");
    });
  }

  const result = hasAnyCredit ?
    (weightedTotal / totalCredits) :
    (simpleCount > 0 ? simpleTotal / simpleCount : 0);
  document.getElementById("sgpaCGPA").textContent = result.toFixed(2);

  // Weighted indicator
  const noteEl = document.getElementById("sgpaWeightedNote");
  if (noteEl) noteEl.style.display = hasAnyCredit ? "inline" : "none";

  // Missing-credit warning
  const warnEl = document.getElementById("sgpaMissingCreditWarning");
  if (warnEl) {
    if (hasAnyCredit && missingCreditRows.length > 0) {
      const names = missingCreditRows
        .map((row) => row.querySelector(".sgpa-sem-name").value || "This semester")
        .join(", ");
      warnEl.textContent = missingCreditRows.length === 1 ?
        `⚠ "${names}" has no credit entered, so it is NOT counted in the CGPA above. Add its credit to include it.` :
        `⚠ These semesters have no credit entered, so they are NOT counted in the CGPA above: ${names}. Add their credits to include them.`;
      warnEl.style.display = "block";
    } else {
      warnEl.style.display = "none";
      warnEl.textContent = "";
    }
  }
}

// ─── UI HELPERS ───────────────────────────────────────────────
function animateValue(el, from, to, duration) {
  if (el._animFrame) cancelAnimationFrame(el._animFrame);
  const start = performance.now();
  el._animFrame = requestAnimationFrame(function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = progress < 0.5 ? 2 * progress * progress : (4 - 2 * progress) * progress - 1;
    el.textContent = (from + (to - from) * ease).toFixed(2);
    if (progress < 1) el._animFrame = requestAnimationFrame(tick);
    else el._animFrame = null;
  });
}

function updateAllDropdowns() {
  document.querySelectorAll(".course-grade").forEach((select) => {
    const current = parseFloat(select.value);
    const scale = getScale();
    const match = scale.grades.find((g) => g.value === current);
    select.innerHTML = buildDropdown(match ? match.value : null);
  });
  document.querySelectorAll(".sgpa-val-input").forEach((input) => {
    input.max = getScaleMax();
  });
  const scaleMax = getScaleMax();
  const currentCGPAEl = document.getElementById("currentCGPA");
  const targetCGPAEl = document.getElementById("targetCGPA");
  if (currentCGPAEl) currentCGPAEl.max = scaleMax;
  if (targetCGPAEl) targetCGPAEl.max = scaleMax;
  recalcAll();
}

function showToast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("toast-visible"));
  setTimeout(() => {
    toast.classList.remove("toast-visible");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── REPORT DOWNLOAD ──────────────────────────────────────────
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[ch]);
}

function downloadReport() {
  // Compute directly (not from the animated value) so the report matches the page.
  const { weightedSum: _weightedSum, totalCredits: _totalCreditsCalc } = computeOverallTotals();
  const _cgpaExact = _totalCreditsCalc > 0 ? _weightedSum / _totalCreditsCalc : 0;
  const cgpa = _cgpaExact.toFixed(2);
  const credits = document.getElementById("totalCredits").textContent;
  const semesters = document.getElementById("totalSemesters").textContent;
  const grade = getCGPAGrade(parseFloat(cgpa));
  const scaleName = getScaleLabelFull(currentScale);
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const targetCGPA = document.getElementById("targetCGPA").value;
  const remainCredit = document.getElementById("remainingCredits").value;
  const requiredGPA = document.getElementById("requiredGPA").textContent;
  const completedCreditsEl = document.getElementById("completedCredits");
  const completedCredits = completedCreditsEl ? completedCreditsEl.value : "";
  // Use the typed Current CGPA so the plan matches what Required GPA was based on.
  const currentCGPAForPlan = document.getElementById("currentCGPA").value || cgpa;
  let semestersHTML = "";
  document.querySelectorAll(".semester-box").forEach((semBox) => {
    const semId = parseInt(semBox.dataset.semId);
    const semName = `Semester ${semId}`;
    const sgpa = document.getElementById(`sgpa-sem-${semId}`)?.textContent || "0.00";
    let rowsHTML = "",
      semCredits = 0;
    semBox.querySelectorAll(".course-row").forEach((row, idx) => {
      const name = escapeHTML(row.querySelector(".course-name").value.trim() || "Unnamed Course");
      const credit = row.querySelector(".course-credit").value || "–";
      const gradeEl = row.querySelector(".course-grade");
      const gradeText = gradeEl.selectedIndex > 0 ? gradeEl.options[gradeEl.selectedIndex].text : "–";
      const gradePoint = parseFloat(gradeEl.value) || 0;
      // Count credits only when a grade is selected, matching the SGPA above.
      if (parseFloat(credit) && !courseRowMissingGrade(row)) semCredits += parseFloat(credit);
      rowsHTML += `<tr style="background:${idx%2===0?"#F4F0E6":"#fff"}"><td style="padding:8px 12px;border-bottom:1px solid #E6E0D2;">${name}</td><td style="padding:8px 12px;border-bottom:1px solid #E6E0D2;text-align:center;">${credit}</td><td style="padding:8px 12px;border-bottom:1px solid #E6E0D2;text-align:center;">${gradeText}</td><td style="padding:8px 12px;border-bottom:1px solid #E6E0D2;text-align:center;font-weight:700;color:#1F4D3A;">${gradePoint>0?gradePoint.toFixed(2):"–"}</td></tr>`;
    });
    semestersHTML += `<div style="margin-bottom:28px;break-inside:avoid;"><div style="background:#1F4D3A;border-radius:6px 6px 0 0;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;"><span style="color:#fff;font-weight:700;font-size:14px;">${semName}</span><span style="color:#fff;font-weight:700;font-size:15px;">SGPA: ${sgpa}</span></div><table style="width:100%;border-collapse:collapse;border:1px solid #E6E0D2;border-top:none;"><thead><tr style="background:#EAF1EC;"><th style="padding:8px 12px;text-align:left;font-size:11px;color:#1F4D3A;font-weight:700;text-transform:uppercase;border-bottom:1px solid #C5D8CC;">Course</th><th style="padding:8px 12px;text-align:center;font-size:11px;color:#1F4D3A;font-weight:700;text-transform:uppercase;border-bottom:1px solid #C5D8CC;">Credits</th><th style="padding:8px 12px;text-align:center;font-size:11px;color:#1F4D3A;font-weight:700;text-transform:uppercase;border-bottom:1px solid #C5D8CC;">Grade</th><th style="padding:8px 12px;text-align:center;font-size:11px;color:#1F4D3A;font-weight:700;text-transform:uppercase;border-bottom:1px solid #C5D8CC;">GP</th></tr></thead><tbody>${rowsHTML}</tbody></table><div style="text-align:right;font-size:12px;color:#999;margin-top:6px;">Credits: ${semCredits.toFixed(1)}</div></div>`;
  });
  let targetHTML = "";
  if (targetCGPA && remainCredit) {
    const color = requiredGPA === "Not Possible" ? "#c62828" : requiredGPA === "Already Achieved!" ? "#1F4D3A" : "#2e7d32";
    targetHTML = `<div style="background:#EAF1EC;border:1px solid #C5D8CC;border-radius:8px;padding:18px 20px;margin-bottom:28px;break-inside:avoid;"><div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#1F4D3A;margin-bottom:10px;">Target CGPA Plan</div><div style="display:flex;gap:32px;flex-wrap:wrap;"><div><div style="font-size:11px;color:#999;margin-bottom:2px;">Current CGPA</div><div style="font-size:18px;font-weight:700;">${currentCGPAForPlan}</div></div><div><div style="font-size:11px;color:#999;margin-bottom:2px;">Completed Credits</div><div style="font-size:18px;font-weight:700;">${completedCredits || "–"}</div></div><div><div style="font-size:11px;color:#999;margin-bottom:2px;">Target CGPA</div><div style="font-size:18px;font-weight:700;">${targetCGPA}</div></div><div><div style="font-size:11px;color:#999;margin-bottom:2px;">Remaining Credits</div><div style="font-size:18px;font-weight:700;">${remainCredit}</div></div><div><div style="font-size:11px;color:#999;margin-bottom:2px;">Required GPA</div><div style="font-size:22px;font-weight:700;color:${color};">${requiredGPA}</div></div></div></div>`;
  }
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>CGPA Report</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;background:#fff;color:#222}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{margin:18mm 16mm;size:A4}}</style></head><body><div style="background:#1F4D3A;padding:28px 32px 24px;"><div style="display:flex;justify-content:space-between;align-items:flex-start;"><div><div style="font-size:22px;font-weight:700;color:#fff;">◈ CGPA Tools</div><div style="font-size:13px;color:rgba(255,255,255,.6);margin-top:4px;">Academic CGPA Report</div></div><div style="text-align:right;"><div style="font-size:12px;color:rgba(255,255,255,.6);">Generated: ${date}</div><div style="font-size:12px;color:rgba(255,255,255,.6);margin-top:2px;">Scale: ${scaleName}</div></div></div></div><div style="background:#EAF1EC;padding:20px 32px;display:flex;gap:40px;align-items:center;margin-bottom:32px;border-bottom:2px solid #C5D8CC;"><div><div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#999;">Overall CGPA</div><div style="font-size:42px;font-weight:700;color:#1F4D3A;line-height:1.1;">${cgpa}</div><div style="font-size:13px;color:#1F4D3A;font-weight:700;margin-top:2px;">${grade}</div></div><div style="width:1px;height:60px;background:#C5D8CC;"></div><div><div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#999;">Total Credits</div><div style="font-size:28px;font-weight:700;color:#222;">${credits}</div></div><div style="width:1px;height:60px;background:#C5D8CC;"></div><div><div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#999;">Semesters</div><div style="font-size:28px;font-weight:700;color:#222;">${semesters}</div></div></div><div style="padding:0 32px 32px;">${targetHTML}${semestersHTML}<div style="margin-top:40px;padding-top:16px;border-top:1px solid #E6E0D2;display:flex;justify-content:space-between;font-size:11px;color:#999;"><span>Generated by CGPA Tools – cgpacalculator.dev</span><span>${date}</span></div></div></body></html>`;
  const blob = new Blob([html], {
    type: "text/html;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `CGPA-Report-${new Date().toISOString().slice(0,10)}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast("Report downloaded successfully!");
}

// ─── INIT (shared calculator init) ───────────────────────────
function initCalculator() {
  // Swap the pre-rendered static Semester 1 / SGPA row for live ones.
  document.querySelectorAll("[data-prerender]").forEach((el) => el.remove());
  const semContainer = document.getElementById("semestersContainer");
  semContainer.appendChild(createSemester());
  document.getElementById("addSemesterBtn").addEventListener("click", function() {
    const sem = createSemester();
    sem.style.opacity = "0";
    sem.style.transform = "translateY(12px)";
    semContainer.appendChild(sem);
    requestAnimationFrame(() => {
      sem.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      sem.style.opacity = "1";
      sem.style.transform = "translateY(0)";
    });
    recalcAll();
  });
  const sgpaContainer = document.getElementById("sgpaRowsContainer");
  sgpaContainer.appendChild(createSGPARow());
  document.getElementById("addSGPARow").addEventListener("click", function() {
    sgpaContainer.appendChild(createSGPARow());
    calcSGPAtoCGPA();
  });
  document.getElementById("targetCGPA").addEventListener("input", calcTarget);
  document.getElementById("remainingCredits").addEventListener("input", calcTarget);
  document.getElementById("currentCGPA").addEventListener("input", calcTarget);
  const completedCreditsEl = document.getElementById("completedCredits");
  if (completedCreditsEl) completedCreditsEl.addEventListener("input", calcTarget);
  document.getElementById("downloadPDF").addEventListener("click", downloadReport);
  const stickyBar = document.getElementById("stickyBar");
  const calcSection = document.querySelector(".calculator-section");
  const stickyObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) stickyBar.classList.add("visible");
    else if (entry.boundingClientRect.top > 0) stickyBar.classList.remove("visible");
  }, {
    threshold: 0,
    rootMargin: "-60px 0px 0px 0px"
  });
  if (calcSection) stickyObserver.observe(calcSection);
  recalcAll();
  // Header menu and FAQ accordion are handled by nav.js
}


const SCALES = {
  standard: {
    max: 4,
    grades: [
      { label: "A+ (4.00)", value: 4,    letter: "A+" },
      { label: "A  (3.75)", value: 3.75, letter: "A"  },
      { label: "A− (3.50)", value: 3.5,  letter: "A−" },
      { label: "B+ (3.25)", value: 3.25, letter: "B+" },
      { label: "B  (3.00)", value: 3,    letter: "B"  },
      { label: "B− (2.75)", value: 2.75, letter: "B−" },
      { label: "C+ (2.50)", value: 2.5,  letter: "C+" },
      { label: "C  (2.25)", value: 2.25, letter: "C"  },
      { label: "C− (2.00)", value: 2,    letter: "C−" },
      { label: "D  (1.75)", value: 1.75, letter: "D"  },
      { label: "F  (0.00)", value: 0,    letter: "F"  },
    ],
  },

  na: {
    max: 4,
    grades: [
      { label: "A  (4.00)", value: 4,   letter: "A"  },
      { label: "A− (3.70)", value: 3.7, letter: "A−" },
      { label: "B+ (3.30)", value: 3.3, letter: "B+" },
      { label: "B  (3.00)", value: 3,   letter: "B"  },
      { label: "B− (2.70)", value: 2.7, letter: "B−" },
      { label: "C+ (2.30)", value: 2.3, letter: "C+" },
      { label: "C  (2.00)", value: 2,   letter: "C"  },
      { label: "C− (1.70)", value: 1.7, letter: "C−" },
      { label: "D+ (1.30)", value: 1.3, letter: "D+" },
      { label: "D  (1.00)", value: 1,   letter: "D"  },
      { label: "F  (0.00)", value: 0,   letter: "F"  },
    ],
  },

  ten: {
    max: 10,
    grades: [
      { label: "O  (10.00)", value: 10, letter: "O"  },
      { label: "A+ (9.00)",  value: 9,  letter: "A+" },
      { label: "A  (8.00)",  value: 8,  letter: "A"  },
      { label: "B+ (7.00)",  value: 7,  letter: "B+" },
      { label: "B  (6.00)",  value: 6,  letter: "B"  },
      { label: "C  (5.00)",  value: 5,  letter: "C"  },
      { label: "P  (4.00)",  value: 4,  letter: "P"  },
      { label: "F  (0.00)",  value: 0,  letter: "F"  },
    ],
  },

  nigerian: {
    max: 5,
    grades: [
      { label: "A  (5.00)", value: 5, letter: "A" },
      { label: "B  (4.00)", value: 4, letter: "B" },
      { label: "C  (3.00)", value: 3, letter: "C" },
      { label: "D  (2.00)", value: 2, letter: "D" },
      { label: "E  (1.00)", value: 1, letter: "E" },
      { label: "F  (0.00)", value: 0, letter: "F" },
    ],
  },

  australian: {
    max: 7,
    grades: [
      { label: "HD (7.00)", value: 7, letter: "HD" },
      { label: "D  (6.00)", value: 6, letter: "D"  },
      { label: "C  (5.00)", value: 5, letter: "C"  },
      { label: "P  (4.00)", value: 4, letter: "P"  },
      { label: "F  (0.00)", value: 0, letter: "F"  },
    ],
  },

  canadian: {
    max: 4.33,
    grades: [
      { label: "A+ (4.33)", value: 4.33, letter: "A+" },
      { label: "A  (4.00)", value: 4,    letter: "A"  },
      { label: "A− (3.67)", value: 3.67, letter: "A−" },
      { label: "B+ (3.33)", value: 3.33, letter: "B+" },
      { label: "B  (3.00)", value: 3,    letter: "B"  },
      { label: "B− (2.67)", value: 2.67, letter: "B−" },
      { label: "C+ (2.33)", value: 2.33, letter: "C+" },
      { label: "C  (2.00)", value: 2,    letter: "C"  },
      { label: "C− (1.67)", value: 1.67, letter: "C−" },
      { label: "D+ (1.33)", value: 1.33, letter: "D+" },
      { label: "D  (1.00)", value: 1,    letter: "D"  },
      { label: "F  (0.00)", value: 0,    letter: "F"  },
    ],
  },
};

// ─── STATE ──────────────────────────────────────────────────

let currentScale  = "standard";
let semesterCount = 0;
let sgpaRowCount  = 0;

// ─── SCALE HELPERS ──────────────────────────────────────────

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
    if (cgpa >= 3)   return "Good";
    if (cgpa >= 2)   return "Average";
    if (cgpa >= 1)   return "Pass";
    return "Fail";
  }

  if (max === 7) {
    if (cgpa >= 6.5) return "High Distinction";
    if (cgpa >= 5.5) return "Distinction";
    if (cgpa >= 4.5) return "Credit";
    if (cgpa >= 4)   return "Pass";
    return "Fail";
  }

  if (max === 4.33) {
    if (cgpa >= 3.7) return "Excellent";
    if (cgpa >= 3)   return "Good";
    if (cgpa >= 2)   return "Satisfactory";
    if (cgpa >= 1)   return "Pass";
    return "Fail";
  }

  // Standard 4.0 / North American 4.0
  if (cgpa >= 3.75) return "Excellent";
  if (cgpa >= 3.5)  return "Very Good";
  if (cgpa >= 3)    return "Good";
  if (cgpa >= 2.5)  return "Average";
  if (cgpa >= 2)    return "Below Average";
  return "Poor";
}

function getScaleLabel(scale) {
  const labels = {
    standard:   "Standard Scale",
    na:         "North American",
    ten:        "10-Point Scale",
    nigerian:   "Nigerian 5.0",
    australian: "Australian 7.0",
    canadian:   "Canadian 4.33",
  };
  return labels[scale] || "Standard Scale";
}

function getScaleLabelFull(scale) {
  const labels = {
    standard:   "Standard Scale",
    na:         "North American Scale",
    ten:        "10-Point Scale",
    nigerian:   "Nigerian 5.0 Scale",
    australian: "Australian 7.0 Scale",
    canadian:   "Canadian 4.33 Scale",
  };
  return labels[scale] || "Standard Scale";
}

// ─── SCALE PREVIEW ──────────────────────────────────────────

function renderScalePreview() {
  const scale   = getScale();
  const preview = document.getElementById("scalePreview");
  if (!preview) return;

  const items = scale.grades.slice(0, 5).map((g) =>
    `<span class="preview-item">
      <span class="pi-letter">${g.letter}</span>
      <span class="pi-val">${g.value.toFixed(2)}</span>
    </span>`
  ).join("");

  preview.innerHTML = `
    <div class="preview-row">
      ${items}
      <span class="preview-more">+${scale.grades.length - 5} more</span>
    </div>`;
}

// ─── COURSE ROW ─────────────────────────────────────────────

function createCourseRow(semId, courseId) {
  const row = document.createElement("div");
  row.className      = "course-row";
  row.dataset.semId  = semId;
  row.dataset.courseId = courseId;

  row.innerHTML = `
    <input type="text" class="course-name" placeholder="Course name" />
    <input type="number" class="course-credit" placeholder="Credits" min="0.5" step="0.5" />
    <select class="course-grade" aria-label="Grade">${buildDropdown(null)}</select>
    <button class="btn-delete-course" title="Remove course">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>`;

  row.querySelector(".course-grade").addEventListener("change", recalcAll);
  row.querySelector(".course-credit").addEventListener("input", recalcAll);
  row.querySelector(".course-name").addEventListener("input", recalcAll);

  row.querySelector(".btn-delete-course").addEventListener("click", function () {
    const semBox   = document.querySelector(`.semester-box[data-sem-id="${semId}"]`);
    const rowCount = semBox.querySelectorAll(".course-row").length;

    if (rowCount <= 1) {
      showToast("At least one course is required per semester.");
      return;
    }

    row.classList.add("removing");
    setTimeout(() => { row.remove(); recalcAll(); }, 250);
  });

  return row;
}

// ─── SEMESTER BOX ───────────────────────────────────────────

function createSemester() {
  semesterCount++;
  const id  = semesterCount;
  const box = document.createElement("div");
  box.className    = "semester-box";
  box.dataset.semId = id;

  box.innerHTML = `
    <div class="semester-header">
      <div class="semester-title-wrap">
        <span class="semester-num">Semester ${id}</span>
        <input type="text" class="semester-name-input" placeholder="(optional name)" />
      </div>
      <div class="semester-right-wrap">
        <div class="semester-sgpa-wrap">
          <span class="sgpa-tag-label">SGPA</span>
          <span class="sgpa-tag-val" id="sgpa-sem-${id}">0.00</span>
        </div>
        <button class="btn-delete-semester" title="Remove semester">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="courses-container" id="courses-${id}"></div>
    <button class="btn-add-course" data-sem-id="${id}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      + Add Course
    </button>`;

  // Delete semester
  box.querySelector(".btn-delete-semester").addEventListener("click", function () {
    const total = document.querySelectorAll(".semester-box").length;
    if (total <= 1) {
      showToast("At least one semester is required.");
      return;
    }
    box.style.transition = "opacity 0.25s, transform 0.25s";
    box.style.opacity    = "0";
    box.style.transform  = "translateY(-8px)";
    setTimeout(() => { box.remove(); recalcAll(); }, 250);
  });

  // Add course button
  box.querySelector(".btn-add-course").addEventListener("click", function () {
    const semId    = parseInt(this.dataset.semId);
    const container = document.getElementById(`courses-${semId}`);
    const count    = container.querySelectorAll(".course-row").length;
    const newRow   = createCourseRow(semId, count + 1);

    newRow.style.opacity = "0";
    container.appendChild(newRow);
    requestAnimationFrame(() => {
      newRow.style.transition = "opacity 0.2s";
      newRow.style.opacity    = "1";
    });
    recalcAll();
  });

  box.querySelector(".semester-name-input").addEventListener("input", recalcAll);
  box.querySelector(`#courses-${id}`).appendChild(createCourseRow(id, 1));

  return box;
}

// ─── SGPA → CGPA CONVERTER ROW ──────────────────────────────

function createSGPARow() {
  sgpaRowCount++;
  const id  = sgpaRowCount;
  const row = document.createElement("div");
  row.className    = "sgpa-row";
  row.dataset.rowId = id;

  row.innerHTML = `
    <input type="text"   class="sgpa-sem-name"  placeholder="Semester ${id}" value="Semester ${id}" />
    <input type="number" class="sgpa-val-input"  placeholder="0.00" min="0" max="${getScaleMax()}" step="0.01" />
    <input type="number" class="sgpa-credit-input" placeholder="—" min="0.5" step="0.5" />
    <button class="btn-delete-sgpa" title="Remove row">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>`;

  row.querySelector(".sgpa-val-input").addEventListener("input", calcSGPAtoCGPA);
  row.querySelector(".sgpa-credit-input").addEventListener("input", calcSGPAtoCGPA);

  row.querySelector(".btn-delete-sgpa").addEventListener("click", function () {
    if (document.querySelectorAll(".sgpa-row").length <= 1) {
      showToast("At least one row required.");
      return;
    }
    row.remove();
    calcSGPAtoCGPA();
  });

  return row;
}

// ─── CALCULATIONS ────────────────────────────────────────────

function calcSGPA(semId) {
  let totalPoints  = 0;
  let totalCredits = 0;

  document.querySelectorAll(`.course-row[data-sem-id="${semId}"]`).forEach((row) => {
    const credit = parseFloat(row.querySelector(".course-credit").value) || 0;
    const grade  = parseFloat(row.querySelector(".course-grade").value)  || 0;
    totalPoints  += credit * grade;
    totalCredits += credit;
  });

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

function recalcAll() {
  let weightedSum  = 0;
  let totalCredits = 0;
  const max        = getScaleMax();
  const semesters  = document.querySelectorAll(".semester-box");

  semesters.forEach((semBox) => {
    const semId   = parseInt(semBox.dataset.semId);
    const sgpa    = calcSGPA(semId);
    const credits = Array.from(semBox.querySelectorAll(".course-credit"))
      .reduce((sum, el) => sum + (parseFloat(el.value) || 0), 0);

    weightedSum  += sgpa * credits;
    totalCredits += credits;

    const sgpaEl = document.getElementById(`sgpa-sem-${semId}`);
    if (sgpaEl) sgpaEl.textContent = sgpa.toFixed(2);
  });

  const cgpa      = totalCredits > 0 ? weightedSum / totalCredits : 0;
  const gradeLabel = cgpa > 0 ? getCGPAGrade(cgpa) : "–";

  // Main display
  animateValue(document.getElementById("cgpaDisplay"), parseFloat(document.getElementById("cgpaDisplay").textContent) || 0, cgpa, 400);
  document.getElementById("totalCredits").textContent   = totalCredits.toFixed(1);
  document.getElementById("totalSemesters").textContent = semesters.length;
  document.getElementById("cgpaGradeLabel").textContent = gradeLabel;
  document.getElementById("cgpaBar").style.width        = (cgpa / max * 100) + "%";

  // Sticky bar
  document.getElementById("stickyCGPA").textContent     = cgpa.toFixed(2);
  document.getElementById("stickyCredits").textContent  = totalCredits.toFixed(1);
  document.getElementById("stickySemesters").textContent = semesters.length;
  document.getElementById("stickyGrade").textContent    = gradeLabel;

  // Target calculator sync
  document.getElementById("currentCGPA").value = cgpa > 0 ? cgpa.toFixed(2) : "";
  calcTarget();
}

function calcTarget() {
  const max            = getScaleMax();
  const earnedCredits  = parseFloat(document.getElementById("totalCredits").textContent) || 0;
  const currentCGPA    = parseFloat(document.getElementById("currentCGPA").value) || 0;
  const targetCGPA     = parseFloat(document.getElementById("targetCGPA").value)  || 0;
  const remainCredits  = parseFloat(document.getElementById("remainingCredits").value) || 0;
  const requiredEl     = document.getElementById("requiredGPA");
  const resultEl       = document.getElementById("targetResult");

  resultEl.className = "target-result";

  if (!targetCGPA || !remainCredits) {
    requiredEl.textContent = "–";
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
  let weightedSum  = 0;
  let totalCredits = 0;
  let unweighted   = 0;
  let count        = 0;

  document.querySelectorAll(".sgpa-row").forEach((row) => {
    const sgpa   = parseFloat(row.querySelector(".sgpa-val-input").value);
    const credit = parseFloat(row.querySelector(".sgpa-credit-input").value);
    if (isNaN(sgpa)) return;
    unweighted += sgpa;
    count++;
    if (!isNaN(credit) && credit > 0) {
      weightedSum  += sgpa * credit;
      totalCredits += credit;
    }
  });

  const result = totalCredits > 0
    ? weightedSum / totalCredits          // credit-weighted
    : count > 0 ? unweighted / count : 0; // plain average fallback when no credits entered

  const noteEl = document.getElementById("sgpaWeightedNote");
  if (noteEl) noteEl.style.display = totalCredits > 0 ? "inline" : "none";

  document.getElementById("sgpaCGPA").textContent = result.toFixed(2);
}

// ─── UI HELPERS ─────────────────────────────────────────────

function animateValue(el, from, to, duration) {
  const start = performance.now();

  requestAnimationFrame(function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    // ease-in-out cubic
    const ease = progress < 0.5
      ? 2 * progress * progress
      : (4 - 2 * progress) * progress - 1;

    el.textContent = (from + (to - from) * ease).toFixed(2);
    if (progress < 1) requestAnimationFrame(tick);
  });
}

function updateAllDropdowns() {
  document.querySelectorAll(".course-grade").forEach((select) => {
    const current = parseFloat(select.value);
    const scale   = getScale();
    const match   = scale.grades.find((g) => g.value === current);
    select.innerHTML = buildDropdown(match ? match.value : null);
  });

  document.querySelectorAll(".sgpa-val-input").forEach((input) => {
    input.max = getScaleMax();
  });

  renderScalePreview();
  recalcAll();
}

function showToast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className   = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast-visible"));
  setTimeout(() => {
    toast.classList.remove("toast-visible");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function closeMobileMenu() {
  document.getElementById("mobileMenu").classList.remove("open");
  document.getElementById("hamburger").classList.remove("active");
}

// ─── PDF REPORT ──────────────────────────────────────────────

function generatePDF() {
  const cgpa      = document.getElementById("cgpaDisplay").textContent;
  const credits   = document.getElementById("totalCredits").textContent;
  const semesters = document.getElementById("totalSemesters").textContent;
  const grade     = getCGPAGrade(parseFloat(cgpa));
  const scaleName = getScaleLabelFull(currentScale);
  const date      = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const targetCGPA   = document.getElementById("targetCGPA").value;
  const remainCredit = document.getElementById("remainingCredits").value;
  const requiredGPA  = document.getElementById("requiredGPA").textContent;

  // Build semester tables
  let semestersHTML = "";
  document.querySelectorAll(".semester-box").forEach((semBox) => {
    const semId   = parseInt(semBox.dataset.semId);
    const semName = semBox.querySelector(".semester-name-input").value.trim() || `Semester ${semId}`;
    const sgpa    = document.getElementById(`sgpa-sem-${semId}`)?.textContent || "0.00";
    let rowsHTML  = "";
    let semCredits = 0;

    semBox.querySelectorAll(".course-row").forEach((row, idx) => {
      const name   = row.querySelector(".course-name").value.trim() || "Unnamed Course";
      const credit = row.querySelector(".course-credit").value || "–";
      const gradeEl = row.querySelector(".course-grade");
      const gradeText = gradeEl.selectedIndex > 0 ? gradeEl.options[gradeEl.selectedIndex].text : "–";
      const gradePoint = parseFloat(gradeEl.value) || 0;

      if (parseFloat(credit)) semCredits += parseFloat(credit);

      rowsHTML += `
        <tr style="background:${idx % 2 === 0 ? "#fff8f4" : "#ffffff"}">
          <td style="padding:8px 12px;border-bottom:1px solid #f0d0d0;">${name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0d0d0;text-align:center;">${credit}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0d0d0;text-align:center;">${gradeText}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0d0d0;text-align:center;font-weight:700;color:#CD1C18;">
            ${gradePoint > 0 ? gradePoint.toFixed(2) : "–"}
          </td>
        </tr>`;
    });

    semestersHTML += `
      <div style="margin-bottom:28px;break-inside:avoid;">
        <div style="background:#CD1C18;border-radius:6px 6px 0 0;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#fff;font-weight:700;font-size:14px;">${semName}</span>
          <span style="color:#fff;font-weight:700;font-size:15px;">SGPA: ${sgpa}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #f0d0d0;border-top:none;">
          <thead>
            <tr style="background:#fff0ee;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;letter-spacing:.08em;color:#CD1C18;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ffc5bb;">Course</th>
              <th style="padding:8px 12px;text-align:center;font-size:11px;letter-spacing:.08em;color:#CD1C18;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ffc5bb;">Credits</th>
              <th style="padding:8px 12px;text-align:center;font-size:11px;letter-spacing:.08em;color:#CD1C18;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ffc5bb;">Grade</th>
              <th style="padding:8px 12px;text-align:center;font-size:11px;letter-spacing:.08em;color:#CD1C18;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ffc5bb;">GP</th>
            </tr>
          </thead>
          <tbody>${rowsHTML}</tbody>
        </table>
        <div style="text-align:right;font-size:12px;color:#999;margin-top:6px;">Credits: ${semCredits.toFixed(1)}</div>
      </div>`;
  });

  // Target section (optional)
  let targetHTML = "";
  if (targetCGPA && remainCredit) {
    const isPossible  = requiredGPA !== "Not Possible" && requiredGPA !== "Already Achieved!";
    const color       = requiredGPA === "Not Possible" ? "#c62828" : requiredGPA === "Already Achieved!" ? "#CD1C18" : "#2e7d32";
    targetHTML = `
      <div style="background:#fff0ee;border:1px solid #ffc5bb;border-radius:8px;padding:18px 20px;margin-bottom:28px;break-inside:avoid;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#CD1C18;margin-bottom:10px;">Target CGPA Plan</div>
        <div style="display:flex;gap:32px;flex-wrap:wrap;">
          <div><div style="font-size:11px;color:#999;margin-bottom:2px;">Current CGPA</div><div style="font-size:18px;font-weight:700;">${cgpa}</div></div>
          <div><div style="font-size:11px;color:#999;margin-bottom:2px;">Target CGPA</div><div style="font-size:18px;font-weight:700;">${targetCGPA}</div></div>
          <div><div style="font-size:11px;color:#999;margin-bottom:2px;">Remaining Credits</div><div style="font-size:18px;font-weight:700;">${remainCredit}</div></div>
          <div><div style="font-size:11px;color:#999;margin-bottom:2px;">Required GPA</div><div style="font-size:22px;font-weight:700;color:${color};">${requiredGPA}</div></div>
        </div>
      </div>`;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>CGPA Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; background: #fff; color: #222; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 18mm 16mm; size: A4; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="background:#CD1C18;padding:28px 32px 24px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div style="font-size:22px;font-weight:700;color:#fff;">◈ CGPA Calculator</div>
        <div style="font-size:13px;color:rgba(255,255,255,.6);margin-top:4px;">Academic CGPA Report</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px;color:rgba(255,255,255,.6);">Generated: ${date}</div>
        <div style="font-size:12px;color:rgba(255,255,255,.6);margin-top:2px;">Scale: ${scaleName}</div>
      </div>
    </div>
  </div>

  <!-- Summary bar -->
  <div style="background:#fff0ee;padding:20px 32px;display:flex;gap:40px;align-items:center;margin-bottom:32px;border-bottom:2px solid #ffc5bb;">
    <div>
      <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#999;">Overall CGPA</div>
      <div style="font-size:42px;font-weight:700;color:#CD1C18;line-height:1.1;">${cgpa}</div>
      <div style="font-size:13px;color:#CD1C18;font-weight:700;margin-top:2px;">${grade}</div>
    </div>
    <div style="width:1px;height:60px;background:#ffc5bb;"></div>
    <div>
      <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#999;">Total Credits</div>
      <div style="font-size:28px;font-weight:700;color:#222;">${credits}</div>
    </div>
    <div style="width:1px;height:60px;background:#ffc5bb;"></div>
    <div>
      <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#999;">Semesters</div>
      <div style="font-size:28px;font-weight:700;color:#222;">${semesters}</div>
    </div>
  </div>

  <!-- Content -->
  <div style="padding:0 32px 32px;">
    ${targetHTML}
    ${semestersHTML}
    <div style="margin-top:40px;padding-top:16px;border-top:1px solid #f0d0d0;display:flex;justify-content:space-between;font-size:11px;color:#999;">
      <span>Generated by CGPA Calculator – cgpacalculator.dev</span>
      <span>${date}</span>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = `CGPA-Report-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast("Report downloaded successfully!");
}

// ─── INIT ────────────────────────────────────────────────────

function init() {
  // Scale toggle dropdown
  const toggleBtn   = document.getElementById("scaleToggleBtn");
  const scaleBody   = document.getElementById("scaleBody");
  const toggleArrow = document.getElementById("scaleToggleArrow");
  const toggleVal   = document.getElementById("scaleToggleVal");

  if (toggleBtn && scaleBody) {
    toggleBtn.addEventListener("click", function () {
      const isOpen = scaleBody.classList.toggle("open");
      toggleArrow.style.transform = isOpen ? "rotate(180deg)" : "";
    });
  }

  // Scale label elements
  const scaleLabels = {
    standard:   document.getElementById("scaleStandardLabel"),
    na:         document.getElementById("scaleNALabel"),
    ten:        document.getElementById("scaleTenLabel"),
    nigerian:   document.getElementById("scaleNigerianLabel"),
    australian: document.getElementById("scaleAustralianLabel"),
    canadian:   document.getElementById("scaleCanadianLabel"),
  };

  // Scale radio change
  document.querySelectorAll('input[name="scale"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      currentScale = this.value;

      if (toggleVal) toggleVal.textContent = getScaleLabel(currentScale);

      Object.entries(scaleLabels).forEach(([key, el]) => {
        if (el) el.classList.toggle("scale-active", key === currentScale);
      });

      updateAllDropdowns();

      // Update target input max values to match new scale
      const scaleMax = getScaleMax();
      const currentCGPAEl  = document.getElementById("currentCGPA");
      const targetCGPAEl   = document.getElementById("targetCGPA");
      if (currentCGPAEl) currentCGPAEl.max = scaleMax;
      if (targetCGPAEl)  targetCGPAEl.max  = scaleMax;

      if (scaleBody) {
        scaleBody.classList.remove("open");
        if (toggleArrow) toggleArrow.style.transform = "";
      }
    });
  });

  // Set default active label
  if (scaleLabels.standard) scaleLabels.standard.classList.add("scale-active");
  renderScalePreview();

  // Semesters
  const semContainer = document.getElementById("semestersContainer");
  semContainer.appendChild(createSemester());

  document.getElementById("addSemesterBtn").addEventListener("click", function () {
    const sem = createSemester();
    sem.style.opacity   = "0";
    sem.style.transform = "translateY(12px)";
    semContainer.appendChild(sem);
    requestAnimationFrame(() => {
      sem.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      sem.style.opacity    = "1";
      sem.style.transform  = "translateY(0)";
    });
    recalcAll();
  });

  // SGPA → CGPA converter
  const sgpaContainer = document.getElementById("sgpaRowsContainer");
  sgpaContainer.appendChild(createSGPARow());

  document.getElementById("addSGPARow").addEventListener("click", function () {
    sgpaContainer.appendChild(createSGPARow());
    calcSGPAtoCGPA();
  });

  // Target calculator inputs
  document.getElementById("targetCGPA").addEventListener("input", calcTarget);
  document.getElementById("remainingCredits").addEventListener("input", calcTarget);
  document.getElementById("currentCGPA").addEventListener("input", calcTarget);

  // PDF download
  document.getElementById("downloadPDF").addEventListener("click", generatePDF);

  // Hamburger menu
  document.getElementById("hamburger").addEventListener("click", function () {
    this.classList.toggle("active");
    document.getElementById("mobileMenu").classList.toggle("open");
  });

  // Sticky bar visibility (IntersectionObserver)
  const stickyBar     = document.getElementById("stickyBar");
  const calcSection   = document.querySelector(".calculator-section");
  const stickyObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        stickyBar.classList.add("visible");
      } else if (entry.boundingClientRect.top > 0) {
        stickyBar.classList.remove("visible");
      }
    },
    { threshold: 0, rootMargin: "-60px 0px 0px 0px" }
  );
  if (calcSection) stickyObserver.observe(calcSection);

  recalcAll();

  // FAQ accordion
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", function () {
      const isOpen = this.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq-question").forEach((q) => {
        q.setAttribute("aria-expanded", "false");
        q.nextElementSibling.classList.remove("open");
      });
      if (!isOpen) {
        this.setAttribute("aria-expanded", "true");
        this.nextElementSibling.classList.add("open");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", init);



// ─── CGPA ↔ PERCENTAGE CONVERTER ────────────────────────────

(function () {
  "use strict";

  if (!document.getElementById("inputValue") || !document.getElementById("formulaSelect")) return;

  let mode = "cgpa"; // "cgpa" | "percent"

  const FORMULAS = {
    cbse: {
      toPercent: (c) => c * 9.5,
      toCgpa:    (p) => p / 9.5,
      display:   (v) => mode === "cgpa"
        ? `${v} × 9.5 = ${(v * 9.5).toFixed(2)}%`
        : `${v} ÷ 9.5 = ${(v / 9.5).toFixed(2)} CGPA`,
    },
    aicte: {
      toPercent: (c) => (c - 0.75) * 10,
      toCgpa:    (p) => p / 10 + 0.75,
      display:   (v) => mode === "cgpa"
        ? `(${v} − 0.75) × 10 = ${((v - 0.75) * 10).toFixed(2)}%`
        : `(${v} ÷ 10) + 0.75 = ${(v / 10 + 0.75).toFixed(2)} CGPA`,
    },
    "10pt": {
      toPercent: (c) => c * 10,
      toCgpa:    (p) => p / 10,
      display:   (v) => mode === "cgpa"
        ? `${v} × 10 = ${(v * 10).toFixed(2)}%`
        : `${v} ÷ 10 = ${(v / 10).toFixed(2)} CGPA`,
    },
    "4pt": {
      toPercent: (c) => (c / 4) * 100,
      toCgpa:    (p) => (p / 100) * 4,
      display:   (v) => mode === "cgpa"
        ? `(${v} ÷ 4.0) × 100 = ${((v / 4) * 100).toFixed(2)}%`
        : `(${v} ÷ 100) × 4.0 = ${((v / 100) * 4).toFixed(2)} CGPA`,
    },
    "5pt": {
      toPercent: (c) => c * 20,
      toCgpa:    (p) => p / 20,
      display:   (v) => mode === "cgpa"
        ? `${v} × 20 = ${(v * 20).toFixed(2)}%`
        : `${v} ÷ 20 = ${(v / 20).toFixed(2)} CGPA`,
    },
  };

  function showError(msg) {
    const el = document.getElementById("fieldError");
    el.textContent  = msg;
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

  window.switchTab = function (tab) {
    mode = tab;
    const inputEl  = document.getElementById("inputValue");
    const labelEl  = document.getElementById("inputLabel");
    const tabCgpa  = document.getElementById("tabCgpa");
    const tabPct   = document.getElementById("tabPct");
    const resultLbl = document.getElementById("resultLabel");

    if (mode === "cgpa") {
      tabCgpa.classList.add("active");    tabCgpa.setAttribute("aria-selected", "true");
      tabPct.classList.remove("active");  tabPct.setAttribute("aria-selected", "false");
      labelEl.textContent    = "Enter CGPA";
      inputEl.placeholder    = "e.g. 8.5";
      inputEl.max            = "10";
      resultLbl.textContent  = "Your Percentage";
    } else {
      tabPct.classList.add("active");      tabPct.setAttribute("aria-selected", "true");
      tabCgpa.classList.remove("active");  tabCgpa.setAttribute("aria-selected", "false");
      labelEl.textContent    = "Enter Percentage";
      inputEl.placeholder    = "e.g. 85";
      inputEl.max            = "100";
      resultLbl.textContent  = "Your CGPA";
    }

    clearError();
    hideResult();
  };

  window.calculate = function () {
    const formula  = document.getElementById("formulaSelect").value;
    const value    = parseFloat(document.getElementById("inputValue").value.trim());
    const fn       = FORMULAS[formula];

    if (isNaN(value) || value < 0) {
      showError("Please enter a valid number.");
      shakeInput();
      return;
    }

    if (mode === "cgpa") {
      const maxCGPA = formula === "4pt" ? 4 : formula === "5pt" ? 5 : 10;
      if (value > maxCGPA) {
        showError(`CGPA cannot exceed ${maxCGPA} for this scale.`);
        shakeInput();
        return;
      }
    } else if (value > 100) {
      showError("Percentage cannot exceed 100.");
      shakeInput();
      return;
    }

    clearError();

    let result, display;
    if (mode === "cgpa") {
      result  = fn.toPercent(value);
      display = `${Math.round(result * 100) / 100}%`;
    } else {
      result  = fn.toCgpa(value);
      display = `${Math.round(result * 100) / 100}`;
    }

    document.getElementById("resultValue").textContent   = display;
    document.getElementById("resultFormula").textContent = "Formula: " + fn.display(value);
    document.getElementById("resultPanel").classList.add("visible");
  };

  window.resetAll = function () {
    document.getElementById("inputValue").value = "";
    clearError();
    hideResult();
  };

  window.copyResult = function () {
    const text   = document.getElementById("resultValue").textContent;
    const btn    = document.getElementById("copyBtn");

    function onCopied() {
      btn.textContent = "Copied!";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1800);
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

  window.toggleFaq = function (el) {
    const item   = el.closest(".faq-item");
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach((i) => i.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
  };

  document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("inputValue");
    if (input) input.addEventListener("keydown", (e) => { if (e.key === "Enter") window.calculate(); });
  });
})();

// ─── GPA ↔ CGPA CONVERTER PAGE ───────────────────────────────

(function () {
  "use strict";

  function toNum(id) {
    return parseFloat(document.getElementById(id).value) || 0;
  }

  function calcGpaToCgpa() {
    const gpa         = toNum("gpaInput");
    const fromScale   = toNum("gpaScale");
    const toScale     = toNum("cgpaTargetScale");
    const panel       = document.getElementById("gpaToCgpaPanel");
    const errorEl     = document.getElementById("gpaInputError");
    const inputEl     = document.getElementById("gpaInput");

    errorEl.style.display = "none";

    if (document.getElementById("gpaInput").value.trim() === "") {
      panel.classList.remove("visible");
      return;
    }

    if (isNaN(parseFloat(document.getElementById("gpaInput").value)) || gpa < 0 || gpa > fromScale) {
      errorEl.textContent  = `Enter a valid GPA between 0 and ${fromScale}.`;
      errorEl.style.display = "block";
      inputEl.classList.add("error-shake");
      setTimeout(() => inputEl.classList.remove("error-shake"), 400);
      panel.classList.remove("visible");
      return;
    }

    const converted = fromScale > 0 ? (gpa / fromScale) * toScale : 0;
    const percent   = fromScale > 0 ? (gpa / fromScale) * 100 : 0;

    document.getElementById("gpaToCgpaValue").textContent   = converted.toFixed(2);
    document.getElementById("gpaToCgpaPct").textContent     = percent.toFixed(2) + "%";
    document.getElementById("gpaToCgpaFormula").textContent =
      `Formula: (${gpa} ÷ ${fromScale}) × ${toScale} = ${converted.toFixed(2)}`;
    panel.classList.add("visible");
  }

  function calcCgpaToGpa() {
    const cgpa      = toNum("cgpaInput");
    const fromScale = toNum("cgpaScale");
    const toScale   = toNum("gpaTargetScale");
    const panel     = document.getElementById("cgpaToGpaPanel");
    const errorEl   = document.getElementById("cgpaInputError");
    const inputEl   = document.getElementById("cgpaInput");

    errorEl.style.display = "none";

    if (document.getElementById("cgpaInput").value.trim() === "") {
      panel.classList.remove("visible");
      return;
    }

    if (isNaN(parseFloat(document.getElementById("cgpaInput").value)) || cgpa < 0 || cgpa > fromScale) {
      errorEl.textContent  = `Enter a valid CGPA between 0 and ${fromScale}.`;
      errorEl.style.display = "block";
      inputEl.classList.add("error-shake");
      setTimeout(() => inputEl.classList.remove("error-shake"), 400);
      panel.classList.remove("visible");
      return;
    }

    const converted = fromScale > 0 ? (cgpa / fromScale) * toScale : 0;
    const percent   = fromScale > 0 ? (cgpa / fromScale) * 100 : 0;

    document.getElementById("cgpaToGpaValue").textContent   = converted.toFixed(2);
    document.getElementById("cgpaToGpaPct").textContent     = percent.toFixed(2) + "%";
    document.getElementById("cgpaToGpaFormula").textContent =
      `Formula: (${cgpa} ÷ ${fromScale}) × ${toScale} = ${converted.toFixed(2)}`;
    panel.classList.add("visible");
  }

  if (!document.getElementById("gpaConverterPage")) return;

  window.copyGpaResult = function (panelId) {
    const panel = document.getElementById(panelId);
    const text  = panel.querySelector(".gpa-result-value").textContent
                + " (" + panel.querySelector(".gpa-result-pct").textContent + ")";
    const btn   = panel.querySelector(".btn-copy-gpa");

    function onCopied() {
      btn.textContent = "Copied!";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1800);
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

  window.resetGpaConverter = function (type) {
    if (type === "gpa") {
      document.getElementById("gpaInput").value        = "";
      document.getElementById("gpaInputError").style.display = "none";
      document.getElementById("gpaToCgpaPanel").classList.remove("visible");
    } else {
      document.getElementById("cgpaInput").value       = "";
      document.getElementById("cgpaInputError").style.display = "none";
      document.getElementById("cgpaToGpaPanel").classList.remove("visible");
    }
  };

  window.toggleGpaFaq = function (el) {
    const item   = el.closest(".faq-item");
    const isOpen = item.classList.contains("open");
    el.closest(".faq-list").querySelectorAll(".faq-item.open").forEach((i) => i.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
  };

  document.addEventListener("DOMContentLoaded", function () {
    ["gpaInput", "gpaScale", "cgpaTargetScale"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) { el.addEventListener("input", calcGpaToCgpa); el.addEventListener("change", calcGpaToCgpa); }
    });

    ["cgpaInput", "cgpaScale", "gpaTargetScale"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) { el.addEventListener("input", calcCgpaToGpa); el.addEventListener("change", calcCgpaToGpa); }
    });

    ["gpaInput", "cgpaInput"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") id === "gpaInput" ? calcGpaToCgpa() : calcCgpaToGpa();
      });
    });
  });
})();

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

  document.addEventListener("DOMContentLoaded", function () {
    // System tabs
    document.querySelectorAll(".gsys-tab").forEach((tab) => {
      tab.addEventListener("click", function () {
        activeSystem = this.dataset.sys;
        document.querySelectorAll(".gsys-tab").forEach((t) =>
          t.classList.toggle("active", t.dataset.sys === activeSystem)
        );
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

// ============================================================
// GRADING SCALES
// ============================================================
const SCALES = {
  standard: {
    max: 4,
    grades: [
      { label: "A+ (4.00)", value: 4.00, letter: "A+" },
      { label: "A  (3.75)", value: 3.75, letter: "A" },
      { label: "A− (3.50)", value: 3.50, letter: "A−" },
      { label: "B+ (3.25)", value: 3.25, letter: "B+" },
      { label: "B  (3.00)", value: 3.00, letter: "B" },
      { label: "B− (2.75)", value: 2.75, letter: "B−" },
      { label: "C+ (2.50)", value: 2.50, letter: "C+" },
      { label: "C  (2.25)", value: 2.25, letter: "C" },
      { label: "C− (2.00)", value: 2.00, letter: "C−" },
      { label: "D  (1.75)", value: 1.75, letter: "D" },
      { label: "F  (0.00)", value: 0.00, letter: "F" },
    ]
  },
  na: {
    max: 4,
    grades: [
      { label: "A  (4.00)", value: 4.00, letter: "A" },
      { label: "A− (3.70)", value: 3.70, letter: "A−" },
      { label: "B+ (3.30)", value: 3.30, letter: "B+" },
      { label: "B  (3.00)", value: 3.00, letter: "B" },
      { label: "B− (2.70)", value: 2.70, letter: "B−" },
      { label: "C+ (2.30)", value: 2.30, letter: "C+" },
      { label: "C  (2.00)", value: 2.00, letter: "C" },
      { label: "C− (1.70)", value: 1.70, letter: "C−" },
      { label: "D+ (1.30)", value: 1.30, letter: "D+" },
      { label: "D  (1.00)", value: 1.00, letter: "D" },
      { label: "F  (0.00)", value: 0.00, letter: "F" },
    ]
  },
  ten: {
    max: 10,
    grades: [
      { label: "O  (10.00)", value: 10.00, letter: "O" },
      { label: "A+ (9.00)",  value: 9.00,  letter: "A+" },
      { label: "A  (8.00)",  value: 8.00,  letter: "A" },
      { label: "B+ (7.00)",  value: 7.00,  letter: "B+" },
      { label: "B  (6.00)",  value: 6.00,  letter: "B" },
      { label: "C  (5.00)",  value: 5.00,  letter: "C" },
      { label: "P  (4.00)",  value: 4.00,  letter: "P" },
      { label: "F  (0.00)",  value: 0.00,  letter: "F" },
    ]
  }
};

// ============================================================
// STATE
// ============================================================
let currentScale = "standard";
let semesterCount = 0;
let sgpaRowCount = 0;

// ============================================================
// HELPERS
// ============================================================
function getScale() {
  return SCALES[currentScale];
}

function getScaleMax() {
  return SCALES[currentScale].max;
}

function buildDropdown(selectedValue = null) {
  const scale = getScale();
  let opts = `<option value="" disabled ${selectedValue === null ? "selected" : ""}>Grade</option>`;
  scale.grades.forEach(g => {
    const sel = (selectedValue !== null && parseFloat(selectedValue) === g.value) ? "selected" : "";
    opts += `<option value="${g.value}" ${sel}>${g.label}</option>`;
  });
  return opts;
}

function getCGPAGrade(cgpa) {
  const max = getScaleMax();
  if (max === 10) {
    if (cgpa >= 9.0)  return "Outstanding";
    if (cgpa >= 8.0)  return "Excellent";
    if (cgpa >= 7.0)  return "Very Good";
    if (cgpa >= 6.0)  return "Good";
    if (cgpa >= 5.0)  return "Average";
    if (cgpa >= 4.0)  return "Pass";
    return "Fail";
  }
  if (cgpa >= 3.75) return "Excellent";
  if (cgpa >= 3.50) return "Very Good";
  if (cgpa >= 3.00) return "Good";
  if (cgpa >= 2.50) return "Average";
  if (cgpa >= 2.00) return "Below Average";
  return "Poor";
}

// ============================================================
// SCALE PREVIEW
// ============================================================
function renderScalePreview() {
  const scale = getScale();
  const preview = document.getElementById("scalePreview");
  if (!preview) return;
  const items = scale.grades.slice(0, 5).map(g =>
    `<span class="preview-item"><span class="pi-letter">${g.letter}</span><span class="pi-val">${g.value.toFixed(2)}</span></span>`
  ).join("");
  preview.innerHTML = `<div class="preview-row">${items}<span class="preview-more">+${scale.grades.length - 5} more</span></div>`;
}

// ============================================================
// COURSE ROW
// ============================================================
function createCourseRow(semId, courseId) {
  const row = document.createElement("div");
  row.className = "course-row";
  row.dataset.semId = semId;
  row.dataset.courseId = courseId;
  row.innerHTML = `
    <input type="text" class="course-name" placeholder="Course name" />
    <input type="number" class="course-credit" placeholder="Credits" min="0.5" step="0.5" />
    <select class="course-grade">${buildDropdown(null)}</select>
    <button class="btn-delete-course" title="Remove course">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

  row.querySelector(".course-grade").addEventListener("change", recalcAll);
  row.querySelector(".course-credit").addEventListener("input", recalcAll);
  row.querySelector(".course-name").addEventListener("input", recalcAll);
  row.querySelector(".btn-delete-course").addEventListener("click", function () {
    const semBox = document.querySelector(`.semester-box[data-sem-id="${semId}"]`);
    const rows = semBox.querySelectorAll(".course-row");
    if (rows.length <= 1) { showToast("At least one course is required per semester."); return; }
    row.classList.add("removing");
    setTimeout(() => { row.remove(); recalcAll(); }, 250);
  });

  return row;
}

// ============================================================
// SEMESTER
// ============================================================
function createSemester() {
  semesterCount++;
  const semId = semesterCount;
  const box = document.createElement("div");
  box.className = "semester-box";
  box.dataset.semId = semId;
  box.innerHTML = `
    <div class="semester-header">
      <div class="semester-title-wrap">
        <span class="semester-num">Semester ${semId}</span>
        <input type="text" class="semester-name-input" placeholder="(optional name)" />
      </div>
      <div class="semester-right-wrap">
        <div class="semester-sgpa-wrap">
          <span class="sgpa-tag-label">SGPA</span>
          <span class="sgpa-tag-val" id="sgpa-sem-${semId}">0.00</span>
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
    <div class="courses-container" id="courses-${semId}"></div>
    <button class="btn-add-course" data-sem-id="${semId}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      + Add Course
    </button>
  `;

  box.querySelector(".btn-delete-semester").addEventListener("click", function () {
    if (document.querySelectorAll(".semester-box").length <= 1) {
      showToast("At least one semester is required.");
      return;
    }
    box.style.transition = "opacity 0.25s, transform 0.25s";
    box.style.opacity = "0";
    box.style.transform = "translateY(-8px)";
    setTimeout(() => { box.remove(); recalcAll(); }, 250);
  });

  box.querySelector(".btn-add-course").addEventListener("click", function () {
    const sid = parseInt(this.dataset.semId);
    const container = document.getElementById(`courses-${sid}`);
    const newRow = createCourseRow(sid, container.querySelectorAll(".course-row").length + 1);
    newRow.style.opacity = "0";
    container.appendChild(newRow);
    requestAnimationFrame(() => { newRow.style.transition = "opacity 0.2s"; newRow.style.opacity = "1"; });
    recalcAll();
  });

  box.querySelector(".semester-name-input").addEventListener("input", recalcAll);
  box.querySelector(`#courses-${semId}`).appendChild(createCourseRow(semId, 1));

  return box;
}

// ============================================================
// SGPA ROWS
// ============================================================
function createSGPARow() {
  sgpaRowCount++;
  const idx = sgpaRowCount;
  const row = document.createElement("div");
  row.className = "sgpa-row";
  row.dataset.rowId = idx;
  row.innerHTML = `
    <input type="text" class="sgpa-sem-name" placeholder="Semester ${idx}" value="Semester ${idx}" />
    <input type="number" class="sgpa-val-input" placeholder="0.00" min="0" max="${getScaleMax()}" step="0.01" />
    <button class="btn-delete-sgpa" title="Remove row">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;
  row.querySelector(".sgpa-val-input").addEventListener("input", calcSGPAtoCGPA);
  row.querySelector(".btn-delete-sgpa").addEventListener("click", function () {
    if (document.querySelectorAll(".sgpa-row").length <= 1) { showToast("At least one row required."); return; }
    row.remove();
    calcSGPAtoCGPA();
  });
  return row;
}

// ============================================================
// CALCULATIONS
// ============================================================
function calcSGPA(semId) {
  let totalPoints = 0, totalCredits = 0;
  document.querySelectorAll(`.course-row[data-sem-id="${semId}"]`).forEach(row => {
    const credit = parseFloat(row.querySelector(".course-credit").value) || 0;
    const grade  = parseFloat(row.querySelector(".course-grade").value) || 0;
    totalPoints  += credit * grade;
    totalCredits += credit;
  });
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

function recalcAll() {
  let totalWP = 0, totalCredits = 0;
  const semBoxes = document.querySelectorAll(".semester-box");
  const max = getScaleMax();

  semBoxes.forEach(box => {
    const semId = parseInt(box.dataset.semId);
    const sgpa = calcSGPA(semId);
    const semCredits = Array.from(box.querySelectorAll(".course-credit"))
      .reduce((s, el) => s + (parseFloat(el.value) || 0), 0);
    totalWP      += sgpa * semCredits;
    totalCredits += semCredits;
    const el = document.getElementById(`sgpa-sem-${semId}`);
    if (el) el.textContent = sgpa.toFixed(2);
  });

  const cgpa = totalCredits > 0 ? totalWP / totalCredits : 0;

  animateValue(document.getElementById("cgpaDisplay"), parseFloat(document.getElementById("cgpaDisplay").textContent) || 0, cgpa, 400);
  document.getElementById("totalCredits").textContent    = totalCredits.toFixed(1);
  document.getElementById("totalSemesters").textContent  = semBoxes.length;
  document.getElementById("cgpaGradeLabel").textContent  = cgpa > 0 ? getCGPAGrade(cgpa) : "–";
  document.getElementById("cgpaBar").style.width         = ((cgpa / max) * 100) + "%";

  document.getElementById("stickyCGPA").textContent      = cgpa.toFixed(2);
  document.getElementById("stickyCredits").textContent   = totalCredits.toFixed(1);
  document.getElementById("stickySemesters").textContent = semBoxes.length;
  document.getElementById("stickyGrade").textContent     = cgpa > 0 ? getCGPAGrade(cgpa) : "–";

  document.getElementById("currentCGPA").value = cgpa > 0 ? cgpa.toFixed(2) : "";
  calcTarget();
}

function calcTarget() {
  const max          = getScaleMax();
  const totalCredits = parseFloat(document.getElementById("totalCredits").textContent) || 0;
  const current      = parseFloat(document.getElementById("currentCGPA").value) || 0;
  const target       = parseFloat(document.getElementById("targetCGPA").value) || 0;
  const remaining    = parseFloat(document.getElementById("remainingCredits").value) || 0;

  const el        = document.getElementById("requiredGPA");
  const container = document.getElementById("targetResult");
  container.className = "target-result";

  if (!target || !remaining) { el.textContent = "–"; return; }

  const required = ((target * (totalCredits + remaining)) - (current * totalCredits)) / remaining;

  if (required > max) {
    el.textContent = "Not Possible";
    container.classList.add("target-impossible");
  } else if (required < 0) {
    el.textContent = "Already Achieved!";
    container.classList.add("target-achieved");
  } else {
    el.textContent = required.toFixed(2);
    container.classList.add("target-possible");
  }
}

function calcSGPAtoCGPA() {
  let total = 0, count = 0;
  document.querySelectorAll(".sgpa-val-input").forEach(inp => {
    const v = parseFloat(inp.value);
    if (!isNaN(v)) { total += v; count++; }
  });
  document.getElementById("sgpaCGPA").textContent = (count > 0 ? total / count : 0).toFixed(2);
}

// ============================================================
// ANIMATE VALUE
// ============================================================
function animateValue(el, from, to, duration) {
  const start = performance.now();
  function update(time) {
    const t = Math.min((time - start) / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    el.textContent = (from + (to - from) * ease).toFixed(2);
    if (t < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ============================================================
// SCALE CHANGE
// ============================================================
function updateAllDropdowns() {
  document.querySelectorAll(".course-grade").forEach(select => {
    const currentVal = parseFloat(select.value);
    const scale = getScale();
    let matched = null;
    scale.grades.forEach(g => { if (g.value === currentVal) matched = g.value; });
    select.innerHTML = buildDropdown(matched);
  });
  // update sgpa row max attribute
  document.querySelectorAll(".sgpa-val-input").forEach(inp => {
    inp.max = getScaleMax();
  });
  renderScalePreview();
  recalcAll();
}

// ============================================================
// PDF DOWNLOAD
// ============================================================
function generatePDF() {
  const cgpa       = document.getElementById("cgpaDisplay").textContent;
  const totalCred  = document.getElementById("totalCredits").textContent;
  const totalSem   = document.getElementById("totalSemesters").textContent;
  const gradeLabel = getCGPAGrade(parseFloat(cgpa));
  const scaleLabel = currentScale === "standard" ? "Standard Scale" : currentScale === "na" ? "North American Scale" : "10-Point Scale";
  const dateStr    = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const targetCGPA    = document.getElementById("targetCGPA").value;
  const remainingCred = document.getElementById("remainingCredits").value;
  const requiredGPA   = document.getElementById("requiredGPA").textContent;

  let semestersHTML = "";
  document.querySelectorAll(".semester-box").forEach(box => {
    const semId   = parseInt(box.dataset.semId);
    const semName = box.querySelector(".semester-name-input").value.trim() || `Semester ${semId}`;
    const sgpa    = document.getElementById(`sgpa-sem-${semId}`)?.textContent || "0.00";
    let courseRows = "", semCredits = 0;

    box.querySelectorAll(".course-row").forEach((row, i) => {
      const name    = row.querySelector(".course-name").value.trim() || "Unnamed Course";
      const credit  = row.querySelector(".course-credit").value || "–";
      const gradeEl = row.querySelector(".course-grade");
      const gradeTxt = gradeEl.selectedIndex > 0 ? gradeEl.options[gradeEl.selectedIndex].text : "–";
      const gp      = parseFloat(gradeEl.value) || 0;
      if (parseFloat(credit)) semCredits += parseFloat(credit);
      const bg = i % 2 === 0 ? "#fff8f4" : "#ffffff";
      courseRows += `<tr style="background:${bg}">
        <td style="padding:8px 12px;border-bottom:1px solid #f0d0d0;">${name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0d0d0;text-align:center;">${credit}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0d0d0;text-align:center;">${gradeTxt}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0d0d0;text-align:center;font-weight:700;color:#CD1C18;">${gp > 0 ? gp.toFixed(2) : "–"}</td>
      </tr>`;
    });

    semestersHTML += `
      <div style="margin-bottom:28px;break-inside:avoid;">
        <div style="background:#CD1C18;border-radius:6px 6px 0 0;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#fff;font-weight:700;font-size:14px;">${semName}</span>
          <span style="color:#fff;font-weight:700;font-size:15px;">SGPA: ${sgpa}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #f0d0d0;border-top:none;">
          <thead><tr style="background:#fff0ee;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;letter-spacing:.08em;color:#CD1C18;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ffc5bb;">Course</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;letter-spacing:.08em;color:#CD1C18;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ffc5bb;">Credits</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;letter-spacing:.08em;color:#CD1C18;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ffc5bb;">Grade</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;letter-spacing:.08em;color:#CD1C18;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ffc5bb;">GP</th>
          </tr></thead>
          <tbody>${courseRows}</tbody>
        </table>
        <div style="text-align:right;font-size:12px;color:#999;margin-top:6px;">Credits: ${semCredits.toFixed(1)}</div>
      </div>`;
  });

  let targetHTML = "";
  if (targetCGPA && remainingCred) {
    const color = requiredGPA === "Not Possible" ? "#c62828" : requiredGPA === "Already Achieved!" ? "#CD1C18" : "#2e7d32";
    targetHTML = `
      <div style="background:#fff0ee;border:1px solid #ffc5bb;border-radius:8px;padding:18px 20px;margin-bottom:28px;break-inside:avoid;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#CD1C18;margin-bottom:10px;">Target CGPA Plan</div>
        <div style="display:flex;gap:32px;flex-wrap:wrap;">
          <div><div style="font-size:11px;color:#999;margin-bottom:2px;">Current CGPA</div><div style="font-size:18px;font-weight:700;">${cgpa}</div></div>
          <div><div style="font-size:11px;color:#999;margin-bottom:2px;">Target CGPA</div><div style="font-size:18px;font-weight:700;">${targetCGPA}</div></div>
          <div><div style="font-size:11px;color:#999;margin-bottom:2px;">Remaining Credits</div><div style="font-size:18px;font-weight:700;">${remainingCred}</div></div>
          <div><div style="font-size:11px;color:#999;margin-bottom:2px;">Required GPA</div><div style="font-size:22px;font-weight:700;color:${color};">${requiredGPA}</div></div>
        </div>
      </div>`;
  }

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>CGPA Report</title>
  <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Georgia,serif;background:#fff;color:#222;}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}@page{margin:18mm 16mm;size:A4;}}</style>
  </head><body>
  <div style="background:#CD1C18;padding:28px 32px 24px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div><div style="font-size:22px;font-weight:700;color:#fff;">◈ CGPA Calculator</div>
      <div style="font-size:13px;color:rgba(255,255,255,.6);margin-top:4px;">Academic CGPA Report</div></div>
      <div style="text-align:right;"><div style="font-size:12px;color:rgba(255,255,255,.6);">Generated: ${dateStr}</div>
      <div style="font-size:12px;color:rgba(255,255,255,.6);margin-top:2px;">Scale: ${scaleLabel}</div></div>
    </div>
  </div>
  <div style="background:#fff0ee;padding:20px 32px;display:flex;gap:40px;align-items:center;margin-bottom:32px;border-bottom:2px solid #ffc5bb;">
    <div><div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#999;">Overall CGPA</div>
    <div style="font-size:42px;font-weight:700;color:#CD1C18;line-height:1.1;">${cgpa}</div>
    <div style="font-size:13px;color:#CD1C18;font-weight:700;margin-top:2px;">${gradeLabel}</div></div>
    <div style="width:1px;height:60px;background:#ffc5bb;"></div>
    <div><div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#999;">Total Credits</div>
    <div style="font-size:28px;font-weight:700;color:#222;">${totalCred}</div></div>
    <div style="width:1px;height:60px;background:#ffc5bb;"></div>
    <div><div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#999;">Semesters</div>
    <div style="font-size:28px;font-weight:700;color:#222;">${totalSem}</div></div>
  </div>
  <div style="padding:0 32px 32px;">
    ${targetHTML}${semestersHTML}
    <div style="margin-top:40px;padding-top:16px;border-top:1px solid #f0d0d0;display:flex;justify-content:space-between;font-size:11px;color:#999;">
      <span>Generated by CGPA Calculator – cgpacalculator.dev</span><span>${dateStr}</span>
    </div>
  </div>
  </body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `CGPA-Report-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Report downloaded successfully!");
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("toast-visible"));
  setTimeout(() => {
    toast.classList.remove("toast-visible");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================================
// MOBILE MENU
// ============================================================
function closeMobileMenu() {
  document.getElementById("mobileMenu").classList.remove("open");
  document.getElementById("hamburger").classList.remove("active");
}

// ============================================================
// INIT
// ============================================================
function init() {
  const scaleToggleBtn   = document.getElementById("scaleToggleBtn");
  const scaleBody        = document.getElementById("scaleBody");
  const scaleToggleArrow = document.getElementById("scaleToggleArrow");
  const scaleToggleVal   = document.getElementById("scaleToggleVal");

  if (scaleToggleBtn && scaleBody) {
    scaleToggleBtn.addEventListener("click", function () {
      const isOpen = scaleBody.classList.toggle("open");
      scaleToggleArrow.style.transform = isOpen ? "rotate(180deg)" : "";
    });
  }

  // Scale radio buttons
  const scaleLabels = {
    standard: document.getElementById("scaleStandardLabel"),
    na:       document.getElementById("scaleNALabel"),
    ten:      document.getElementById("scaleTenLabel"),
  };
  const scaleNames = {
    standard: "Standard Scale",
    na:       "North American",
    ten:      "10-Point Scale",
  };

  document.querySelectorAll('input[name="scale"]').forEach(radio => {
    radio.addEventListener("change", function () {
      currentScale = this.value;
      if (scaleToggleVal) scaleToggleVal.textContent = scaleNames[currentScale];
      Object.entries(scaleLabels).forEach(([key, el]) => {
        if (el) el.classList.toggle("scale-active", key === currentScale);
      });
      updateAllDropdowns();
      // Auto-close the scale dropdown after selection
      if (scaleBody) {
        scaleBody.classList.remove("open");
        if (scaleToggleArrow) scaleToggleArrow.style.transform = "";
      }
    });
  });

  if (scaleLabels.standard) scaleLabels.standard.classList.add("scale-active");
  renderScalePreview();

  // Semesters
  const semContainer = document.getElementById("semestersContainer");
  semContainer.appendChild(createSemester());
  document.getElementById("addSemesterBtn").addEventListener("click", function () {
    const newSem = createSemester();
    newSem.style.opacity = "0";
    newSem.style.transform = "translateY(12px)";
    semContainer.appendChild(newSem);
    requestAnimationFrame(() => {
      newSem.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      newSem.style.opacity = "1";
      newSem.style.transform = "translateY(0)";
    });
    recalcAll();
  });

  // SGPA rows
  const sgpaContainer = document.getElementById("sgpaRowsContainer");
  sgpaContainer.appendChild(createSGPARow());
  document.getElementById("addSGPARow").addEventListener("click", function () {
    sgpaContainer.appendChild(createSGPARow());
    calcSGPAtoCGPA();
  });

  // Target inputs
  document.getElementById("targetCGPA").addEventListener("input", calcTarget);
  document.getElementById("remainingCredits").addEventListener("input", calcTarget);
  document.getElementById("currentCGPA").addEventListener("input", calcTarget);

  // PDF
  document.getElementById("downloadPDF").addEventListener("click", generatePDF);

  // Hamburger
  document.getElementById("hamburger").addEventListener("click", function () {
    this.classList.toggle("active");
    document.getElementById("mobileMenu").classList.toggle("open");
  });

  // Sticky bar
  const stickyBar = document.getElementById("stickyBar");
  const observer  = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        stickyBar.classList.add("visible");
      } else if (entry.boundingClientRect.top > 0) {
        stickyBar.classList.remove("visible");
      }
    },
    { threshold: 0, rootMargin: "-60px 0px 0px 0px" }
  );
  const calcSection = document.querySelector(".calculator-section");
  if (calcSection) observer.observe(calcSection);

  recalcAll();

  // FAQ accordion
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", function () {
      const isOpen = this.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq-question").forEach(b => {
        b.setAttribute("aria-expanded", "false");
        b.nextElementSibling.classList.remove("open");
      });
      if (!isOpen) {
        this.setAttribute("aria-expanded", "true");
        this.nextElementSibling.classList.add("open");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", init);

// ============================================================
// INFO/BLOG PAGES — Hamburger menu (no calculator present)
// ============================================================
(function () {
  const hamburger  = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (!hamburger || !mobileMenu) return;
  if (document.getElementById("semestersContainer")) return;

  hamburger.addEventListener("click", function () {
    this.classList.toggle("active");
    mobileMenu.classList.toggle("open");
  });
  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      mobileMenu.classList.remove("open");
    });
  });
})();

// ============================================================
// CGPA ↔ PERCENTAGE CONVERTER
// ============================================================
(function () {
  'use strict';

  // Only run on the converter page
  if (!document.getElementById('inputValue') || !document.getElementById('formulaSelect')) return;

  let currentMode = 'cgpa';

  const FORMULAS = {
    cbse:  {
      toPercent: function(v) { return v * 9.5; },
      toCgpa:    function(v) { return v / 9.5; },
      display:   function(v) {
        return currentMode === 'cgpa'
          ? v + ' \u00D7 9.5 = ' + (v * 9.5).toFixed(2) + '%'
          : v + ' \u00F7 9.5 = ' + (v / 9.5).toFixed(2) + ' CGPA';
      }
    },
    aicte: {
      toPercent: function(v) { return (v - 0.75) * 10; },
      toCgpa:    function(v) { return (v / 10) + 0.75; },
      display:   function(v) {
        return currentMode === 'cgpa'
          ? '(' + v + ' \u2212 0.75) \u00D7 10 = ' + ((v - 0.75) * 10).toFixed(2) + '%'
          : '(' + v + ' \u00F7 10) + 0.75 = ' + ((v / 10) + 0.75).toFixed(2) + ' CGPA';
      }
    },
    '10pt': {
      toPercent: function(v) { return v * 10; },
      toCgpa:    function(v) { return v / 10; },
      display:   function(v) {
        return currentMode === 'cgpa'
          ? v + ' \u00D7 10 = ' + (v * 10).toFixed(2) + '%'
          : v + ' \u00F7 10 = ' + (v / 10).toFixed(2) + ' CGPA';
      }
    },
    '4pt': {
      toPercent: function(v) { return (v / 4.0) * 100; },
      toCgpa:    function(v) { return (v / 100) * 4.0; },
      display:   function(v) {
        return currentMode === 'cgpa'
          ? '(' + v + ' \u00F7 4.0) \u00D7 100 = ' + ((v / 4.0) * 100).toFixed(2) + '%'
          : '(' + v + ' \u00F7 100) \u00D7 4.0 = ' + ((v / 100) * 4.0).toFixed(2) + ' CGPA';
      }
    },
    '5pt': {
      toPercent: function(v) { return v * 20; },
      toCgpa:    function(v) { return v / 20; },
      display:   function(v) {
        return currentMode === 'cgpa'
          ? v + ' \u00D7 20 = ' + (v * 20).toFixed(2) + '%'
          : v + ' \u00F7 20 = ' + (v / 20).toFixed(2) + ' CGPA';
      }
    }
  };

  window.switchTab = function(mode) {
    currentMode = mode;
    var inputEl      = document.getElementById('inputValue');
    var inputLabel   = document.getElementById('inputLabel');
    var tabCgpa      = document.getElementById('tabCgpa');
    var tabPct       = document.getElementById('tabPct');
    var resultLabel  = document.getElementById('resultLabel');

    if (mode === 'cgpa') {
      tabCgpa.classList.add('active');    tabCgpa.setAttribute('aria-selected','true');
      tabPct.classList.remove('active');  tabPct.setAttribute('aria-selected','false');
      inputLabel.textContent  = 'Enter CGPA';
      inputEl.placeholder     = 'e.g. 8.5';
      inputEl.max             = '10';
      resultLabel.textContent = 'Your Percentage';
    } else {
      tabPct.classList.add('active');      tabPct.setAttribute('aria-selected','true');
      tabCgpa.classList.remove('active');  tabCgpa.setAttribute('aria-selected','false');
      inputLabel.textContent  = 'Enter Percentage';
      inputEl.placeholder     = 'e.g. 85';
      inputEl.max             = '100';
      resultLabel.textContent = 'Your CGPA';
    }
    hideFieldError();
    hideResult();
  };

  window.calculate = function() {
    var inputEl     = document.getElementById('inputValue');
    var formulaKey  = document.getElementById('formulaSelect').value;
    var val         = parseFloat(inputEl.value.trim());
    var formula     = FORMULAS[formulaKey];

    if (isNaN(val) || val < 0) {
      showFieldError('Please enter a valid number.');
      inputEl.classList.add('error-shake');
      setTimeout(function() { inputEl.classList.remove('error-shake'); }, 400);
      return;
    }
    if (currentMode === 'cgpa') {
      var maxCgpa = (formulaKey === '4pt') ? 4 : (formulaKey === '5pt') ? 5 : 10;
      if (val > maxCgpa) {
        showFieldError('CGPA cannot exceed ' + maxCgpa + ' for this scale.');
        inputEl.classList.add('error-shake');
        setTimeout(function() { inputEl.classList.remove('error-shake'); }, 400);
        return;
      }
    } else {
      if (val > 100) {
        showFieldError('Percentage cannot exceed 100.');
        inputEl.classList.add('error-shake');
        setTimeout(function() { inputEl.classList.remove('error-shake'); }, 400);
        return;
      }
    }

    hideFieldError();

    var resultNum, resultText;
    if (currentMode === 'cgpa') {
      resultNum  = formula.toPercent(val);
      resultText = (Math.round(resultNum * 100) / 100) + '%';
    } else {
      resultNum  = formula.toCgpa(val);
      resultText = '' + (Math.round(resultNum * 100) / 100);
    }

    document.getElementById('resultValue').textContent   = resultText;
    document.getElementById('resultFormula').textContent = 'Formula: ' + formula.display(val);
    document.getElementById('resultPanel').classList.add('visible');
  };

  window.resetAll = function() {
    document.getElementById('inputValue').value = '';
    hideFieldError();
    hideResult();
  };

  window.copyResult = function() {
    var text = document.getElementById('resultValue').textContent;
    var btn  = document.getElementById('copyBtn');
    function done() {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(function() { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1800);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      done();
    }
  };

  window.toggleFaq = function(btn) {
    var item   = btn.closest('.faq-item');
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function(el) { el.classList.remove('open'); });
    if (!isOpen) item.classList.add('open');
  };

  function showFieldError(msg) {
    var el = document.getElementById('fieldError');
    el.textContent = msg; el.style.display = 'block';
  }
  function hideFieldError() {
    var el = document.getElementById('fieldError');
    el.style.display = 'none';
  }
  function hideResult() {
    document.getElementById('resultPanel').classList.remove('visible');
  }

  // Enter key support
  document.addEventListener('DOMContentLoaded', function() {
    var inputEl = document.getElementById('inputValue');
    if (inputEl) {
      inputEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') window.calculate();
      });
    }
  });

})();

// ============================================================
// GPA ↔ CGPA CONVERTER
// ============================================================
(function () {
  'use strict';

  // Only run on the GPA converter page
  if (!document.getElementById('gpaConverterPage')) return;

  function safeNumber(val) {
    var n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  }

  // ── GPA → CGPA ──
  function calculateGPAtoCGPA() {
    var gpa         = safeNumber(document.getElementById('gpaInput').value);
    var gpaScale    = safeNumber(document.getElementById('gpaScale').value);
    var cgpaScale   = safeNumber(document.getElementById('cgpaTargetScale').value);
    var panel       = document.getElementById('gpaToCgpaPanel');
    var valEl       = document.getElementById('gpaToCgpaValue');
    var formulaEl   = document.getElementById('gpaToCgpaFormula');
    var pctEl       = document.getElementById('gpaToCgpaPct');
    var errEl       = document.getElementById('gpaInputError');
    var inputEl     = document.getElementById('gpaInput');

    errEl.style.display = 'none';

    if (document.getElementById('gpaInput').value.trim() === '') {
      panel.classList.remove('visible'); return;
    }
    if (isNaN(safeNumber(document.getElementById('gpaInput').value)) || gpa < 0 || gpa > gpaScale) {
      errEl.textContent = 'Enter a valid GPA between 0 and ' + gpaScale + '.';
      errEl.style.display = 'block';
      inputEl.classList.add('error-shake');
      setTimeout(function(){ inputEl.classList.remove('error-shake'); }, 400);
      panel.classList.remove('visible'); return;
    }

    var converted   = gpaScale > 0 ? (gpa / gpaScale) * cgpaScale : 0;
    var percentage  = gpaScale > 0 ? (gpa / gpaScale) * 100 : 0;

    valEl.textContent     = converted.toFixed(2);
    pctEl.textContent     = percentage.toFixed(2) + '%';
    formulaEl.textContent = 'Formula: (' + gpa + ' \u00F7 ' + gpaScale + ') \u00D7 ' + cgpaScale + ' = ' + converted.toFixed(2);
    panel.classList.add('visible');
  }

  // ── CGPA → GPA ──
  function calculateCGPAtoGPA() {
    var cgpa        = safeNumber(document.getElementById('cgpaInput').value);
    var cgpaScale   = safeNumber(document.getElementById('cgpaScale').value);
    var gpaScale    = safeNumber(document.getElementById('gpaTargetScale').value);
    var panel       = document.getElementById('cgpaToGpaPanel');
    var valEl       = document.getElementById('cgpaToGpaValue');
    var formulaEl   = document.getElementById('cgpaToGpaFormula');
    var pctEl       = document.getElementById('cgpaToGpaPct');
    var errEl       = document.getElementById('cgpaInputError');
    var inputEl     = document.getElementById('cgpaInput');

    errEl.style.display = 'none';

    if (document.getElementById('cgpaInput').value.trim() === '') {
      panel.classList.remove('visible'); return;
    }
    if (isNaN(safeNumber(document.getElementById('cgpaInput').value)) || cgpa < 0 || cgpa > cgpaScale) {
      errEl.textContent = 'Enter a valid CGPA between 0 and ' + cgpaScale + '.';
      errEl.style.display = 'block';
      inputEl.classList.add('error-shake');
      setTimeout(function(){ inputEl.classList.remove('error-shake'); }, 400);
      panel.classList.remove('visible'); return;
    }

    var converted  = cgpaScale > 0 ? (cgpa / cgpaScale) * gpaScale : 0;
    var percentage = cgpaScale > 0 ? (cgpa / cgpaScale) * 100 : 0;

    valEl.textContent     = converted.toFixed(2);
    pctEl.textContent     = percentage.toFixed(2) + '%';
    formulaEl.textContent = 'Formula: (' + cgpa + ' \u00F7 ' + cgpaScale + ') \u00D7 ' + gpaScale + ' = ' + converted.toFixed(2);
    panel.classList.add('visible');
  }

  // ── COPY ──
  window.copyGpaResult = function(panelId) {
    var panel = document.getElementById(panelId);
    var val   = panel.querySelector('.gpa-result-value').textContent;
    var pct   = panel.querySelector('.gpa-result-pct').textContent;
    var text  = val + ' (' + pct + ')';
    var btn   = panel.querySelector('.btn-copy-gpa');
    function done() {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(function(){ btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1800);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      done();
    }
  };

  // ── RESET ──
  window.resetGpaConverter = function(section) {
    if (section === 'gpa') {
      document.getElementById('gpaInput').value = '';
      document.getElementById('gpaInputError').style.display = 'none';
      document.getElementById('gpaToCgpaPanel').classList.remove('visible');
    } else {
      document.getElementById('cgpaInput').value = '';
      document.getElementById('cgpaInputError').style.display = 'none';
      document.getElementById('cgpaToGpaPanel').classList.remove('visible');
    }
  };

  // ── FAQ TOGGLE (reuse global toggleFaq if available) ──
  window.toggleGpaFaq = function(btn) {
    var item   = btn.closest('.faq-item');
    var isOpen = item.classList.contains('open');
    var list   = btn.closest('.faq-list');
    list.querySelectorAll('.faq-item.open').forEach(function(el){ el.classList.remove('open'); });
    if (!isOpen) item.classList.add('open');
  };

  // ── BIND EVENTS ──
  document.addEventListener('DOMContentLoaded', function () {
    var gpaBindIds  = ['gpaInput', 'gpaScale', 'cgpaTargetScale'];
    var cgpaBindIds = ['cgpaInput', 'cgpaScale', 'gpaTargetScale'];

    gpaBindIds.forEach(function(id){
      var el = document.getElementById(id);
      if (el) { el.addEventListener('input', calculateGPAtoCGPA); el.addEventListener('change', calculateGPAtoCGPA); }
    });
    cgpaBindIds.forEach(function(id){
      var el = document.getElementById(id);
      if (el) { el.addEventListener('input', calculateCGPAtoGPA); el.addEventListener('change', calculateCGPAtoGPA); }
    });

    // Enter key
    ['gpaInput','cgpaInput'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.addEventListener('keydown', function(e){
        if (e.key === 'Enter') { id === 'gpaInput' ? calculateGPAtoCGPA() : calculateCGPAtoGPA(); }
      });
    });
  });

})();


// ============================================================
// GRADE CALCULATOR MODULE
// ============================================================
(function () {
  if (!document.getElementById('gradeTableBody')) return;

  // ── Grade Systems ──
  const GRADE_SYSTEMS = {
    '4': {
      label: '4.0 Scale',
      getGrade: function(m) {
        if (m >= 80) return { letter: 'A+', point: 4.00 };
        if (m >= 75) return { letter: 'A',  point: 3.75 };
        if (m >= 70) return { letter: 'A−', point: 3.50 };
        if (m >= 65) return { letter: 'B+', point: 3.25 };
        if (m >= 60) return { letter: 'B',  point: 3.00 };
        if (m >= 55) return { letter: 'B−', point: 2.75 };
        if (m >= 50) return { letter: 'C',  point: 2.50 };
        if (m >= 40) return { letter: 'D',  point: 2.00 };
        return { letter: 'F', point: 0.00 };
      },
      passMin: 40
    },
    '5': {
      label: '5.0 Scale',
      getGrade: function(m) {
        if (m >= 80) return { letter: 'A+', point: 5.00 };
        if (m >= 75) return { letter: 'A',  point: 4.50 };
        if (m >= 70) return { letter: 'A−', point: 4.00 };
        if (m >= 65) return { letter: 'B+', point: 3.50 };
        if (m >= 60) return { letter: 'B',  point: 3.00 };
        if (m >= 55) return { letter: 'B−', point: 2.50 };
        if (m >= 50) return { letter: 'C',  point: 2.00 };
        if (m >= 40) return { letter: 'D',  point: 1.00 };
        return { letter: 'F', point: 0.00 };
      },
      passMin: 40
    },
    '10': {
      label: '10.0 Scale',
      getGrade: function(m) {
        if (m >= 90) return { letter: 'O',  point: 10.00 };
        if (m >= 80) return { letter: 'A+', point: 9.00 };
        if (m >= 70) return { letter: 'A',  point: 8.00 };
        if (m >= 60) return { letter: 'B+', point: 7.00 };
        if (m >= 55) return { letter: 'B',  point: 6.00 };
        if (m >= 50) return { letter: 'C',  point: 5.00 };
        if (m >= 40) return { letter: 'P',  point: 4.00 };
        return { letter: 'F', point: 0.00 };
      },
      passMin: 40
    }
  };

  var currentGradeSystem = '4';
  var gradeRowCount = 0;

  // ── Get current system ──
  function getSys() { return GRADE_SYSTEMS[currentGradeSystem]; }

  // ── Render a grade badge ──
  function renderBadge(letter) {
    var cell = document.createElement('div');
    cell.className = 'gr-grade-cell';
    cell.id = '';
    if (letter === 'F') cell.classList.add('grade-f');
    else if (letter !== '–') cell.classList.add('grade-pass');
    cell.textContent = letter;
    return cell;
  }

  // ── Add a row ──
  function grAddRow() {
    gradeRowCount++;
    var id = gradeRowCount;
    var tbody = document.getElementById('gradeTableBody');

    var row = document.createElement('div');
    row.className = 'grade-row';
    row.dataset.rowId = id;

    row.innerHTML =
      '<input class="gr-subject" placeholder="Subject name" aria-label="Subject">' +
      '<input type="number" class="gr-marks" placeholder="0–100" min="0" max="100" aria-label="Marks">' +
      '<input type="number" class="gr-credit" placeholder="Credits" min="0.5" step="0.5" value="3" aria-label="Credits">' +
      '<div class="gr-grade-cell">–</div>' +
      '<button class="btn-del-gr" aria-label="Remove row">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>';

    tbody.appendChild(row);

    row.querySelector('.gr-marks').addEventListener('input', grRecalculate);
    row.querySelector('.gr-credit').addEventListener('input', grRecalculate);
    row.querySelector('.btn-del-gr').addEventListener('click', function () {
      row.classList.add('removing');
      setTimeout(function () { row.remove(); grRecalculate(); }, 180);
    });

    grRecalculate();
  }

  // ── Recalculate all ──
  function grRecalculate() {
    var rows = document.querySelectorAll('#gradeTableBody .grade-row');
    var sys = getSys();
    var totalWeighted = 0;
    var totalCredits = 0;
    var totalMarks = 0;
    var validCount = 0;
    var failCount = 0;

    rows.forEach(function (row) {
      var mInput = row.querySelector('.gr-marks');
      var cInput = row.querySelector('.gr-credit');
      var badgeEl = row.querySelector('.gr-grade-cell');
      var m = parseFloat(mInput.value);
      var c = parseFloat(cInput.value);

      if (isNaN(m) || mInput.value === '') {
        badgeEl.textContent = '–';
        badgeEl.className = 'gr-grade-cell';
        return;
      }

      m = Math.min(100, Math.max(0, m));
      if (isNaN(c) || c <= 0) c = 3;

      var g = sys.getGrade(m);
      badgeEl.textContent = g.letter;
      badgeEl.className = 'gr-grade-cell';
      if (g.letter === 'F') badgeEl.classList.add('grade-f');
      else badgeEl.classList.add('grade-pass');

      totalWeighted += g.point * c;
      totalCredits += c;
      totalMarks += m;
      validCount++;
      if (g.letter === 'F') failCount++;
    });

    var gpa = totalCredits > 0 ? totalWeighted / totalCredits : 0;
    var pct = validCount > 0 ? totalMarks / validCount : 0;
    var status = failCount > 0 ? 'Fail' : (validCount > 0 ? 'Pass' : '–');
    var statusColor = failCount > 0 ? '#DC2626' : '#059669';

    var gpaEl = document.getElementById('grGPA');
    var pctEl = document.getElementById('grPct');
    var statusEl = document.getElementById('grStatus');
    var subjectsEl = document.getElementById('grSubjects');
    if (gpaEl) gpaEl.textContent = gpa.toFixed(2);
    if (pctEl) pctEl.textContent = pct.toFixed(1) + '%';
    if (statusEl) { statusEl.textContent = status; statusEl.style.color = statusColor; }
    if (subjectsEl) subjectsEl.textContent = validCount;
  }

  // ── Prediction ──
  function grPredict() {
    var targetGrade = document.getElementById('grTargetGrade').value;
    var sys = getSys();

    var gradeTargets = {
      '4':  { 'A+': 80, 'A': 75, 'A−': 70, 'B+': 65, 'B': 60, 'C': 50, 'D': 40 },
      '5':  { 'A+': 80, 'A': 75, 'A−': 70, 'B+': 65, 'B': 60, 'C': 50, 'D': 40 },
      '10': { 'O': 90, 'A+': 80, 'A': 70, 'B+': 60, 'B': 55, 'C': 50, 'P': 40 }
    };

    var targets = gradeTargets[currentGradeSystem];
    var needed = targets[targetGrade];
    if (needed === undefined) return;

    // Count existing valid marks
    var rows = document.querySelectorAll('#gradeTableBody .grade-row');
    var sum = 0, count = 0;
    rows.forEach(function (row) {
      var m = parseFloat(row.querySelector('.gr-marks').value);
      if (!isNaN(m) && row.querySelector('.gr-marks').value !== '') {
        sum += m; count++;
      }
    });

    var predResult = document.getElementById('grPredResult');
    predResult.className = 'pred-result visible';
    var card = predResult.querySelector('.pred-result-card');

    var note, cardClass;

    if (count === 0) {
      note = 'Add subject marks first to get a personalised prediction.';
      cardClass = 'pred-result-card';
      predResult.querySelector('.pred-stat-val').textContent = needed + '%';
      predResult.querySelector('.pred-stat-label').textContent = 'Avg needed';
    } else {
      var currentAvg = sum / count;
      if (currentAvg >= needed) {
        note = 'You\'re already averaging ' + currentAvg.toFixed(1) + '% — you\'ve met the target for ' + targetGrade + '!';
        cardClass = 'pred-result-card pred-achieved';
        predResult.querySelector('.pred-stat-val').textContent = '✓ Met';
        predResult.querySelector('.pred-stat-label').textContent = 'Target reached';
      } else {
        var gap = needed - currentAvg;
        note = 'Aim for at least ' + needed + '% average. You\'re ' + gap.toFixed(1) + '% below the ' + targetGrade + ' threshold right now.';
        cardClass = 'pred-result-card';
        predResult.querySelector('.pred-stat-val').textContent = needed + '%';
        predResult.querySelector('.pred-stat-label').textContent = 'Target avg';
      }
    }

    card.className = cardClass;
    predResult.querySelector('.pred-note').textContent = note;
  }

  // ── System switch ──
  function switchGradeSystem(sys) {
    currentGradeSystem = sys;
    document.querySelectorAll('.gsys-tab').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.sys === sys);
    });
    grRecalculate();
  }

  // ── Init ──
  document.addEventListener('DOMContentLoaded', function () {
    // Tab clicks
    document.querySelectorAll('.gsys-tab').forEach(function (btn) {
      btn.addEventListener('click', function () { switchGradeSystem(btn.dataset.sys); });
    });

    // Add subject button
    var addBtn = document.getElementById('grAddSubjectBtn');
    if (addBtn) addBtn.addEventListener('click', grAddRow);

    // Predict button
    var predBtn = document.getElementById('grPredictBtn');
    if (predBtn) predBtn.addEventListener('click', grPredict);

    // Print button
    var printBtn = document.getElementById('grPrintBtn');
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

    // Seed 3 rows
    grAddRow();
    grAddRow();
    grAddRow();
  });
})();

// ─── SCALE HELPERS ───────────────────────────────────────────
function getScale() { return SCALES[currentScale]; }
function getScaleMax() { return SCALES[currentScale].max; }

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
  if (cgpa >= 3.75) return "Excellent";
  if (cgpa >= 3.5)  return "Very Good";
  if (cgpa >= 3)    return "Good";
  if (cgpa >= 2.5)  return "Average";
  if (cgpa >= 2)    return "Below Average";
  return "Poor";
}

function getScaleLabel(scale) {
  const labels = { standard:"Standard 4.0", na:"North American", ten:"10-Point Scale", nigerian:"Nigerian 5.0", australian:"Australian 7.0", canadian:"Canadian 4.33" };
  return labels[scale] || "Standard 4.0";
}
function getScaleLabelFull(scale) {
  const labels = { standard:"Standard 4.0 Scale", na:"North American 4.0 Scale", ten:"10-Point Scale", nigerian:"Nigerian 5.0 Scale", australian:"Australian 7.0 Scale", canadian:"Canadian 4.33 Scale" };
  return labels[scale] || "Standard 4.0 Scale";
}

// ─── SCALE PREVIEW ───────────────────────────────────────────
function renderScalePreview() {
  const scale = getScale();
  const preview = document.getElementById("scalePreview");
  if (!preview) return;
  const items = scale.grades.slice(0, 5).map((g) =>
    `<span class="preview-item"><span class="pi-letter">${g.letter}</span><span class="pi-val">${g.value.toFixed(2)}</span></span>`
  ).join("");
  preview.innerHTML = `<div class="preview-row">${items}<span class="preview-more">+${scale.grades.length - 5} more</span></div>`;
}

// ─── COURSE ROW ──────────────────────────────────────────────
function createCourseRow(semId, courseId) {
  const row = document.createElement("div");
  row.className = "course-row";
  row.dataset.semId = semId;
  row.dataset.courseId = courseId;
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
  row.querySelector(".btn-delete-course").addEventListener("click", function () {
    const semBox = document.querySelector(`.semester-box[data-sem-id="${semId}"]`);
    if (semBox.querySelectorAll(".course-row").length <= 1) { showToast("At least one course is required per semester."); return; }
    row.classList.add("removing");
    setTimeout(() => { row.remove(); recalcAll(); }, 250);
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
        <input type="text" class="semester-name-input" placeholder="(optional name)" />
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
  box.querySelector(".btn-delete-semester").addEventListener("click", function () {
    if (document.querySelectorAll(".semester-box").length <= 1) { showToast("At least one semester is required."); return; }
    box.style.transition = "opacity 0.25s, transform 0.25s";
    box.style.opacity = "0"; box.style.transform = "translateY(-8px)";
    setTimeout(() => { box.remove(); recalcAll(); }, 250);
  });
  box.querySelector(".btn-add-course").addEventListener("click", function () {
    const semId = parseInt(this.dataset.semId);
    const container = document.getElementById(`courses-${semId}`);
    const newRow = createCourseRow(semId, container.querySelectorAll(".course-row").length + 1);
    newRow.style.opacity = "0";
    container.appendChild(newRow);
    requestAnimationFrame(() => { newRow.style.transition = "opacity 0.2s"; newRow.style.opacity = "1"; });
    recalcAll();
  });
  box.querySelector(".semester-name-input").addEventListener("input", recalcAll);
  box.querySelector(`#courses-${id}`).appendChild(createCourseRow(id, 1));
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
  row.querySelector(".btn-delete-sgpa").addEventListener("click", function () {
    if (document.querySelectorAll(".sgpa-row").length <= 1) { showToast("At least one row required."); return; }
    row.remove(); calcSGPAtoCGPA();
  });
  return row;
}

// ─── CALCULATIONS ─────────────────────────────────────────────
function calcSGPA(semId) {
  let totalPoints = 0, totalCredits = 0;
  document.querySelectorAll(`.course-row[data-sem-id="${semId}"]`).forEach((row) => {
    const credit = parseFloat(row.querySelector(".course-credit").value) || 0;
    const grade  = parseFloat(row.querySelector(".course-grade").value)  || 0;
    totalPoints  += credit * grade;
    totalCredits += credit;
  });
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

function recalcAll() {
  let weightedSum = 0, totalCredits = 0;
  const max = getScaleMax();
  const semesters = document.querySelectorAll(".semester-box");
  semesters.forEach((semBox) => {
    const semId = parseInt(semBox.dataset.semId);
    const sgpa  = calcSGPA(semId);
    const credits = Array.from(semBox.querySelectorAll(".course-credit")).reduce((s, el) => s + (parseFloat(el.value) || 0), 0);
    weightedSum  += sgpa * credits;
    totalCredits += credits;
    const sgpaEl = document.getElementById(`sgpa-sem-${semId}`);
    if (sgpaEl) sgpaEl.textContent = sgpa.toFixed(2);
  });
  const cgpa = totalCredits > 0 ? weightedSum / totalCredits : 0;
  const gradeLabel = cgpa > 0 ? getCGPAGrade(cgpa) : "–";
  animateValue(document.getElementById("cgpaDisplay"), parseFloat(document.getElementById("cgpaDisplay").textContent) || 0, cgpa, 400);
  document.getElementById("totalCredits").textContent    = totalCredits.toFixed(1);
  document.getElementById("totalSemesters").textContent  = semesters.length;
  document.getElementById("cgpaGradeLabel").textContent  = gradeLabel;
  document.getElementById("cgpaBar").style.width         = (cgpa / max * 100) + "%";
  document.getElementById("stickyCGPA").textContent      = cgpa.toFixed(2);
  document.getElementById("stickyCredits").textContent   = totalCredits.toFixed(1);
  document.getElementById("stickySemesters").textContent = semesters.length;
  document.getElementById("stickyGrade").textContent     = gradeLabel;
  // Bug fix: Only auto-fill currentCGPA if user is not actively editing it
  const _currentCGPAEl = document.getElementById("currentCGPA");
  if (document.activeElement !== _currentCGPAEl) {
    _currentCGPAEl.value = cgpa > 0 ? cgpa.toFixed(2) : "";
  }
  calcTarget();
}

function calcTarget() {
  const max = getScaleMax();
  const earnedCredits = parseFloat(document.getElementById("totalCredits").textContent) || 0;
  const currentCGPA   = parseFloat(document.getElementById("currentCGPA").value)  || 0;
  const targetCGPA    = parseFloat(document.getElementById("targetCGPA").value)   || 0;
  const remainCredits = parseFloat(document.getElementById("remainingCredits").value) || 0;
  const requiredEl = document.getElementById("requiredGPA");
  const resultEl   = document.getElementById("targetResult");
  resultEl.className = "target-result";
  if (!targetCGPA || !remainCredits) { requiredEl.textContent = "–"; return; }
  const required = (targetCGPA * (earnedCredits + remainCredits) - currentCGPA * earnedCredits) / remainCredits;
  if (required > max)  { requiredEl.textContent = "Not Possible";      resultEl.classList.add("target-impossible"); }
  else if (required < 0) { requiredEl.textContent = "Already Achieved!"; resultEl.classList.add("target-achieved"); }
  else { requiredEl.textContent = required.toFixed(2); resultEl.classList.add("target-possible"); }
}

function calcSGPAtoCGPA() {
  // Bug fix: Use credit-weighted average instead of simple average
  let weightedTotal = 0, totalCredits = 0, hasAnyCredit = false;
  let simpleTotal = 0, simpleCount = 0;
  document.querySelectorAll(".sgpa-row").forEach((row) => {
    const sgpaVal   = parseFloat(row.querySelector(".sgpa-val-input").value);
    const creditEl  = row.querySelector(".sgpa-credit-input");
    const creditVal = creditEl ? parseFloat(creditEl.value) : NaN;
    if (!isNaN(sgpaVal)) {
      simpleTotal += sgpaVal; simpleCount++;
      if (!isNaN(creditVal) && creditVal > 0) {
        weightedTotal += sgpaVal * creditVal;
        totalCredits  += creditVal;
        hasAnyCredit   = true;
      }
    }
  });
  const result = hasAnyCredit
    ? (weightedTotal / totalCredits)
    : (simpleCount > 0 ? simpleTotal / simpleCount : 0);
  document.getElementById("sgpaCGPA").textContent = result.toFixed(2);
  // Show/hide the weighted indicator
  const noteEl = document.getElementById("sgpaWeightedNote");
  if (noteEl) noteEl.style.display = hasAnyCredit ? "inline" : "none";
}

// ─── UI HELPERS ───────────────────────────────────────────────
function animateValue(el, from, to, duration) {
  const start = performance.now();
  requestAnimationFrame(function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = progress < 0.5 ? 2 * progress * progress : (4 - 2 * progress) * progress - 1;
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
  document.querySelectorAll(".sgpa-val-input").forEach((input) => { input.max = getScaleMax(); });
  renderScalePreview();
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
  setTimeout(() => { toast.classList.remove("toast-visible"); setTimeout(() => toast.remove(), 300); }, 3000);
}

function closeMobileMenu() {
  document.getElementById("mobileMenu").classList.remove("open");
  document.getElementById("hamburger").classList.remove("active");
}

// ─── PDF REPORT ───────────────────────────────────────────────
function generatePDF() {
  // Bug fix: Calculate CGPA directly to avoid reading an in-progress animated value
  let _weightedSum = 0, _totalCreditsCalc = 0;
  document.querySelectorAll(".semester-box").forEach((semBox) => {
    const semId = parseInt(semBox.dataset.semId);
    const sgpa  = calcSGPA(semId);
    const credits = Array.from(semBox.querySelectorAll(".course-credit")).reduce((s, el) => s + (parseFloat(el.value) || 0), 0);
    _weightedSum    += sgpa * credits;
    _totalCreditsCalc += credits;
  });
  const _cgpaExact = _totalCreditsCalc > 0 ? _weightedSum / _totalCreditsCalc : 0;
  const cgpa = _cgpaExact.toFixed(2);
  const credits = document.getElementById("totalCredits").textContent;
  const semesters = document.getElementById("totalSemesters").textContent;
  const grade = getCGPAGrade(parseFloat(cgpa));
  const scaleName = getScaleLabelFull(currentScale);
  const date = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
  const targetCGPA   = document.getElementById("targetCGPA").value;
  const remainCredit = document.getElementById("remainingCredits").value;
  const requiredGPA  = document.getElementById("requiredGPA").textContent;
  let semestersHTML = "";
  document.querySelectorAll(".semester-box").forEach((semBox) => {
    const semId   = parseInt(semBox.dataset.semId);
    const semName = semBox.querySelector(".semester-name-input").value.trim() || `Semester ${semId}`;
    const sgpa    = document.getElementById(`sgpa-sem-${semId}`)?.textContent || "0.00";
    let rowsHTML = "", semCredits = 0;
    semBox.querySelectorAll(".course-row").forEach((row, idx) => {
      const name = row.querySelector(".course-name").value.trim() || "Unnamed Course";
      const credit = row.querySelector(".course-credit").value || "–";
      const gradeEl = row.querySelector(".course-grade");
      const gradeText = gradeEl.selectedIndex > 0 ? gradeEl.options[gradeEl.selectedIndex].text : "–";
      const gradePoint = parseFloat(gradeEl.value) || 0;
      if (parseFloat(credit)) semCredits += parseFloat(credit);
      rowsHTML += `<tr style="background:${idx%2===0?"#f0f7fa":"#fff"}"><td style="padding:8px 12px;border-bottom:1px solid #dde6ea;">${name}</td><td style="padding:8px 12px;border-bottom:1px solid #dde6ea;text-align:center;">${credit}</td><td style="padding:8px 12px;border-bottom:1px solid #dde6ea;text-align:center;">${gradeText}</td><td style="padding:8px 12px;border-bottom:1px solid #dde6ea;text-align:center;font-weight:700;color:#287094;">${gradePoint>0?gradePoint.toFixed(2):"–"}</td></tr>`;
    });
    semestersHTML += `<div style="margin-bottom:28px;break-inside:avoid;"><div style="background:#287094;border-radius:6px 6px 0 0;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;"><span style="color:#fff;font-weight:700;font-size:14px;">${semName}</span><span style="color:#fff;font-weight:700;font-size:15px;">SGPA: ${sgpa}</span></div><table style="width:100%;border-collapse:collapse;border:1px solid #dde6ea;border-top:none;"><thead><tr style="background:#e8f3f8;"><th style="padding:8px 12px;text-align:left;font-size:11px;color:#287094;font-weight:700;text-transform:uppercase;border-bottom:1px solid #b3d4e3;">Course</th><th style="padding:8px 12px;text-align:center;font-size:11px;color:#287094;font-weight:700;text-transform:uppercase;border-bottom:1px solid #b3d4e3;">Credits</th><th style="padding:8px 12px;text-align:center;font-size:11px;color:#287094;font-weight:700;text-transform:uppercase;border-bottom:1px solid #b3d4e3;">Grade</th><th style="padding:8px 12px;text-align:center;font-size:11px;color:#287094;font-weight:700;text-transform:uppercase;border-bottom:1px solid #b3d4e3;">GP</th></tr></thead><tbody>${rowsHTML}</tbody></table><div style="text-align:right;font-size:12px;color:#999;margin-top:6px;">Credits: ${semCredits.toFixed(1)}</div></div>`;
  });
  let targetHTML = "";
  if (targetCGPA && remainCredit) {
    const color = requiredGPA==="Not Possible"?"#c62828":requiredGPA==="Already Achieved!"?"#287094":"#2e7d32";
    targetHTML = `<div style="background:#e8f3f8;border:1px solid #b3d4e3;border-radius:8px;padding:18px 20px;margin-bottom:28px;break-inside:avoid;"><div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#287094;margin-bottom:10px;">Target CGPA Plan</div><div style="display:flex;gap:32px;flex-wrap:wrap;"><div><div style="font-size:11px;color:#999;margin-bottom:2px;">Current CGPA</div><div style="font-size:18px;font-weight:700;">${cgpa}</div></div><div><div style="font-size:11px;color:#999;margin-bottom:2px;">Target CGPA</div><div style="font-size:18px;font-weight:700;">${targetCGPA}</div></div><div><div style="font-size:11px;color:#999;margin-bottom:2px;">Remaining Credits</div><div style="font-size:18px;font-weight:700;">${remainCredit}</div></div><div><div style="font-size:11px;color:#999;margin-bottom:2px;">Required GPA</div><div style="font-size:22px;font-weight:700;color:${color};">${requiredGPA}</div></div></div></div>`;
  }
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>CGPA Report</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;background:#fff;color:#222}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{margin:18mm 16mm;size:A4}}</style></head><body><div style="background:#287094;padding:28px 32px 24px;"><div style="display:flex;justify-content:space-between;align-items:flex-start;"><div><div style="font-size:22px;font-weight:700;color:#fff;">◈ CGPA Calculator</div><div style="font-size:13px;color:rgba(255,255,255,.6);margin-top:4px;">Academic CGPA Report</div></div><div style="text-align:right;"><div style="font-size:12px;color:rgba(255,255,255,.6);">Generated: ${date}</div><div style="font-size:12px;color:rgba(255,255,255,.6);margin-top:2px;">Scale: ${scaleName}</div></div></div></div><div style="background:#e8f3f8;padding:20px 32px;display:flex;gap:40px;align-items:center;margin-bottom:32px;border-bottom:2px solid #b3d4e3;"><div><div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#999;">Overall CGPA</div><div style="font-size:42px;font-weight:700;color:#287094;line-height:1.1;">${cgpa}</div><div style="font-size:13px;color:#287094;font-weight:700;margin-top:2px;">${grade}</div></div><div style="width:1px;height:60px;background:#b3d4e3;"></div><div><div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#999;">Total Credits</div><div style="font-size:28px;font-weight:700;color:#222;">${credits}</div></div><div style="width:1px;height:60px;background:#b3d4e3;"></div><div><div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#999;">Semesters</div><div style="font-size:28px;font-weight:700;color:#222;">${semesters}</div></div></div><div style="padding:0 32px 32px;">${targetHTML}${semestersHTML}<div style="margin-top:40px;padding-top:16px;border-top:1px solid #dde6ea;display:flex;justify-content:space-between;font-size:11px;color:#999;"><span>Generated by CGPA Calculator – cgpacalculator.dev</span><span>${date}</span></div></div></body></html>`;
  const blob = new Blob([html], { type:"text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = `CGPA-Report-${new Date().toISOString().slice(0,10)}.html`;
  document.body.appendChild(link); link.click();
  document.body.removeChild(link); URL.revokeObjectURL(url);
  showToast("Report downloaded successfully!");
}

// ─── INIT (shared calculator init) ───────────────────────────
function initCalculator() {
  const semContainer = document.getElementById("semestersContainer");
  semContainer.appendChild(createSemester());
  document.getElementById("addSemesterBtn").addEventListener("click", function () {
    const sem = createSemester();
    sem.style.opacity = "0"; sem.style.transform = "translateY(12px)";
    semContainer.appendChild(sem);
    requestAnimationFrame(() => { sem.style.transition = "opacity 0.3s ease, transform 0.3s ease"; sem.style.opacity = "1"; sem.style.transform = "translateY(0)"; });
    recalcAll();
  });
  const sgpaContainer = document.getElementById("sgpaRowsContainer");
  sgpaContainer.appendChild(createSGPARow());
  document.getElementById("addSGPARow").addEventListener("click", function () {
    sgpaContainer.appendChild(createSGPARow()); calcSGPAtoCGPA();
  });
  document.getElementById("targetCGPA").addEventListener("input", calcTarget);
  document.getElementById("remainingCredits").addEventListener("input", calcTarget);
  document.getElementById("currentCGPA").addEventListener("input", calcTarget);
  document.getElementById("downloadPDF").addEventListener("click", generatePDF);
  document.getElementById("hamburger").addEventListener("click", function () {
    this.classList.toggle("active");
    document.getElementById("mobileMenu").classList.toggle("open");
  });
  // Dropdown nav close on mobile link click
  document.querySelectorAll(".mobile-nav-link").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });
  const stickyBar = document.getElementById("stickyBar");
  const calcSection = document.querySelector(".calculator-section");
  const stickyObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) stickyBar.classList.add("visible");
    else if (entry.boundingClientRect.top > 0) stickyBar.classList.remove("visible");
  }, { threshold: 0, rootMargin: "-60px 0px 0px 0px" });
  if (calcSection) stickyObserver.observe(calcSection);
  recalcAll();
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", function () {
      const isOpen = this.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq-question").forEach((q) => { q.setAttribute("aria-expanded","false"); q.nextElementSibling.classList.remove("open"); });
      if (!isOpen) { this.setAttribute("aria-expanded","true"); this.nextElementSibling.classList.add("open"); }
    });
  });
  // Nav dropdown
  const navDropTrigger = document.getElementById("navDropTrigger");
  const navDropMenu    = document.getElementById("navDropMenu");
  if (navDropTrigger && navDropMenu) {
    navDropTrigger.addEventListener("mouseenter", () => navDropMenu.classList.add("open"));
    navDropTrigger.addEventListener("mouseleave", () => navDropMenu.classList.remove("open"));
    navDropMenu.addEventListener("mouseenter", () => navDropMenu.classList.add("open"));
    navDropMenu.addEventListener("mouseleave", () => navDropMenu.classList.remove("open"));
  }
}

// =========================
// CGPA CALCULATOR SCRIPT
// =========================
let semesterCount = 0;

// DOM Elements
const semesterSection = document.getElementById("semesterSection");
const cgpaDisplay = document.getElementById("cgpaDisplay");
const totalCreditDisplay = document.getElementById("totalCredit");
const academicStatus = document.getElementById("academicStatus");
const addSemesterBtn = document.getElementById("addSemesterBtn");
const targetCgpaInput = document.getElementById("targetCgpa");
const nextCreditInput = document.getElementById("nextCredit");
const requiredSgpaDisplay = document.getElementById("requiredSgpa");
const targetWarning = document.getElementById("targetWarning");

// NEW: Current/Starting CGPA Input
let currentCgpaInput = document.getElementById("currentCgpa");
if(!currentCgpaInput){
  currentCgpaInput = document.createElement("input");
  currentCgpaInput.type = "number";
  currentCgpaInput.step = "0.01";
  currentCgpaInput.max = "4";
  currentCgpaInput.min = "0";
  currentCgpaInput.id = "currentCgpa";
  currentCgpaInput.placeholder = "Current CGPA (auto or manual)";
  currentCgpaInput.style.margin = "10px 0";
  currentCgpaInput.style.width = "100%";
  currentCgpaInput.style.padding = "8px";
  if(targetCgpaInput) targetCgpaInput.parentNode.insertBefore(currentCgpaInput, targetCgpaInput);
}

// =========================
// EVENT LISTENERS
// =========================
if(addSemesterBtn){
  addSemesterBtn.addEventListener("click", addSemester);
}
if(targetCgpaInput){
  targetCgpaInput.addEventListener("input", calculateTarget);
}
if(nextCreditInput){
  nextCreditInput.addEventListener("input", calculateTarget);
}
if(currentCgpaInput){
  currentCgpaInput.addEventListener("input", () => {
    currentCgpaInput.dataset.manual = "true";
    calculateTarget();
  });
}

// =========================
// ADD / REMOVE SEMESTER & COURSE
// =========================
function addSemester() {
  semesterCount++;
  const semesterDiv = document.createElement("div");
  semesterDiv.className = "card fade-in";
  semesterDiv.setAttribute("data-semester", semesterCount);

  semesterDiv.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3>Semester ${semesterCount}</h3>
      <span class="semester-gpa">SGPA: 0.00</span>
      <button class="btn-danger" onclick="removeSemester(this)">Delete</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Course</th>
          <th>Credit</th>
          <th>Grade</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="semesterBody${semesterCount}"></tbody>
    </table>

    <button class="btn-primary" onclick="addCourse(${semesterCount})">Add Course</button>
  `;
  semesterSection.appendChild(semesterDiv);

  // Auto-add 3 course rows
  addCourse(semesterCount);
}

function addCourse(sem) {
  const tbody = document.getElementById(`semesterBody${sem}`);
  if(!tbody) return;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" placeholder="Course Name" /></td>
    <td><input type="number" step="0.5" class="credit" /></td>
    <td>
      <select class="grade">
        <option value="">Select</option>
        <option value="4.00">A+ (4.00)</option>
        <option value="3.75">A (3.75)</option>
        <option value="3.50">A- (3.50)</option>
        <option value="3.25">B+ (3.25)</option>
        <option value="3.00">B (3.00)</option>
        <option value="2.75">B- (2.75)</option>
        <option value="2.50">C+ (2.50)</option>
        <option value="2.25">C (2.25)</option>
        <option value="2.00">D (2.00)</option>
        <option value="0.00">F (0.00)</option>
      </select>
    </td>
    <td><button class="btn-danger" onclick="removeRow(this)">X</button></td>
  `;
  tbody.appendChild(row);

  row.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("input", calculateCGPA);
  });
}

function removeRow(btn) {
  btn.closest("tr")?.remove();
  calculateCGPA();
}

function removeSemester(btn) {
  btn.closest(".card")?.remove();
  calculateCGPA();
}

// =========================
// CGPA CALCULATION
// =========================
function calculateCGPA() {
  let totalPoints = 0, totalCredits = 0;

  document.querySelectorAll("#semesterSection .card").forEach(semester => {
    let semPoints = 0, semCredits = 0;
    semester.querySelectorAll("tbody tr").forEach(row => {
      const credit = parseFloat(row.querySelector(".credit")?.value) || 0;
      const grade = parseFloat(row.querySelector(".grade")?.value) || 0;
      semPoints += credit * grade;
      semCredits += credit;
    });
    const semGpa = semCredits ? (semPoints / semCredits).toFixed(2) : "0.00";
    const sgpaSpan = semester.querySelector(".semester-gpa");
    if(sgpaSpan) sgpaSpan.textContent = `SGPA: ${semGpa}`;

    totalPoints += semPoints;
    totalCredits += semCredits;
  });

  const cgpa = totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";

  if(cgpaDisplay) cgpaDisplay.textContent = cgpa;
  if(totalCreditDisplay) totalCreditDisplay.textContent = totalCredits;
  updateStatus(cgpa);

  if(currentCgpaInput && !currentCgpaInput.dataset.manual){
    currentCgpaInput.value = cgpa;
  }

  calculateTarget();
}

// =========================
// Update status message
// =========================
function updateStatus(cgpa){
  if(!academicStatus) return;
  academicStatus.innerHTML = "";
  const status = document.createElement("div");
  status.classList.add("status");

  const value = parseFloat(cgpa);
  if(value >= 3.75){
    status.textContent = "Excellent Performance"; status.classList.add("excellent");
  } else if(value >= 3.0){
    status.textContent = "Good Standing"; status.classList.add("good");
  } else if(value >= 2.0){
    status.textContent = "Academic Risk"; status.classList.add("risk");
  } else{
    status.textContent = "Critical Status"; status.classList.add("critical");
  }
  academicStatus.appendChild(status);
}

// =========================
// TARGET SGPA CALCULATION
// =========================
function calculateTarget(){
  if(!currentCgpaInput || !targetCgpaInput || !nextCreditInput || !requiredSgpaDisplay) return;

  let currentCgpa = parseFloat(currentCgpaInput.value) || 0;
  const targetCgpa = parseFloat(targetCgpaInput.value);
  const nextCredits = parseFloat(nextCreditInput.value);

  if(!targetCgpa || !nextCredits){
    requiredSgpaDisplay.textContent = "0.00";
    if(targetWarning) targetWarning.textContent = "";
    return;
  }

  const required = ((targetCgpa * (parseFloat(totalCreditDisplay.textContent || 0) + nextCredits)) - (currentCgpa * parseFloat(totalCreditDisplay.textContent || 0))) / nextCredits;

  if(required > 4){
    requiredSgpaDisplay.textContent = required.toFixed(2);
    if(targetWarning) targetWarning.innerHTML = "<span style='color:red;'>Target not realistically achievable (Above 4.0)</span>";
  } else if(required < 0){
    requiredSgpaDisplay.textContent = "0.00";
    if(targetWarning) targetWarning.innerHTML = "<span style='color:green;'>You have already secured your target 🎉</span>";
  } else{
    requiredSgpaDisplay.textContent = required.toFixed(2);
    if(targetWarning) targetWarning.textContent = "";
  }
}

// =========================
// PDF DOWNLOAD
// =========================
const downloadPdfBtn = document.getElementById("downloadPdf");
if(downloadPdfBtn){
  downloadPdfBtn.addEventListener("click", function(){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("ACADEMIC MARKSHEET", 70, y); y += 10;
    doc.setFontSize(12);
    doc.text(`Final CGPA: ${cgpaDisplay?.textContent}`, 20, y); y+=8;
    doc.text(`Total Earned Credits: ${totalCreditDisplay?.textContent}`, 20, y); y+=15;

    let semesterNumber = 0;

    document.querySelectorAll("#semesterSection .card").forEach(semester => {
      semesterNumber++;
      doc.setFontSize(14);
      doc.text(`Semester ${semesterNumber}`, 20, y); y+=8;
      doc.setFontSize(11);
      doc.text("Course", 20, y);
      doc.text("Credit", 110, y);
      doc.text("Grade", 150, y); y+=6;

      let semesterPoints = 0, semesterCredits = 0;

      semester.querySelectorAll("tbody tr").forEach(row => {
        const courseName = row.querySelector("input[type='text']")?.value || "-";
        const credit = parseFloat(row.querySelector(".credit")?.value) || 0;
        const grade = parseFloat(row.querySelector(".grade")?.value) || 0;

        doc.text(courseName, 20, y);
        doc.text(String(credit), 110, y);
        doc.text(String(grade), 150, y);

        semesterPoints += credit * grade;
        semesterCredits += credit;
        y += 6;

        if(y > 270){ doc.addPage(); y=20; }
      });

      const semesterGPA = semesterCredits ? (semesterPoints/semesterCredits).toFixed(2) : "0.00";
      y += 4;
      doc.text(`Semester GPA: ${semesterGPA}`, 20, y); y+=15;
    });

    doc.save("Full_Marksheet.pdf");
  });
}
// FAQ TOGGLE
document.querySelectorAll(".faq-question").forEach(q => {
  q.addEventListener("click", () => {
    const item = q.parentElement;
    item.classList.toggle("active");
  });
});

// =========================
// MOBILE MENU TOGGLE
// =========================
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if(menuToggle && navMenu){
  menuToggle.addEventListener("click", function(){
    navMenu.classList.toggle("active");
  });
}

// =========================
// AUTO CREATE FIRST SEMESTER
// =========================
window.addEventListener("DOMContentLoaded", function(){
  if(semesterSection) addSemester();
});


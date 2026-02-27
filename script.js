let semesterCount = 0;

const semesterSection = document.getElementById("semesterSection");
const cgpaDisplay = document.getElementById("cgpaDisplay");
const totalCreditDisplay = document.getElementById("totalCredit");
const academicStatus = document.getElementById("academicStatus");
const addSemesterBtn = document.getElementById("addSemesterBtn");
const targetCgpaInput = document.getElementById("targetCgpa");
const nextCreditInput = document.getElementById("nextCredit");
const requiredSgpaDisplay = document.getElementById("requiredSgpa");
const targetWarning = document.getElementById("targetWarning");

addSemesterBtn.addEventListener("click", addSemester);
targetCgpaInput.addEventListener("input", calculateTarget);
nextCreditInput.addEventListener("input", calculateTarget);

function addSemester() {
  semesterCount++;
  const semesterDiv = document.createElement("div");
  semesterDiv.className = "card fade-in";
  semesterDiv.setAttribute("data-semester", semesterCount);

  semesterDiv.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3>Semester ${semesterCount}</h3>
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
      <tbody id="semesterBody${semesterCount}">
      </tbody>
    </table>

    <button class="btn-primary" onclick="addCourse(${semesterCount})">Add Course</button>
  `;

  semesterSection.appendChild(semesterDiv);

  // 🔥 Automatically add 3 course rows
  addCourse(semesterCount);
}

function addCourse(sem) {
  const tbody = document.getElementById(`semesterBody${sem}`);
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="text" placeholder="Course Name" /></td>
    <td><input type="number" step="0.5" class="credit" /></td>
    <td>
      <select class="grade">
        <option value="">Select</option>
        <option value="4">A (4.0)</option>
        <option value="3.7">A- (3.7)</option>
        <option value="3.3">B+ (3.3)</option>
        <option value="3">B (3.0)</option>
        <option value="2.7">B- (2.7)</option>
        <option value="2.3">C+ (2.3)</option>
        <option value="2">C (2.0)</option>
        <option value="1">D (1.0)</option>
        <option value="0">F (0.0)</option>
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
  btn.closest("tr").remove();
  calculateCGPA();
}

function removeSemester(btn) {
  btn.closest(".card").remove();
  calculateCGPA();
}

function calculateCGPA() {
  let totalPoints = 0;
  let totalCredits = 0;

  document.querySelectorAll("tbody tr").forEach(row => {
    const credit = parseFloat(row.querySelector(".credit")?.value);
    const grade = parseFloat(row.querySelector(".grade")?.value);

    if (!isNaN(credit) && !isNaN(grade)) {
      totalPoints += credit * grade;
      totalCredits += credit;
    }
  });

  const cgpa = totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";

  cgpaDisplay.textContent = cgpa;
  totalCreditDisplay.textContent = totalCredits;
  updateStatus(cgpa);
  calculateTarget();
}

function updateStatus(cgpa) {
  academicStatus.innerHTML = "";
  const status = document.createElement("div");
  status.classList.add("status");

  const value = parseFloat(cgpa);

  if (value >= 3.75) {
    status.textContent = "Excellent Performance";
    status.classList.add("excellent");
  } else if (value >= 3.0) {
    status.textContent = "Good Standing";
    status.classList.add("good");
  } else if (value >= 2.0) {
    status.textContent = "Academic Risk";
    status.classList.add("risk");
  } else {
    status.textContent = "Critical Status";
    status.classList.add("critical");
  }

  academicStatus.appendChild(status);
}

function calculateTarget() {
  const currentCgpa = parseFloat(cgpaDisplay.textContent);
  const totalCredits = parseFloat(totalCreditDisplay.textContent);
  const targetCgpa = parseFloat(targetCgpaInput.value);
  const nextCredits = parseFloat(nextCreditInput.value);

  if (!targetCgpa || !nextCredits || totalCredits === 0) {
    requiredSgpaDisplay.textContent = "0.00";
    targetWarning.textContent = "";
    return;
  }

  const required =
    ((targetCgpa * (totalCredits + nextCredits)) -
      currentCgpa * totalCredits) / nextCredits;

  if (required > 4) {
    requiredSgpaDisplay.textContent = required.toFixed(2);
    targetWarning.innerHTML =
      "<span style='color:red;'>Target not realistically achievable (Above 4.0)</span>";
  } else if (required < 0) {
    requiredSgpaDisplay.textContent = "0.00";
    targetWarning.innerHTML =
      "<span style='color:green;'>You have already secured your target 🎉</span>";
  } else {
    requiredSgpaDisplay.textContent = required.toFixed(2);
    targetWarning.textContent = "";
  }
}

/* =========================
   PDF DOWNLOAD FUNCTION
========================= */

document.getElementById("downloadPdf").addEventListener("click", function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  doc.setFontSize(18);
  doc.text("ACADEMIC MARKSHEET", 70, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Final CGPA: ${cgpaDisplay.textContent}`, 20, y);
  y += 8;
  doc.text(`Total Earned Credits: ${totalCreditDisplay.textContent}`, 20, y);
  y += 15;

  let semesterNumber = 0;

  document.querySelectorAll("#semesterSection .card").forEach(semester => {

    semesterNumber++;
    doc.setFontSize(14);
    doc.text(`Semester ${semesterNumber}`, 20, y);
    y += 8;

    doc.setFontSize(11);
    doc.text("Course", 20, y);
    doc.text("Credit", 110, y);
    doc.text("Grade", 150, y);
    y += 6;

    let semesterPoints = 0;
    let semesterCredits = 0;

    semester.querySelectorAll("tbody tr").forEach(row => {
      const courseName = row.querySelector("input[type='text']").value || "-";
      const credit = parseFloat(row.querySelector(".credit").value) || 0;
      const grade = parseFloat(row.querySelector(".grade").value) || 0;

      doc.text(courseName, 20, y);
      doc.text(String(credit), 110, y);
      doc.text(String(grade), 150, y);

      semesterPoints += credit * grade;
      semesterCredits += credit;

      y += 6;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    const semesterGPA = semesterCredits
      ? (semesterPoints / semesterCredits).toFixed(2)
      : "0.00";

    y += 4;
    doc.text(`Semester GPA: ${semesterGPA}`, 20, y);
    y += 15;

  });

  doc.save("Full_Marksheet.pdf");
});

// Auto create first semester when page loads
window.addEventListener("DOMContentLoaded", function () {
  addSemester();
});
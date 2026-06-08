// GPA-CGPA Converter Page JS
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


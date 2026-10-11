/* CGPA report template. Loaded on demand (only when "Download Report" is clicked).
   Exposes window.buildCgpaReport(data) -> a complete, print-ready HTML document string. */
(function () {
  "use strict";

  var REPORT_CSS = [
    "*{box-sizing:border-box;margin:0;padding:0}",
    "body{font-family:Georgia,serif;background:#fff;color:#222}",
    ".head{background:#1F4D3A;padding:28px 32px 24px;display:flex;justify-content:space-between;align-items:flex-start}",
    ".brand{font-size:22px;font-weight:700;color:#fff}",
    ".head-sub,.head-meta{font-size:12px;color:rgba(255,255,255,.6)}",
    ".head-sub{font-size:13px;margin-top:4px}",
    ".head-meta{text-align:right}.head-meta div+div{margin-top:2px}",
    ".summary{background:#EAF1EC;padding:20px 32px;display:flex;gap:40px;align-items:center;margin-bottom:32px;border-bottom:2px solid #C5D8CC}",
    ".divider{width:1px;height:60px;background:#C5D8CC}",
    ".label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#999}",
    ".big{font-size:42px;font-weight:700;color:#1F4D3A;line-height:1.1}",
    ".mid{font-size:28px;font-weight:700;color:#222}",
    ".remark{font-size:13px;color:#1F4D3A;font-weight:700;margin-top:2px}",
    ".body{padding:0 32px 32px}",
    ".target{background:#EAF1EC;border:1px solid #C5D8CC;border-radius:8px;padding:18px 20px;margin-bottom:28px;break-inside:avoid}",
    ".target-title{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#1F4D3A;margin-bottom:10px}",
    ".target-grid{display:flex;gap:32px;flex-wrap:wrap}",
    ".target-label{font-size:11px;color:#999;margin-bottom:2px}",
    ".target-value{font-size:18px;font-weight:700}",
    ".target-value.required{font-size:22px}",
    ".tone-impossible{color:#c62828}.tone-achieved{color:#1F4D3A}.tone-possible{color:#2e7d32}",
    ".semester{margin-bottom:28px;break-inside:avoid}",
    ".sem-head{background:#1F4D3A;border-radius:6px 6px 0 0;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;color:#fff;font-weight:700}",
    ".sem-head span:first-child{font-size:14px}.sem-head span:last-child{font-size:15px}",
    "table{width:100%;border-collapse:collapse;border:1px solid #E6E0D2;border-top:none}",
    "thead tr{background:#EAF1EC}",
    "th{padding:8px 12px;text-align:center;font-size:11px;color:#1F4D3A;font-weight:700;text-transform:uppercase;border-bottom:1px solid #C5D8CC}",
    "td{padding:8px 12px;text-align:center;border-bottom:1px solid #E6E0D2}",
    "th:first-child,td:first-child{text-align:left}",
    "tbody tr:nth-child(odd){background:#F4F0E6}tbody tr:nth-child(even){background:#fff}",
    ".gp{font-weight:700;color:#1F4D3A}",
    ".sem-credits{text-align:right;font-size:12px;color:#999;margin-top:6px}",
    ".foot{margin-top:40px;padding-top:16px;border-top:1px solid #E6E0D2;display:flex;justify-content:space-between;font-size:11px;color:#999}",
    "@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{margin:18mm 16mm;size:A4}}",
  ].join("\n");

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function stat(label, value, className) {
    return (
      '<div><div class="label">' +
      label +
      '</div><div class="' +
      className +
      '">' +
      esc(value) +
      "</div></div>"
    );
  }

  function targetBlock(t) {
    if (!t) return "";
    function cell(label, value, extra) {
      return (
        '<div><div class="target-label">' +
        label +
        '</div><div class="target-value' +
        (extra || "") +
        '">' +
        esc(value) +
        "</div></div>"
      );
    }
    return (
      '<div class="target"><div class="target-title">Target CGPA Plan</div><div class="target-grid">' +
      cell("Current CGPA", t.current) +
      cell("Completed Credits", t.completed || "–") +
      cell("Target CGPA", t.target) +
      cell("Remaining Credits", t.remaining) +
      cell("Required GPA", t.required, " required tone-" + t.tone) +
      "</div></div>"
    );
  }

  function semesterBlock(sem) {
    var rows = sem.rows
      .map(function (r) {
        return (
          "<tr><td>" +
          esc(r.name) +
          "</td><td>" +
          esc(r.credit) +
          "</td><td>" +
          esc(r.grade) +
          '</td><td class="gp">' +
          esc(r.points) +
          "</td></tr>"
        );
      })
      .join("");
    return (
      '<div class="semester"><div class="sem-head"><span>' +
      esc(sem.name) +
      "</span><span>SGPA: " +
      esc(sem.sgpa) +
      "</span></div>" +
      "<table><thead><tr><th>Course</th><th>Credits</th><th>Grade</th><th>GP</th></tr></thead><tbody>" +
      rows +
      "</tbody></table>" +
      '<div class="sem-credits">Credits: ' +
      esc(sem.credits) +
      "</div></div>"
    );
  }

  window.buildCgpaReport = function (d) {
    return (
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>CGPA Report</title><style>' +
      REPORT_CSS +
      "</style></head><body>" +
      '<div class="head"><div><div class="brand">◈ CGPA Tools</div><div class="head-sub">Academic CGPA Report</div></div>' +
      '<div class="head-meta"><div>Generated: ' +
      esc(d.date) +
      "</div><div>Scale: " +
      esc(d.scaleName) +
      "</div></div></div>" +
      '<div class="summary">' +
      '<div><div class="label">Overall CGPA</div><div class="big">' +
      esc(d.cgpa) +
      '</div><div class="remark">' +
      esc(d.remark) +
      "</div></div>" +
      '<div class="divider"></div>' +
      stat("Total Credits", d.credits, "mid") +
      '<div class="divider"></div>' +
      stat("Semesters", d.semesters, "mid") +
      "</div>" +
      '<div class="body">' +
      targetBlock(d.target) +
      d.semesterList.map(semesterBlock).join("") +
      '<div class="foot"><span>Generated by CGPA Tools – cgpacalculator.dev</span><span>' +
      esc(d.date) +
      "</span></div></div></body></html>"
    );
  };
})();

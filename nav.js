(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var dds = Array.from(document.querySelectorAll(".sh-dd"));
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    function set(dd, open) {
      dd.querySelector(".sh-panel").classList.toggle("open", open);
      dd.querySelector(".sh-btn").setAttribute("aria-expanded", open ? "true" : "false");
    }
    function closeAll(except) { dds.forEach(function (d) { if (d !== except) set(d, false); }); }
    dds.forEach(function (dd) {
      var btn = dd.querySelector(".sh-btn"), t;
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = btn.getAttribute("aria-expanded") === "true";
        closeAll(dd); set(dd, !open);
      });
      dd.addEventListener("mouseenter", function () { if (canHover.matches) { clearTimeout(t); closeAll(dd); set(dd, true); } });
      dd.addEventListener("mouseleave", function () { if (canHover.matches) t = setTimeout(function () { set(dd, false); }, 140); });
      dd.addEventListener("focusout", function (e) { if (!dd.contains(e.relatedTarget)) set(dd, false); });
      dd.addEventListener("keydown", function (e) { if (e.key === "Escape") { set(dd, false); btn.focus(); } });
    });
    document.addEventListener("click", function () { closeAll(); });

    var burger = document.getElementById("shBurger"), mob = document.getElementById("shMobile");
    if (burger && mob) {
      burger.addEventListener("click", function () {
        var open = mob.classList.toggle("open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
      window.addEventListener("resize", function () { if (window.innerWidth > 820) { mob.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); } });
    }

    var here = location.pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/";
    document.querySelectorAll(".sh a[href], .sh-mobile a[href]").forEach(function (a) {
      var p = a.pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/";
      if (p === here && here !== "/") a.setAttribute("aria-current", "page");
    });

    document.querySelectorAll(".faq-question").forEach(function (q) {
      q.addEventListener("click", function () {
        var isOpen = this.getAttribute("aria-expanded") === "true";
        document.querySelectorAll(".faq-question").forEach(function (x) {
          x.setAttribute("aria-expanded", "false");
          x.nextElementSibling.classList.remove("open");
        });
        if (!isOpen) { this.setAttribute("aria-expanded", "true"); this.nextElementSibling.classList.add("open"); }
      });
    });
  });
})();

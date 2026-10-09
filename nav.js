function closeMobileMenu() {
  var m = document.getElementById("mobileMenu");
  var h = document.getElementById("hamburger");
  if (m) m.classList.remove("open");
  if (h) h.classList.remove("active");
}

(function() {
  document.addEventListener("DOMContentLoaded", function() {
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    if (hamburger && mobileMenu) {
      hamburger.addEventListener("click", function() {
        this.classList.toggle("active");
        mobileMenu.classList.toggle("open");
      });
      document.querySelectorAll(".mobile-nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          hamburger.classList.remove("active");
          mobileMenu.classList.remove("open");
        });
      });
    }

    // Header mega menu (CGPA Calculators / SSC & HSC / Tools)
    const dropdowns = Array.from(document.querySelectorAll(".nav-dropdown"));
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const pad = 16;

    function setOpen(dd, open) {
      const trigger = dd.querySelector(".nav-dropdown-trigger");
      const mega = dd.querySelector(".mega");
      if (!trigger || !mega) return;
      if (open) {
        const card = mega.querySelector(".mega-card");
        card.style.setProperty("--mx", "0px");
        mega.classList.add("open");
        const r = card.getBoundingClientRect();
        let shift = 0;
        if (r.right > window.innerWidth - pad) shift = window.innerWidth - pad - r.right;
        if (r.left + shift < pad) shift = pad - r.left;
        card.style.setProperty("--mx", shift + "px");
      } else {
        mega.classList.remove("open");
        dd.dataset.hover = "";
      }
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    }
    function closeAll(except) {
      dropdowns.forEach((d) => { if (d !== except) setOpen(d, false); });
    }

    dropdowns.forEach((dd) => {
      const trigger = dd.querySelector(".nav-dropdown-trigger");
      const mega = dd.querySelector(".mega");
      let timer;
      trigger.addEventListener("click", function(e) {
        e.stopPropagation();
        const isOpen = mega.classList.contains("open");
        if (isOpen && dd.dataset.hover === "1") { dd.dataset.hover = ""; return; } // pin a hover-opened menu
        closeAll(dd);
        setOpen(dd, !isOpen);
      });
      dd.addEventListener("mouseenter", function() {
        if (!canHover.matches) return;
        clearTimeout(timer);
        closeAll(dd);
        if (!mega.classList.contains("open")) { setOpen(dd, true); dd.dataset.hover = "1"; }
      });
      dd.addEventListener("mouseleave", function() {
        if (!canHover.matches || dd.dataset.hover !== "1") return;
        timer = setTimeout(() => setOpen(dd, false), 160);
      });
      dd.addEventListener("focusout", function(e) {
        if (!dd.contains(e.relatedTarget)) setOpen(dd, false);
      });
      dd.addEventListener("keydown", function(e) {
        const items = Array.from(mega.querySelectorAll("a.mega-item"));
        if (e.key === "Escape") { setOpen(dd, false); trigger.focus(); }
        else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          if (!items.length) return;
          e.preventDefault();
          if (!mega.classList.contains("open")) { closeAll(dd); setOpen(dd, true); }
          const i = items.indexOf(document.activeElement);
          const next = e.key === "ArrowDown" ? (i + 1) % items.length : (i <= 0 ? items.length - 1 : i - 1);
          items[next].focus();
        }
      });
      mega.querySelectorAll("a.mega-item").forEach((item) => {
        item.addEventListener("click", () => setOpen(dd, false));
      });
    });
    document.addEventListener("click", () => closeAll());
    window.addEventListener("resize", () => closeAll());

    // Mobile accordion groups
    document.querySelectorAll(".m-group-btn").forEach((btn) => {
      btn.addEventListener("click", function() {
        const body = document.getElementById(this.getAttribute("aria-controls"));
        const open = this.getAttribute("aria-expanded") === "true";
        document.querySelectorAll(".m-group-btn").forEach((b) => {
          b.setAttribute("aria-expanded", "false");
          document.getElementById(b.getAttribute("aria-controls")).classList.remove("open");
        });
        if (!open) { this.setAttribute("aria-expanded", "true"); body.classList.add("open"); }
      });
    });

    // FAQ accordion (blog/info pages)
    document.querySelectorAll(".faq-question").forEach((question) => {
      question.addEventListener("click", function() {
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
  });
})();

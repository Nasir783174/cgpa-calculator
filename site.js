/* Shared site behaviour: web fonts, mobile menu, desktop mega menu and FAQ accordions. */
(function () {
  "use strict";

  /* Web fonts: the stylesheet is requested with media="print" so it never blocks rendering,
     then switched on once the document is parsed. */
  document.querySelectorAll("link[data-fonts]").forEach(function (link) {
    link.media = "all";
  });

  /* Mobile menu */
  function initMobileMenu() {
    var hamburger = document.getElementById("hamburger");
    var menu = document.getElementById("mobileMenu");
    if (!hamburger || !menu) return;

    function close() {
      hamburger.classList.remove("active");
      menu.classList.remove("open");
    }

    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      menu.classList.toggle("open");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });

    // Accordion groups inside the mobile menu
    menu.querySelectorAll(".m-group-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var wasOpen = btn.getAttribute("aria-expanded") === "true";
        menu.querySelectorAll(".m-group-btn").forEach(function (other) {
          other.setAttribute("aria-expanded", "false");
          document.getElementById(other.getAttribute("aria-controls")).classList.remove("open");
        });
        if (!wasOpen) {
          btn.setAttribute("aria-expanded", "true");
          document.getElementById(btn.getAttribute("aria-controls")).classList.add("open");
        }
      });
    });
  }

  /* Desktop mega menu (hover on mouse devices, click/keyboard everywhere) */
  function initMegaMenu() {
    var dropdowns = Array.prototype.slice.call(document.querySelectorAll(".nav-dropdown"));
    if (!dropdowns.length) return;
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    var EDGE_GAP = 16;

    function setOpen(dd, open) {
      var trigger = dd.querySelector(".nav-dropdown-trigger");
      var mega = dd.querySelector(".mega");
      if (!trigger || !mega) return;
      if (open) {
        // keep the card inside the viewport
        var card = mega.querySelector(".mega-card");
        card.style.setProperty("--mx", "0px");
        mega.classList.add("open");
        var r = card.getBoundingClientRect();
        var shift = 0;
        if (r.right > window.innerWidth - EDGE_GAP) shift = window.innerWidth - EDGE_GAP - r.right;
        if (r.left + shift < EDGE_GAP) shift = EDGE_GAP - r.left;
        card.style.setProperty("--mx", shift + "px");
      } else {
        mega.classList.remove("open");
        dd.dataset.hover = "";
      }
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function closeAll(except) {
      dropdowns.forEach(function (dd) {
        if (dd !== except) setOpen(dd, false);
      });
    }

    dropdowns.forEach(function (dd) {
      var trigger = dd.querySelector(".nav-dropdown-trigger");
      var mega = dd.querySelector(".mega");
      var timer;

      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var isOpen = mega.classList.contains("open");
        if (isOpen && dd.dataset.hover === "1") {
          dd.dataset.hover = ""; // a click pins a menu that was opened by hover
          return;
        }
        closeAll(dd);
        setOpen(dd, !isOpen);
      });
      dd.addEventListener("mouseenter", function () {
        if (!canHover.matches) return;
        clearTimeout(timer);
        closeAll(dd);
        if (!mega.classList.contains("open")) {
          setOpen(dd, true);
          dd.dataset.hover = "1";
        }
      });
      dd.addEventListener("mouseleave", function () {
        if (!canHover.matches || dd.dataset.hover !== "1") return;
        timer = setTimeout(function () {
          setOpen(dd, false);
        }, 160);
      });
      dd.addEventListener("focusout", function (e) {
        if (!dd.contains(e.relatedTarget)) setOpen(dd, false);
      });
      dd.addEventListener("keydown", function (e) {
        var items = Array.prototype.slice.call(mega.querySelectorAll("a.mega-item"));
        if (e.key === "Escape") {
          setOpen(dd, false);
          trigger.focus();
        } else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && items.length) {
          e.preventDefault();
          if (!mega.classList.contains("open")) {
            closeAll(dd);
            setOpen(dd, true);
          }
          var i = items.indexOf(document.activeElement);
          var next = e.key === "ArrowDown" ? (i + 1) % items.length : i <= 0 ? items.length - 1 : i - 1;
          items[next].focus();
        }
      });
      mega.addEventListener("click", function (e) {
        if (e.target.closest("a.mega-item")) setOpen(dd, false);
      });
    });

    document.addEventListener("click", function () {
      closeAll();
    });
    window.addEventListener("resize", function () {
      closeAll();
    });
  }

  /* FAQ accordions. Two markups exist:
     - guides:      button.faq-question (aria-expanded) followed by its answer
     - calculators: .faq-item > button.faq-q */
  function initFaq() {
    document.addEventListener("click", function (e) {
      var q = e.target.closest(".faq-question");
      if (q) {
        var wasOpen = q.getAttribute("aria-expanded") === "true";
        document.querySelectorAll(".faq-question").forEach(function (other) {
          other.setAttribute("aria-expanded", "false");
          other.nextElementSibling.classList.remove("open");
        });
        if (!wasOpen) {
          q.setAttribute("aria-expanded", "true");
          q.nextElementSibling.classList.add("open");
        }
        return;
      }
      var btn = e.target.closest(".faq-q");
      if (btn) {
        var item = btn.closest(".faq-item");
        var open = item.classList.contains("open");
        document.querySelectorAll(".faq-item.open").forEach(function (i) {
          i.classList.remove("open");
        });
        if (!open) item.classList.add("open");
      }
    });
  }

  initMobileMenu();
  initMegaMenu();
  initFaq();
})();

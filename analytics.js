/* Analytics: Google Analytics 4 and Microsoft Clarity, loaded after the page has finished loading
   so they never compete with content for bandwidth. */
(function () {
  "use strict";

  var GA_ID = "G-31G4QMCRXB";
  var CLARITY_ID = "wlnn53n6p8";

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());

  function loadScript(src) {
    var s = document.createElement("script");
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  function start() {
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + GA_ID);
    window.gtag("config", GA_ID, { send_page_view: false });
    window.gtag("event", "page_view");

    window.clarity =
      window.clarity ||
      function () {
        (window.clarity.q = window.clarity.q || []).push(arguments);
      };
    loadScript("https://www.clarity.ms/tag/" + CLARITY_ID);
  }

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();

// ==UserScript==
// @name         aproda
// @namespace    https://adesso.at/
// @version      0.1
// @description  Time Reporting!
// @author       Yourself
// @require      https://cdn.jsdelivr.net/gh/crapkit/timesheet-utils@master/dist/aproda.js
// @match        https://aproda.adesso.at/arbeitszeit/arbeitszeit.jsf
// ==/UserScript==

(function main() {

  // TODO:
  const projectMap = {};

  window.addEventListener('keyup', (e) => {
    if (e.ctrlKey && e.key === 'f') {
      return __User__AprodaUtils.fillDay(projectMap);
    }
    if (e.ctrlKey && e.key === 'a') {
      return __User__AprodaUtils.setupEntries(projectMap);
    }
    if (e.ctrlKey && e.key === 'h') {
      return __User__AprodaUtils.markAllAsHomeOffice();
    }
    if (e.ctrlKey && e.key === 'z') {
      return __User__AprodaUtils.zeitausgleich();
    }
    if (e.ctrlKey && e.key === 'u') {
      return __User__AprodaUtils.urlaub();
    }
  });
})();

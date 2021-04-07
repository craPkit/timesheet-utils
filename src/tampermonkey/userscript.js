// ==UserScript==
// @name         aproda
// @namespace    https://adesso.at/
// @version      0.1
// @description  Time Reporting!
// @author       Yourself
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
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
  });
})();

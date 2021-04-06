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

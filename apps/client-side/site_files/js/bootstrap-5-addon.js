site.vTab = function (name) {
  if (!name) {
    return false;
  }
  document.querySelectorAll('.v-tabs .nav-link').forEach((el) => {
    el.classList.remove('active');
  });
  document.querySelectorAll('.v-contents .tab-pane').forEach((el) => {
    el.classList.remove('active');
    el.classList.remove('show');
    el.classList.add('none');
  });
  document.querySelectorAll(`.v-tabs #${name}-tab , .v-contents #${name}-content`).forEach((el) => {
    el.classList.add('active');
    el.classList.add('show');
    el.classList.remove('none');
  });
};


(function () {
  var searchInput = document.getElementById('searchInput');
  var sections = Array.prototype.slice.call(document.querySelectorAll('.doc-section'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var emptyState = document.getElementById('emptyState');
  var topButton = document.getElementById('topButton');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function sectionText(section) {
    return normalize(section.innerText + ' ' + section.getAttribute('data-tags'));
  }

  function filterSections() {
    var query = normalize(searchInput.value);
    var visibleCount = 0;

    sections.forEach(function (section) {
      var isVisible = !query || sectionText(section).indexOf(query) !== -1;
      section.classList.toggle('hidden', !isVisible);
      if (isVisible) {
        visibleCount += 1;
      }
    });

    navLinks.forEach(function (link) {
      var target = document.querySelector(link.getAttribute('href'));
      link.style.display = !query || (target && !target.classList.contains('hidden')) ? '' : 'none';
    });

    emptyState.classList.toggle('show', visibleCount === 0);
  }

  function updateActiveNav() {
    var current = sections.find(function (section) {
      if (section.classList.contains('hidden')) {
        return false;
      }
      return section.getBoundingClientRect().top >= 0;
    });

    if (!current) {
      current = sections.filter(function (section) {
        return !section.classList.contains('hidden');
      }).pop();
    }

    navLinks.forEach(function (link) {
      link.classList.toggle('active', current && link.getAttribute('href') === '#' + current.id);
    });

    topButton.classList.toggle('show', window.scrollY > 480);
  }

  function setupCopyButtons() {
    document.querySelectorAll('pre').forEach(function (pre) {
      var button = document.createElement('button');
      button.className = 'copy-button';
      button.type = 'button';
      button.textContent = 'Copy';
      button.addEventListener('click', function () {
        var code = pre.querySelector('code').innerText;
        navigator.clipboard.writeText(code).then(function () {
          button.textContent = 'Copied';
          window.setTimeout(function () {
            button.textContent = 'Copy';
          }, 1300);
        });
      });
      pre.appendChild(button);
    });
  }

  searchInput.addEventListener('input', filterSections);
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  window.addEventListener('resize', updateActiveNav);
  topButton.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  setupCopyButtons();
  filterSections();
  updateActiveNav();
})();

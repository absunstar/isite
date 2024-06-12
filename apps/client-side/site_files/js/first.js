try {
  let update = false;
  if (window.SOCIALBROWSER && SOCIALBROWSER.var && SOCIALBROWSER.var.blocking && SOCIALBROWSER.var.blocking.popup && SOCIALBROWSER.var.blocking.white_list && document.location.hostname) {
    if (!SOCIALBROWSER.var.blocking.white_list.some((w) => w.url.contains(document.location.hostname))) {
      SOCIALBROWSER.var.blocking.white_list.push({
        url: '*' + document.location.hostname + '*',
      });
      update = true;
    }

    if (!SOCIALBROWSER.var.blocking.popup.white_list.some((w) => w.url.contains(document.location.hostname))) {
      SOCIALBROWSER.var.blocking.popup.white_list.push({
        url: '*' + document.location.hostname + '*',
      });
      update = true;
    }

    if (update && SOCIALBROWSER.ipc) {
      SOCIALBROWSER.ipc('[update-browser-var]', {
        name: 'blocking',
        data: SOCIALBROWSER.var.blocking,
      });
    }
  }
} catch (error) {
  console.log(error);
}

if (typeof module === 'object') {
  window.module = module;
  module = undefined;
}

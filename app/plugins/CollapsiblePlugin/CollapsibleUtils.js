export function setDomHiddenUntilFound(dom) {
  // experimental property in some browsers
  dom.hidden = 'until-found';
}

export function domOnBeforeMatch(dom, callback) {
  dom.onbeforematch = callback;
}
const SUPPORTED_URL_PROTOCOLS = new Set([
  'http:',
  'https:',
  'mailto:',
  'sms:',
  'tel:',
]);

export function sanitizeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    // Only allow supported protocols; all others return 'about:blank'.
    // No need to disable 'no-script-url' because javascript: URLs are blocked.
    if (!SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
      return 'about:blank';
    }
  } catch {
    // If URL is invalid, return it as-is (caller may handle it)
    return url;
  }
  return url;
}

// Source: https://stackoverflow.com/a/8234912/2013580
const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
);

export function validateUrl(url) {
  // TODO: Fix UI for link insertion; it should never default to an invalid URL such as https://.
  // Maybe show a dialog where the user can type the URL before inserting it.
  return url === 'https://' || urlRegExp.test(url);
}

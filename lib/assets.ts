/**
 * A path under /public, the way the page should fetch it: absolute on the
 * site, relative in the static preview, which marks its document with
 * data-preview and keeps the files beside the page.
 */
export const asset = (path: string) => (typeof document !== "undefined" && document.documentElement.hasAttribute("data-preview") ? path.replace(/^\//, "") : path);

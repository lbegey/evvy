/** postMessage protocol between an embed page and its host iframe. */

/** Embed → host: "my content is this tall". */
export const EMBED_HEIGHT_MSG = "evvy-embed-height";

/** Host → embed: "report your height again" (the host may have missed the first one). */
export const EMBED_HEIGHT_REQUEST_MSG = "evvy-embed-height-request";

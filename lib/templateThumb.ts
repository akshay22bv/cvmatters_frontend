/** A4 resume page at 96dpi — shared by landing gallery and builder template fan. */
export const TEMPLATE_PAGE_W = 794;
export const TEMPLATE_PAGE_H = 1123;

/** Visible thumbnail width (Enhancv-style cards). */
export const TEMPLATE_THUMB_W = 348;

export const TEMPLATE_THUMB_SCALE = TEMPLATE_THUMB_W / TEMPLATE_PAGE_W;

export const TEMPLATE_THUMB_FRAME_H = Math.ceil(TEMPLATE_PAGE_H * TEMPLATE_THUMB_SCALE);

/** Gallery frame height — one full A4 page at thumbnail scale (no bottom crop). */
export const TEMPLATE_THUMB_STAGE_H = TEMPLATE_THUMB_FRAME_H;

export const TEMPLATE_THUMB_W_MOBILE = 296;

export const templateThumbScaleMobile = TEMPLATE_THUMB_W_MOBILE / TEMPLATE_PAGE_W;
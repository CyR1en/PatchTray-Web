/**
 * A pinned scroll section needs a viewport tall enough to hold its whole
 * composition; below that it can never be read while pinned. `styles.css`
 * unpins every scroll stage at this breakpoint — keep the two in sync, and the
 * components force their progress to the assembled state so the unpinned
 * section renders complete instead of waiting for scroll progress that the
 * released sticky can no longer report.
 */
export const UNPINNED_STAGE_QUERY = "(max-height: 560px)";

/** Phone layout: stacked pinned sections run on earlier animation phases. */
export const COMPACT_STAGE_QUERY = "(max-width: 600px)";

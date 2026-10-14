/** Marker used for content the owner still has to supply. */
export const PLACEHOLDER_MARK = '[PLACEHOLDER';

/** True when a config value is set to something real (not empty, not a placeholder). */
export function hasValue(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim() !== '' && !value.includes(PLACEHOLDER_MARK);
}

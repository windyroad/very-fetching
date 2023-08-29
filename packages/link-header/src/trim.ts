/**
 * Removes whitespace
 * @param value the string to remove whitespace from
 * @returns the value with the whitespace removed
 */
export function trim(value: string) {
	return value.replace(/^[\s\uFEFF\u00A0]+|[\s\uFEFF\u00A0]+$/g, '');
}

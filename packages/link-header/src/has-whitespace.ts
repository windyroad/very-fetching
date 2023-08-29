/**
 * Checks if the string has whitespace
 * @param value the string to check
 * @returns true if the string has whitespace
 */
export function hasWhitespace(value: string) {
	return /[\s\u00A0\uFEFF]/.test(value);
}

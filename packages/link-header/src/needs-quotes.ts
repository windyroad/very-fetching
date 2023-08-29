/**
 * Checks if the string needs quotes
 * @param value the string to check
 * @returns true if the string need quotes
 */
export function needsQuotes(value: string) {
	return /[",;\s]/.test(value) || !/^[!#$%&'*+\-.^`|~\w]+$/.test(value);
}

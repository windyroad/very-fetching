/**
 *  Escapes quotes in the string
 * @param value string
 * @returns the string with quotes escaped
 */
export function escapeQuotes(value: string) {
	return value.replace(/"/g, '\\"');
}

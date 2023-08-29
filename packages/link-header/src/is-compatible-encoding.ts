/**
 * Determines whether an encoding can be
 * natively handled with a `Buffer`
 * @param value the string to check
 * @returns true if the encoding is compatible
 */
export function isCompatibleEncoding(value: string) {
	return /^utf-?8|ascii|utf-?16-?le|ucs-?2|base-?64|latin-?1$/i.test(value);
}

/**
 * Checks if the attribute may only occur once
 * @param attribute the attribute to check
 * @returns true if the attribute may only occur once
 */
export function isSingleOccurrenceAttribute(attribute: string) {
	return (
		attribute === 'rel' ||
		attribute === 'type' ||
		attribute === 'media' ||
		attribute === 'title' ||
		attribute === 'title*'
	);
}

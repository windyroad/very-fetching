/**
 *  Checks if the attribute is a token attribute
 * @param attribute the attribute to check
 * @returns true if the attribute is a token attribute
 */
export function isTokenAttribute(attribute: string) {
	return attribute === 'rel' || attribute === 'type' || attribute === 'anchor';
}

/**
 * Retrieves the hash part of a url
 * @param input the url. Can be relative
 * @returns the hash part of the url or undefined
 */
export function getUrlFragment(input: string) {
	const hashIndex = input.indexOf('#');
	const hash = hashIndex >= 0 ? input.slice(hashIndex) : undefined;
	return hash;
}

import {LinkHeader} from './link-header.js';

/**
 * Parses a string as a link header
 * @param value the string to Parse
 * @returns the parsed Link
 */
export function parseLinkHeader(value: string) {
	return new LinkHeader(value);
}

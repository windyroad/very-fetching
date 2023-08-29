import {hasWhitespace} from './has-whitespace.js';

/**
 * Increments offset until whitespace has been skipped
 * @param value the string
 * @param offset the position in the string
 * @returns the new offset
 */
export function skipWhitespace(value: string, offset: number) {
	// TODO: this probably could be faster
	while (hasWhitespace(value[offset])) {
		offset++;
	}

	return offset;
}

import {type ExtendedAttribute} from './extended-attribute.js';
import {isCompatibleEncoding} from './is-compatible-encoding.js';

/**
 * Parses an extended value and attempts to decode it
 * @param value the value to parse
 * @returns the extended value
 */
export function parseExtendedValue(value: string): ExtendedAttribute {
	const parts = /([^']+)?(?:'([^']*)')?(.+)/.exec(value);
	if (parts) {
		return {
			language: parts[2].toLowerCase(),
			encoding: isCompatibleEncoding(parts[1])
				? undefined
				: parts[1].toLowerCase(),
			value: isCompatibleEncoding(parts[1])
				? decodeURIComponent(parts[3])
				: parts[3],
		};
	}

	throw new Error('parts is unexpectedly null');
}

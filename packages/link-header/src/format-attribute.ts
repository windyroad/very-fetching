import {escapeQuotes} from './escape-quotes.js';
import {type ExtendedAttribute} from './extended-attribute.js';
import {formatExtendedAttribute} from './format-extended-attribute.js';
import {isTokenAttribute} from './is-token-attribute.js';
import {needsQuotes} from './needs-quotes.js';

/**
 * Format a given attribute and it's value
 * @param attribute the attribute
 * @param value the attribute value
 * @returns the encoded attribute
 */
export function formatAttribute(
	attribute: string,
	value: ExtendedAttribute | string | Array<ExtendedAttribute | string>,
): string {
	if (Array.isArray(value)) {
		return value
			.map((item) => {
				return formatAttribute(attribute, item);
			})
			.join('; ');
	}

	if (attribute.endsWith('*')) {
		return formatExtendedAttribute(attribute, value);
	}

	if (typeof value === 'object') {
		throw new TypeError('unexpected extended attribute');
	}

	if (isTokenAttribute(attribute)) {
		value = needsQuotes(value)
			? '"' + escapeQuotes(value) + '"'
			: escapeQuotes(value);
	} else if (needsQuotes(value)) {
		let encodedValue = encodeURIComponent(value);
		// We don't need to escape <SP> <,> <;> within quotes
		encodedValue = encodedValue
			.replaceAll('%20', ' ')
			.replaceAll('%2C', ',')
			.replaceAll('%3B', ';');

		value = `"${encodedValue}"`;
	}

	return attribute + '=' + value;
}

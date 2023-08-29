import {type ExtendedAttribute} from './extended-attribute.js';

/**
 * Format a given extended attribute and it's value
 * @param attribute the attribute
 * @param data the attribute value
 * @param data.language the language
 * @param data.encoding the encoding
 * @param data.value the value
 * @returns the encoded attribute
 */
export function formatExtendedAttribute(
	attribute: string,
	data: ExtendedAttribute | string,
) {
	// eslint-disable-next-line unicorn/text-encoding-identifier-case
	const defaultEncoding = 'UTF-8';
	const defaultLanguage = 'en';
	if (typeof data === 'string') {
		return (
			attribute +
			'=' +
			defaultEncoding +
			"'" +
			defaultLanguage +
			"'" +
			encodeURIComponent(data)
		);
	}

	const encoding = (data.encoding ?? defaultEncoding).toUpperCase();
	const language = data.language ?? defaultLanguage;

	let encodedValue = '';

	// If (Buffer.isBuffer(data.value) && isCompatibleEncoding(encoding)) {
	// 	encodedValue = data.value.toString(encoding);
	// } else if (Buffer.isBuffer(data.value)) {
	// 	encodedValue = data.value.toString('hex').replace(/[\da-f]{2}/gi, '%$1');
	// } else {
	encodedValue = encodeURIComponent(data.value);
	// }
	return attribute + '=' + encoding + "'" + language + "'" + encodedValue;
}

/**
 * An RFC8288 Link object, which represents a hyperlink from one resource to another.
 * @typedef {object} Link
 * @property {string} uri - The URI of the resource that the link refers to. See {@link https://tools.ietf.org/html/rfc8288#section-2.1|RFC8288 Section 2.1}.
 * @property {string} rel - The relationship between the resource and the link. See {@link https://tools.ietf.org/html/rfc8288#section-3.3|RFC8288 Section 3.3}.
 * @property {string=} anchor - The anchor for the link. See {@link https://tools.ietf.org/html/rfc8288#section-3.4|RFC8288 Section 3.4}.
 * @property {string=} rev - The reverse relationship between the resource and the link. See {@link https://tools.ietf.org/html/rfc8288#section-3.5|RFC8288 Section 3.5}.
 * @property {string=} hreflang - The language of the resource that the link refers to. See {@link https://tools.ietf.org/html/rfc8288#section-3.2|RFC8288 Section 3.2}.
 * @property {string=} type - The media type of the resource that the link refers to. See {@link https://tools.ietf.org/html/rfc8288#section-3.1|RFC8288 Section 3.1}.
 * @property {string=} media - The intended destination medium or media for style information. See {@link https://www.w3.org/TR/html52/document-metadata.html#attr-link-media|W3C HTML5 Section 4.2.4}.
 * @property {string=} title - The title of the resource that the link refers to. See {@link https://tools.ietf.org/html/rfc8288#section-3.6|RFC8288 Section 3.6}.
 * @property {string=} method - The HTTP method to use when accessing the resource that the link refers to. See {@link https://tools.ietf.org/html/rfc8288#section-3.8|RFC8288 Section 3.8}.
 */

export type Link = {
	[attribute: string]: string | undefined;
	uri: string;
	rel: string;
	anchor?: string;
	rev?: string;
	hreflang?: string;
	media?: string;
	title?: string;
	type?: string;
	method?: string;
};

/**
 * Determines whether the given input is a Link object.
 * @param input - The input to check.
 * @returns True if the input is a Link object, false otherwise.
 */
export function isLink(input: any): input is Link {
	return (
		typeof input === 'object' && ['uri', 'rel'].every((prop) => prop in input)
	);
}

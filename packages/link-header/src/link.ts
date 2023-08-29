import {type ExtendedAttribute} from './extended-attribute.js';

type Exclude<T, U> = T extends U ? never : T;

/**
 * An RFC8288 Link object, which represents a hyperlink from one resource to another.
 */
export type Link = {
	[attribute: string]:
		| ExtendedAttribute
		| string
		| Array<ExtendedAttribute | string>
		| undefined;
	[attribute: `${string}*`]:
		| ExtendedAttribute
		| ExtendedAttribute[]
		| undefined;
	/** The URI of the resource that the link refers to. See {@link https://tools.ietf.org/html/rfc8288#section-2.1|RFC8288 Section 2.1}. */
	uri: string;
	/** The relationship between the resource and the link. See {@link https://tools.ietf.org/html/rfc8288#section-3.3|RFC8288 Section 3.3}. */
	rel: string; // Todo: support multiple relationships| string[];
	/** The anchor for the link. See {@link https://tools.ietf.org/html/rfc8288#section-3.4|RFC8288 Section 3.4}. */
	anchor?: string;
	/** The reverse relationship between the resource and the link. This property is @deprecated and should be avoided. See {@link https://tools.ietf.org/html/rfc8288#section-3.5|RFC8288 Section 3.5}. */
	rev?: string;
	/** The language of the resource that the link refers to. See {@link https://tools.ietf.org/html/rfc8288#section-3.2|RFC8288 Section 3.2}. */
	hreflang?: string | string[];
	/** @property {string=} type - The media type of the resource that the link refers to. See {@link https://tools.ietf.org/html/rfc8288#section-3.1|RFC8288 Section 3.1}. */
	media?: string;
	/** @property {string=} media - The intended destination medium or media for style information. See {@link https://www.w3.org/TR/html52/document-metadata.html#attr-link-media|W3C HTML5 Section 4.2.4}. */
	title?: string;
	/** @property {string=} title - The title of the resource that the link refers to. See {@link https://tools.ietf.org/html/rfc8288#section-3.6|RFC8288 Section 3.6}. */
	'title*'?: ExtendedAttribute | ExtendedAttribute[];
	/** @property {string=} title - The title of the resource that the link refers to. See {@link https://tools.ietf.org/html/rfc8288#section-3.6|RFC8288 Section 3.6}. */
	type?: string;
	/** @property {string=} method - The HTTP method to use when accessing the resource that the link refers to. See {@link https://tools.ietf.org/html/rfc8288#section-3.8|RFC8288 Section 3.8}. */
	method?: string;
};

/**
 * Determines whether the given input is a Link object.
 * @param input - The input to check.
 * @returns True if the input is a Link object, false otherwise.
 */
export function isLink(input: any): input is Link {
	return (
		typeof input === 'object' &&
		['uri', 'rel'].every((property) => property in input)
	);
}

export type PartialLink = Omit<Link, 'uri' | 'rel'> & {
	uri: string;
	rel?: string;
};

import {type Link} from './link.js';

/**
 * A type that extends the `FetchReturns` type with a `links` method that returns an array of RFC8288 Link objects.
 * @template FetchReturns The return type of the `fetch` implementation.
 */

export type LinkedResponse<FetchReturns extends Pick<Response, 'headers'>> =
	FetchReturns & {
		/**
		 * Returns an array of RFC8288 Link objects from the response headers.
		 * @param filter Optional filter to apply to the links.
		 * @returns An array of RFC8288 Link objects.
		 */
		links: (filter?: Partial<Link> | string) => Link[];
	};

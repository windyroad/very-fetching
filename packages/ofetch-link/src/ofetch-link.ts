import {
	type ofetch,
	createFetch,
	type FetchOptions,
	type FetchRequest,
	type FetchResponse,
} from 'ofetch';
import {
	type FragmentLink,
	fetchLink,
	glowUpFetchWithLinks,
	type LinkedResponse,
} from '@windyroad/fetch-link';
import {type Link} from '@windyroad/link-header';
import {type FragmentResponse} from '@windyroad/fetch-fragment';
import {glowUpOfetchWithLinks} from './glow-up-ofetch-with-links.js';
import {
	type FragmentOfetchResponse,
	type MappedType,
	type ResponseType,
} from './fragment-ofetch-response.js';

/**
 * An enhanced fetch that allows requests to [RFC8288](https://datatracker.ietf.org/doc/html/rfc8288) Link objects and
 * returns a Response object with a `links` method that returns an array of RFC8288 Link objects.
 * @param target The Link, URL or RequestInfo to fetch from.
 * @param init Any custom settings that you want to apply to the request.
 * @returns A Promise that resolves to the Response object representing the response to the request.
 */
export const ofetchLinkRaw: <T2 = unknown, R2 extends ResponseType = 'json'>(
	arguments__0: RequestInfo | Link | FragmentLink,
	options?: FetchOptions<ResponseType> | undefined,
) => Promise<
	LinkedResponse<
		FetchResponse<MappedType<R2, T2>> | FragmentOfetchResponse<T2, R2>
	>
> = glowUpOfetchWithLinks({
	fetchConstructor: () => createFetch().raw,
});

/**
 * Creates a new ofetch instance
 * @param defaultOptions options for the created ofetch instance
 * @returns the new instance
 */
export const createFetchLink = function (
	defaultOptions: Parameters<typeof createFetch>[0] = {},
) {
	const created = createFetch(defaultOptions);
	const raw = ofetchLinkRaw;
	const nativeFunction = glowUpFetchWithLinks(created.native);
	const create = async (
		defaultOptions: Parameters<typeof createFetch>[0] = {},
	) => createFetchLink(defaultOptions);
	const rval = async function <T = unknown, R extends ResponseType = 'json'>(
		request: FetchRequest | Link | FragmentLink,
		options?: FetchOptions<R>,
	) {
		const r = await raw<T, R>(request, options);

		return r._data as T;
	};

	rval.raw = raw;
	rval.native = nativeFunction;
	rval.create = create;
	return rval;
};

export const ofetchLink = createFetchLink({});

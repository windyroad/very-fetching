import {addFragmentSupportToFetch} from './add-fragment-support-to-fetch';

/**
 * An enhanced fetch that allows fetching JSON fragments
 * @param target The Link, URL or RequestInfo to fetch from.
 * @param init Any custom settings that you want to apply to the request.
 * @returns A Promise that resolves to the Response object representing the response to the request.
 */
export const fetchFragment = addFragmentSupportToFetch();

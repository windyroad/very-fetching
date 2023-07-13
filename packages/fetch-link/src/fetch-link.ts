import {glowUpFetchWithLinks} from './glow-up-fetch-with-links.js';

/**
 * An enhanced fetch that allows requests to RFC8288 Link objects.
 * @param target The Link, URL or RequestInfo to fetch from.
 * @param init Any custom settings that you want to apply to the request.
 * @returns A Promise that resolves to the Response object representing the response to the request.
 */
export const fetchLink = glowUpFetchWithLinks(fetch);
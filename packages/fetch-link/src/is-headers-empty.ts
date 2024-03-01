/**
 * Checks if a Headers object is empty.
 * @param headers The Headers object to check.
 * @returns True if the Headers object is empty, false otherwise.
 */
export function isHeadersEmpty(headers: Headers): boolean {
	let isEmpty = true;
	// eslint-disable-next-line no-unreachable-loop
	for (const _header of headers) {
		isEmpty = false;
		break;
	}

	return isEmpty;
}

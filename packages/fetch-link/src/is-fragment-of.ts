/**
 * Checks if URL A points to a fragment within URL B.
 * @param urlToCheck The first URL to check.
 * @param urlToCompare The second URL to check.
 * @returns True if URL A points to a fragment within URL B, false otherwise.
 */
export function isFragmentOf(urlToCheck: URL, urlToCompare: URL): boolean {
	if (urlToCheck.hash.length === 0) {
		return false;
	}

	const urlToCheckWithoutHash = new URL(urlToCheck.href);
	urlToCheckWithoutHash.hash = '';
	const urlToCompareWithoutHash = new URL(urlToCompare.href);
	urlToCompareWithoutHash.hash = '';
	if (urlToCheckWithoutHash.href !== urlToCompareWithoutHash.href) {
		return false;
	}

	if (urlToCompare.hash.length === 0) {
		return true;
	}

	if (urlToCheck.hash.startsWith(urlToCompare.hash)) {
		return true;
	}

	return false;
}

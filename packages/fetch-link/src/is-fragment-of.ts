import {getUrlFragment} from '@windyroad/fetch-fragment';

/**
 * Checks if URL A points to a fragment within URL B.
 * @param options The options object.
 * @param options.urlToCheck The first URL to check.
 * @param options.urlToCheckHash The first URL to check's hash.
 * @param options.urlToCompare The second URL to check.
 * @returns True if URL A points to a fragment within URL B, false otherwise.
 */
export function isFragmentOf({
	urlToCheck,
	urlToCompare,
}: {
	urlToCheck: string;
	urlToCompare: string;
}): boolean {
	const urlToCheckHash = getUrlFragment(urlToCheck);
	if (urlToCheckHash === undefined || urlToCheckHash.length === 0) {
		return false;
	}

	if (urlToCheck.startsWith('#')) {
		return true;
	}

	const urlToCheckHashIndex = urlToCheck.indexOf('#');
	const urlToCheckWithoutHash = urlToCheck.slice(0, urlToCheckHashIndex);
	const urlToCompareHashIndex = urlToCompare.indexOf('#');
	const urlToCompareWithoutHash =
		urlToCompareHashIndex >= 0
			? urlToCompare.slice(0, urlToCompareHashIndex)
			: urlToCompare;
	if (urlToCheckWithoutHash !== urlToCompareWithoutHash) {
		return false;
	}

	const urlToCompareHash = getUrlFragment(urlToCompare);
	if (!urlToCompareHash || urlToCompareHash.length === 0) {
		return true;
	}

	if (urlToCheckHash.startsWith(urlToCompareHash)) {
		return true;
	}

	return false;
}

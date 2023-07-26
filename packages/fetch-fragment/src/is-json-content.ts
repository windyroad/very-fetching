/**
 * Checks if a response is JSON based on the `Content-Type` header.
 * @param response - The response object to check.
 * @returns `true` if the response is JSON, `false` otherwise.
 */
export function isJsonContent(response: Pick<Response, 'headers'>): boolean {
	const contentType = response.headers.get('Content-Type')?.split(';')[0];
	return (
		contentType !== undefined &&
		(contentType === 'application/json' || contentType.endsWith('+json'))
	);
}

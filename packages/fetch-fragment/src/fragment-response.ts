import {type AwaitedFetchReturns} from '@windyroad/wrap-fetch';

/**
 * A custom `Response` class that represents a fragment of a JSON response.
 * @augments Response
 */
export class FragmentResponse<ResponseType extends Response> extends Response {
	/**
	 * The URL of the response.
	 * @type {string}
	 */
	url: string;

	/**
	 * The JSON body of the response.
	 * @type {any}
	 */
	jsonBody: any;

	/**
	 * The response that this fragment was generated from.
	 */
	parent: ResponseType | undefined;

	/**
	 * Creates a new `FragmentResponse` instance.
	 * @param {any} [jsonBody] - The JSON body of the response.
	 * @param {ResponseInit & {url: string}} [init] - The `ResponseInit` options for the response, including the URL.
	 * @param parent The response that this fragment was generated from.
	 */
	constructor(
		jsonBody?: any,
		init?: ResponseInit & {url: string},
		parent?: ResponseType,
	) {
		super(null, init);
		this.url = init?.url ?? '';
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this.jsonBody = jsonBody;
		this.parent = parent;
	}

	/**
	 * Returns a promise that resolves to the JSON body of the response.
	 * @returns {Promise<any>} - A promise that resolves to the JSON body of the response.
	 */
	async json(): Promise<any> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this.jsonBody;
	}

	/**
	 * Returns a promise that resolves to a stringified version of the JSON body of the response.
	 * @returns {Promise<string>} - A promise that resolves to a stringified version of the JSON body of the response.
	 */
	async text(): Promise<string> {
		return JSON.stringify(this.jsonBody);
	}

	/**
	 * Returns a `ReadableStream` of the JSON body of the response.
	 * @returns {ReadableStream<Uint8Array> | null} - A `ReadableStream` of the JSON body of the response, or `null` if the JSON body is undefined.
	 */
	// eslint-disable-next-line @typescript-eslint/ban-types
	get body(): ReadableStream<Uint8Array> | null {
		if (this.jsonBody === undefined) return null;
		const encoder = new TextEncoder();
		const uint8Array = encoder.encode(JSON.stringify(this.jsonBody));
		return new ReadableStream({
			start(controller) {
				controller.enqueue(uint8Array);
				controller.close();
			},
		});
	}
}

import {type AwaitedFetchReturns} from '@windyroad/wrap-fetch';
import {type FetchResponse, type ofetch} from 'ofetch';

type ResponseMap = {
	blob: Blob;
	text: string;
	arrayBuffer: ArrayBuffer;
	stream: ReadableStream<Uint8Array>;
};
export type ResponseType = keyof ResponseMap | 'json';
export type MappedType<
	R extends ResponseType,
	JsonType = unknown,
> = R extends keyof ResponseMap ? ResponseMap[R] : JsonType;

/**
 * A custom `Response` class that represents a fragment of a JSON response.
 * @augments Response
 */
export class FragmentOfetchResponse<
		T = unknown,
		R extends ResponseType = 'json',
	>
	extends Response
	implements FetchResponse<MappedType<R, T>>
{
	/**
	 * The URL of the response.
	 */
	url: string;

	/**
	 * The JSON body of the response.
	 */
	jsonBody?: MappedType<R, T>;

	/**
	 * The response that this fragment was generated from.
	 */
	parent: ResponseType | undefined;

	/**
	 * Creates a new `FragmentResponse` instance.
	 * @param {MappedType<R, T>} [jsonBody] - The JSON body of the response.
	 * @param {ResponseInit & {url: string}} [init] - The `ResponseInit` options for the response, including the URL.
	 * @param parent The response that this fragment was generated from.
	 */
	constructor(
		jsonBody?: MappedType<R, T>,
		init?: ResponseInit & {url: string},
		parent?: ResponseType,
	) {
		super(null, init);
		this.url = init?.url ?? '';
		this.jsonBody = jsonBody;
		this.parent = parent;
	}

	get _data(): MappedType<R, T> | undefined {
		return this.jsonBody;
	}

	clone(): Response {
		throw new Error('Method not implemented.');
	}

	async arrayBuffer(): Promise<ArrayBuffer> {
		throw new Error('Method not implemented.');
	}

	async blob(): Promise<Blob> {
		throw new Error('Method not implemented.');
	}

	async formData(): Promise<FormData> {
		throw new Error('Method not implemented.');
	}

	/**
	 * Returns a promise that resolves to the JSON body of the response.
	 * @returns {Promise<T>} - A promise that resolves to the JSON body of the response.
	 */
	async json(): Promise<MappedType<R, T> | undefined> {
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

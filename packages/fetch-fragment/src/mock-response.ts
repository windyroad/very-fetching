export class MockResponse extends Response {
	url: string;

	constructor(
		body?: BodyInit | undefined,
		init?: ResponseInit & {url: string},
	) {
		super(body, init);
		this.url = init?.url ?? '';
	}

	clone() {
		const cloned = super.clone();
		return new MockResponse(cloned.body as ReadableStream, cloned);
	}
}

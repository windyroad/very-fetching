# @windyroad/fetch-link

A library that adapts the fetch API to work with [RFC8288](https://datatracker.ietf.org/doc/html/rfc8288) Link objects.

## Installation

You can install this library using npm:

```bash
npm install @windyroad/fetch-link
```

## Usage

### `fetchLink`

`fetchLink` is an enhanced fetch function that allows requests to RFC8288 Link objects. It
takes in a `Link`, `URL`, or `RequestInfo` object and any custom settings that you want to
apply to the request. It returns a `Promise` that resolves to the `Response` object
representing the response to the request.

```typescript
import { fetchLink } from '@windyroad/fetch-link';

const link = {
  uri: 'https://example.com',
  rel: 'resource',
  type: 'application/json',
  hreflang: 'en-US',
};

fetchLink(link)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### `glowUpFetchWithLinks`

`glowUpFetchWithLinks` is a function that adapts the fetch API to work with RFC8288 Link
objects. It takes in the original `fetch` function and returns an adapted `fetch` function that
supports passing in a `Link` object.

```typescript
import { glowUpFetchWithLinks } from '@windyroad/fetch-link';

const mockFetch = async (...args: Parameters<typeof fetch>) => new Response();
const fetchWithLink = glowUpFetchWithLinks(mockFetch);

const link = {
  uri: 'https://example.com',
  rel: 'resource',
  type: 'application/json',
  hreflang: 'en-US',
};

fetchWithLink(link)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

## API

### `fetchLink(target: Link | URL | RequestInfo, init?: RequestInit): Promise<Response>`

An enhanced fetch function that allows requests to RFC8288 Link objects.

- `target`: The `Link`, `URL`, or `RequestInfo` to fetch from.
- `init`: Any custom settings that you want to apply to the request.

Returns a Promise that resolves to the Response object representing the response to the request.

<!-- markdownlint-disable-next-line MD013 -->
### `glowUpFetchWithLinks<FetchReturns = Awaited<ReturnType<typeof fetch>>>(fetchImpl: (...args: Parameters<typeof fetch>) => Promise<FetchReturns>): (target: Link | Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => Promise<FetchReturns>`

A function that adapts the fetch API to work with RFC8288 Link objects.

- `fetchImpl`: The original fetch function to adapt.

Returns an adapted fetch function that supports passing in a `Link` object.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](../../CONTRIBUTING.md) for more information.

## License

`@windyroad/fetch-link` is lovingly licensed under the [MIT License](../../LICENSE). ❤️

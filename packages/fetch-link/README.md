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

// Fetch the collection using a URL
const collectionResponse = await fetchLink(
  'https://jsonplaceholder.typicode.com/posts',
);
// Fetch the first item linked by the collection
const itemResponse = await fetchLink(collectionResponse.links('item')[0]);
// Fetch the collection from the item
const collectionResponse2 = await fetchLink(itemResponse.links('collection')[0]);
```

## API

### `fetchLink(target: string | Link | RequestInfo, init?: RequestInit): Promise<Response>`

An enhanced fetch that allows requests to [RFC8288](https://datatracker.ietf.org/doc/html/rfc8288) Link objects and
 returns a Response object with a `links` method that returns an array of RFC8288 Link objects.

#### Parameters

- `target` - The Link, URL or RequestInfo to fetch from.
- `init` - Any custom settings that you want to apply to the request.

#### Returns

A Promise that resolves to the Response object representing the response to the request.

### `glowUpFetchWithLinks(): (target: string | Link | RequestInfo, init?: RequestInit) => Promise<Response>`

A function that returns an enhanced fetch function that allows requests to
[RFC8288](https://datatracker.ietf.org/doc/html/rfc8288) Link objects and returns a Response
object with a `links` method that returns an array of RFC8288 Link objects.

#### Returns

A function that can be used as an enhanced fetch function.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](../../CONTRIBUTING.md) for more information.

## License

`@windyroad/fetch-link` is lovingly licensed under the [MIT License](../../LICENSE). ❤️

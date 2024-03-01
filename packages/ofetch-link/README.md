# @windyroad/ofetch-link

We believe that hypermedia APIs, APIs who's responses include links and forms, significantly
reduces to coupling between the client and server, making them easier to evolve.

This library that adapts the [ofetch](https://github.com/unjs/ofetch) library to work with
[RFC8288](https://datatracker.ietf.org/doc/html/rfc8288) Links. It parses `Link` and
`Link-Template` headers, providing them via `links()` method on the `Response`, and
it can use links as request inputs, allowing call chaining.

## Installation

You can install this library using npm:

```bash
npm install @windyroad/ofetch-link
```

## Usage

### `ofetchLink.raw`

`ofetchLink.raw` is an enhanced [ofetch.raw](https://github.com/unjs/ofetch#-access-to-raw-response) function that
allows requests to RFC8288
Link objects. It takes in a `Link`, `URL`, or `RequestInfo` object and any custom settings that you want to
apply to the request. It returns a `Promise` that resolves to the `Response` object
representing the response to the request.

```typescript
import { ofetchLink } from '@windyroad/ofetch-link';

// Fetch the collection using a URL
const collectionResponse = await ofetchLink.raw(
  'https://jsonplaceholder.typicode.com/posts',
);
// Fetch the first item linked by the collection
const itemResponse = await ofetchLink.raw(collectionResponse.links('item')[0]);
// Fetch the collection from the item
const collectionResponse2 = await ofetchLink.raw(itemResponse.links('collection')[0]);
```

## API

### `ofetchLink<T = unknown, ResponseType = 'json'>(target: string | Link | RequestInfo, init?: RequestInit): Promise<T>`

An enhanced [ofetch](https://github.com/unjs/ofetch?tab=readme-ov-file#ofetch) that allows requests to
[RFC8288](https://datatracker.ietf.org/doc/html/rfc8288) Link objects and
returns a Response object with a `links` method that returns an array of RFC8288 Link objects.

#### Parameters

- `target` - The `Link`, `URL` or `RequestInfo` to fetch from.
- `init` - Any custom settings that you want to apply to the request.

#### Returns

A Promise that resolves to the data returned by the request.

### `ofetchLink.raw<T = unknown, ResponseType = 'json'>(target: string | Link | RequestInfo, init?: RequestInit): Promise<FetchResponse<MappedType<R,T>>>`

An enhanced [ofetch.raw](https://github.com/unjs/ofetch#-access-to-raw-response) that allows requests to
[RFC8288](https://datatracker.ietf.org/doc/html/rfc8288) Link objects and
returns a Response object with a `links` method that returns an array of RFC8288 Link objects.

#### Parameters

- `target` - The `Link`, `URL` or `RequestInfo` to fetch from.
- `init` - Any custom settings that you want to apply to the request.

#### Returns

A Promise that resolves to the Response object representing the response to the request.

### `glowUpOfetchWithLinks(): (target: string | Link | RequestInfo, init?: RequestInit) => Promise<Response>`

A function that returns an enhanced
[ofetch.raw](https://github.com/unjs/ofetch?tab=readme-ov-file#-access-to-raw-response) function that allows requests to
[RFC8288](https://datatracker.ietf.org/doc/html/rfc8288) Link objects and returns a Response
object with a `links` method that returns an array of RFC8288 Link objects.

#### Returns

A function that can be used as an enhanced fetch function.

### LinkedResponse

A type that extends the `FetchReturns` type with a `links` method that returns an array of RFC8288 Link objects.

#### Properties

- `links`: Returns an array of RFC8288 Link objects from the response headers.

#### Methods

##### `links(filter?, parameters?)`

Returns an array of RFC8288 Link objects from the response headers.

###### Parameters

- `filter` (optional): A partial Link object or string to filter the links by.
- `parameters` (optional): An object containing key-value pairs to interpolate into the link templates.

###### Returns

An array of RFC8288 Link objects.

### Link

An RFC8288 Link object, which represents a hyperlink from one resource to another.

#### Properties

- `uri` (string): The URI of the resource that the link refers to. See [RFC8288 Section 2.1](https://tools.ietf.org/html/rfc8288#section-2.1).
- `rel` (string): The relationship between the resource and the link. See [RFC8288 Section 3.3](https://tools.ietf.org/html/rfc8288#section-3.3).
- `anchor` (string, optional): The anchor for the link. See [RFC8288 Section 3.4](https://tools.ietf.org/html/rfc8288#section-3.4).
- `rev` (string, optional): The reverse relationship between the resource and the link. This property is @deprecated
  and should be avoided. See [RFC8288 Section 3.5](https://tools.ietf.org/html/rfc8288#section-3.5).
- `hreflang` (string, optional): The language of the resource that the link refers to. See [RFC8288 Section 3.2](https://tools.ietf.org/html/rfc8288#section-3.2).
- `media` (string, optional): The media type of the resource that the link refers to. See [RFC8288 Section 3.1](https://tools.ietf.org/html/rfc8288#section-3.1).
- `title` (string, optional): The title of the resource that the link refers to. See [RFC8288 Section 3.6](https://tools.ietf.org/html/rfc8288#section-3.6).
- `type` (string, optional): The media type of the resource that the link refers to. See [RFC8288 Section 3.1](https://tools.ietf.org/html/rfc8288#section-3.1).
- `method` (string, optional): The HTTP method to use when accessing the resource that the
 link refers to. See [RFC8288 Section 3.8](https://tools.ietf.org/html/rfc8288#section-3.8).

## Contributing

Contributions are welcome! Please read the [contributing guidelines](../../CONTRIBUTING.md) for more information.

## License

`@windyroad/ofetch-link` is lovingly licensed under the [MIT License](../../LICENSE). ❤️

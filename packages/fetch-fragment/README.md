# @windyroad/fetch-fragment

A library that provides a function to fetch a JSON fragment from a response based on a URL fragment identifier.

## Installation

```sh
npm install @windyroad/fetch-fragment
```

## Usage

```typescript
import { fetchFragment } from '@windyroad/fetch-fragment';

const response = await fetchFragment('https://example.com/data.json#/foo/bar');
if (response.ok) {
  const data = await response.json();
  // Use the data...
} else {
  console.error(`Failed to fetch fragment: ${response.status} ${response.statusText}`);
}
```

The `fetchFragment` function takes a URL with a fragment identifier, fetches the
URL, and returns a new response with only the JSON fragment specified by the
fragment identifier. If the response is not JSON the function returns a 415
response. If the the fragment is not found the function returns a 404 response.

The `fetchFragment` function is implemented using the `addFragmentSupportToFetch`
function, which can be used to add fragment support to any `fetch` implementation.
Here is an example:

```typescript
import { addFragmentSupportToFetch } from '@windyroad/fetch-fragment';

const fetchWithFragmentSupport = addFragmentSupportToFetch(fetch);

const response = await fetchWithFragmentSupport('https://example.com/data.json#/foo/bar');
if (response.ok) {
  const data = await response.json();
  // Use the data...
} else {
  console.error(`Failed to fetch fragment: ${response.status} ${response.statusText}`);
}
```

## API

### `fetchFragment(url: string): Promise<Response>`

Fetches a JSON fragment from a response based on a URL fragment identifier.

### `addFragmentSupportToFetch(fetchImpl?: typeof fetch): typeof fetch`

Adds fragment support to a `fetch` implementation and returns a new `fetch` function that supports fragments.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](../../CONTRIBUTING.md) for more information.

## License

`@windyroad/fetch-fragment` is lovingly licensed under the [MIT License](../../LICENSE). ❤️

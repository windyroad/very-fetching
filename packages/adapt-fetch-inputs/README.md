# @windyroad/adapt-fetch-inputs

A library for adapting `fetch` inputs.

## Installation

```sh
npm install adapt-fetch-inputs
```

## Usage

```typescript
import { adaptFetchInputs } from 'adapt-fetch-inputs';

const fetchWithAuth = adaptFetchInputs(fetch, (url, options): Parameters<typeof fetch> => {
  const token = secureStorage.getItem('authToken');
  const headers = options?.headers || {};
  return [url, { ...options, headers: { ...headers, Authorization: `Bearer ${token}` } }];
});

fetchWithAuth('https://example.com', { method: 'GET' });
```

## API

### `adaptFetchInputs(fetch: typeof fetch, adapter: FetchAdapter): typeof fetch`

Adapts a `fetch` function with the given adapter function.

- `fetch`: The original `fetch` function to adapt.
- `adapter`: A function that takes any input and returns the `fetch` inputs as an array.

## Examples

### Adding authentication headers to a `fetch` request

```typescript
import { adaptFetchInputs } from 'adapt-fetch-inputs';

const fetchWithAuth = adaptFetchInputs(fetch, (url, options) => {
  const token = localStorage.getItem('authToken');
  const headers = options?.headers || {};
  return [url, { ...options, headers: { ...headers, Authorization: `Bearer ${token}` } }];
});

fetchWithAuth('https://example.com', { method: 'GET' });
```

### Modifying the request body of a `POST` request

```typescript
import { adaptFetchInputs } from 'adapt-fetch-inputs';

const fetchWithJsonBody = adaptFetchInputs(fetch, (url, options): Parameters<typeof fetch> => {
  const body = options?.body;
  const headers = options?.headers || {};
  return [url, { ...options, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }];
});

fetchWithJsonBody('https://example.com', { method: 'POST', body: { foo: 'bar' } });
```

## Contributing

Contributions are welcome! Please read the [contributing guidelines](../../CONTRIBUTING.md) for more information.

## License

`@windyroad/adapt-fetch-inputs` is lovingly licensed under the [MIT License](../../LICENSE). ❤️

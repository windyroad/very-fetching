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

## API

### `adaptFetchInputs`

```typescript
function adaptFetchInputs<
  FetchImpl extends (...args: any) => Promise<any> = typeof fetch,
  WrapInputs extends any[] = Parameters<FetchImpl>,
>(
  adapter: (
    ...args: WrapInputs
  ) => FetchInputs<FetchImpl> | Promise<FetchInputs<FetchImpl>>,
  fetchImpl?: FetchImpl,
): (...args: WrapInputs) => Promise<FetchReturns<typeof fetchImpl>>
```

Adapts a `fetch` function with the given adapter function.

#### Parameters

- `adapter`: The adapter function to apply to the `fetch` inputs.
- `fetchImpl`: The `fetch` implementation to adapt. Defaults to the global `fetch` function.

#### Type Parameters

- `FetchImpl`: The type of the `fetch` implementation. Defaults to `typeof fetch`.
- `WrapInputs`: The input types of the wrapper function.

#### Returns

The adapted `fetch` function.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](../../CONTRIBUTING.md) for more information.

## License

`@windyroad/adapt-fetch-inputs` is lovingly licensed under the [MIT License](../../LICENSE). ❤️

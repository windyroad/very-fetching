# @windyroad/wrap-fetch

`@windyroad/wrap-fetch` is a small library that provides a simple way to wrap the global
`fetch` function with a custom wrapper function. This can be useful for adding custom headers
to requests, caching responses, logging requests and responses, transforming responses, mocking
responses for testing, adding authentication tokens to requests, handling errors, and more.

## Installation

To install `@windyroad/wrap-fetch`, you can use npm or yarn:

```sh
npm install @windyroad/wrap-fetch
```

## Usage

To use `@windyroad/wrap-fetch`, you can import the `wrapFetch` function and use it to wrap the
global `fetch` function with a custom wrapper function. The wrapper function should take the
`fetch` function and its arguments and return a promise that resolves to the response.

Here's an example of how to use `wrapFetch` to add custom headers to requests:

```typescript
import { wrapFetch } from '@windyroad/wrap-fetch';

const wrapper = (fetchImpl, ...args) => {
  const headers = new Headers(args[1].headers);
  headers.set('Authorization', 'Bearer token');
  args[1].headers = headers;
  return fetchImpl(...args);
};

const wrappedFetch = wrapFetch(wrapper);
/**
 * Or 
 * ```
 * const wrappedFetch = wrapFetch(wrapper, customFetch);
 * ```
 * if you want to wrap a different implementation of fetch.
 **/

const url = 'https://example.com';
const options = { headers: { 'Content-Type': 'application/json' } };

const response = await wrappedFetch(url, options);
```

In this code, we've imported the `wrapFetch` function from `@windyroad/wrap-fetch` and used it
to wrap the global `fetch` function with a function that adds an `Authorization` header to
requests. We've then used the wrapped `fetch` function to make a request to
`https://example.com` with a custom `Content-Type` header.

## Examples

Here's a list of some useful examples of using `@windyroad/wrap-fetch`:

1. **Adding custom headers to requests:** You can use `wrapFetch` to add custom headers to
    requests by wrapping the `fetch` function with a function that adds the headers to the
    request.

```typescript
const wrapper = (fetch, ...args) => {
  const headers = new Headers(args[1].headers);
  headers.set('Authorization', 'Bearer token');
  args[1].headers = headers;
  return fetch(...args);
};

const wrappedFetch = wrapFetch(wrapper);

const url = 'https://example.com';
const options = { headers: { 'Content-Type': 'application/json' } };

const response = await wrappedFetch(url, options);
```

1. **Caching responses:** You can use `wrapFetch` to cache responses by wrapping the `fetch`
   function with a function that checks if the response is already cached and returns the
   cached response if it is.

```typescript
const cache = new Map();
const wrapper = async (fetch, ...args) => {
  const key = JSON.stringify(args);
  if (cache.has(key)) {
    return cache.get(key);
  }
  const response = await fetch(...args);
  cache.set(key, response);
  return response;
};

const wrappedFetch = wrapFetch(wrapper);

const url = 'https://example.com';

const response1 = await wrappedFetch(url);
const response2 = await wrappedFetch(url);
```

1. **Logging requests and responses:** You can use `wrapFetch` to log requests and responses by
    wrapping the `fetch` function with a function that logs the request and response data.

```typescript
const log = console.log.bind(console);
const wrapper = async (fetch, ...args) => {
  log('Request:', args);
  const response = await fetch(...args);
  log('Response:', response);
  return response;
};

const wrappedFetch = wrapFetch(wrapper);

const url = 'https://example.com';

const response = await wrappedFetch(url);
```

1. **Transforming responses:** You can use `wrapFetch` to transform responses by wrapping the
    `fetch` function with a function that transforms the response data before returning it.

```typescript
const wrapper = async (fetch, ...args) => {
  const response = await fetch(...args);
  const data = await response.json();
  return { ...response, data };
};

const wrappedFetch = wrapFetch(wrapper);

const url = 'https://example.com';

const response = await wrappedFetch(url);
```

1. **Mocking responses for testing:** You can use `wrapFetch` to mock responses for testing by
    wrapping the `fetch` function with a function that returns a predefined response instead of
    making a real request.

```typescript
const wrapper = async () => {
  return new Response('{"foo": "bar"}', { status: 200 });
};

const wrappedFetch = wrapFetch(wrapper);

const url = 'https://example.com';

const response = await wrappedFetch(url);
```

1. **Adding authentication tokens to requests:** You can use `wrapFetch` to add authentication
   tokens to requests by wrapping the `fetch` function with a function that adds the token to the request headers.

```typescript
const token = 'secret';
const wrapper = (fetch, ...args) => {
  const headers = new Headers(args[1].headers);
  headers.set('Authorization', `Bearer ${token}`);
  args[1].headers = headers;
  return fetch(...args);
};

const wrappedFetch = wrapFetch(wrapper);

const url = 'https://example.com';

const response = await wrappedFetch(url);
```

1. **Handling errors:** You can use `wrapFetch` to handle errors by wrapping the `fetch`
    function with a function that checks for errors in the response and throws an error if one
   is found.

```typescript
const wrapper = async (fetch, ...args) => {
  const response = await fetch(...args);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error);
  }
  return response;
};

const wrappedFetch = wrapFetch(wrapper);

const url = 'https://example.com';

await expect(wrappedFetch(url)).rejects.toThrow('Not found');
```

1. **Adding query parameters to requests:** You can use `wrapFetch` to add query parameters to
    requests by wrapping the `fetch` function with a function that adds the parameters to the
   request URL.

```typescript
const wrapper = (fetch, ...args) => {
  const url = new URL(args[0]);
  url.searchParams.set('foo', 'bar');
  args[0] = url.toString();
  return fetch(...args);
};

const wrappedFetch = wrapFetch(wrapper);

const url = 'https://example.com';

const response = await wrappedFetch(url);
```

These examples should provide a good starting point for using `@windyroad/wrap-fetch` in your own projects.

## API

### `wrapFetch`

```typescript
function wrapFetch<
  WrapInputs extends any[] = Parameters<typeof fetch>,
  WrapReturns = Awaited<ReturnType<typeof fetch>>,
  FetchImpl extends (...args: any) => Promise<any> = typeof fetch,
>(
  wrapper: (
    fetchImplInner: (
      ...args: FetchInputs<typeof fetchImpl>
    ) => Promise<FetchReturns<typeof fetchImpl>>,
    ...args: WrapInputs
  ) => Promise<WrapReturns>,
  fetchImpl?: FetchImpl,
): (...args: WrapInputs) => Promise<WrapReturns>
```

Wraps a `fetch` implementation with a wrapper function.

#### Parameters

- `wrapper`: The wrapper function to apply to the `fetch` implementation.
- `fetchImpl`: The `fetch` implementation to wrap. Defaults to the global `fetch` function.

#### Type Parameters

- `WrapInputs`: The type of the input arguments for the wrapper function. Defaults to `Parameters<typeof fetch>`.
- `WrapReturns`: The return type of the wrapper function. Defaults to `Awaited<ReturnType<typeof fetch>>`.
- `FetchImpl`: The type of the `fetch` implementation. Defaults to `typeof fetch`.

#### Returns

A wrapped version of the `fetch` implementation.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](../../CONTRIBUTING.md) for more information.

## License

`@windyroad/wrap-fetch` is lovingly licensed under the [MIT License](../../LICENSE). ❤️

# @windyroad/wrap-fetch

`@windyroad/wrap-fetch` is a small library that provides a simple way to wrap the global `fetch` function with a custom wrapper function. This can be useful for adding custom headers to requests, caching responses, logging requests and responses, transforming responses, mocking responses for testing, adding authentication tokens to requests, handling errors, and more.

## Installation

To install `@windyroad/wrap-fetch`, you can use npm or yarn:

```sh
npm install @windyroad/wrap-fetch
```

```sh
yarn add @windyroad/wrap-fetch
```

## Usage

To use `@windyroad/wrap-fetch`, you can import the `wrapFetch` function and use it to wrap the global `fetch` function with a custom wrapper function. The wrapper function should take the `fetch` function and its arguments and return a promise that resolves to the response.

Here's an example of how to use `wrapFetch` to add custom headers to requests:

```typescript
import { wrapFetch } from '@windyroad/wrap-fetch';

const fetchImpl = fetch;
const wrapper = (fetch, ...args) => {
  const headers = new Headers(args[1].headers);
  headers.set('Authorization', 'Bearer token');
  args[1].headers = headers;
  return fetch(...args);
};

const wrappedFetch = wrapFetch(fetchImpl, wrapper);

const url = 'https://example.com';
const options = { headers: { 'Content-Type': 'application/json' } };

const response = await wrappedFetch(url, options);
```

In this code, we've imported the `wrapFetch` function from `@windyroad/wrap-fetch` and used it to wrap the global `fetch` function with a function that adds an `Authorization` header to requests. We've then used the wrapped `fetch` function to make a request to `https://example.com` with a custom `Content-Type` header.

## Examples

Here's a list of some useful examples of using `@windyroad/wrap-fetch`:

1. **Adding custom headers to requests:** You can use `wrapFetch` to add custom headers to requests by wrapping the `fetch` function with a function that adds the headers to the request.

```typescript
const fetchImpl = fetch;
const wrapper = (fetch, ...args) => {
  const headers = new Headers(args[1].headers);
  headers.set('Authorization', 'Bearer token');
  args[1].headers = headers;
  return fetch(...args);
};

const wrappedFetch = wrapFetch(fetchImpl, wrapper);

const url = 'https://example.com';
const options = { headers: { 'Content-Type': 'application/json' } };

const response = await wrappedFetch(url, options);
```

2. **Caching responses:** You can use `wrapFetch` to cache responses by wrapping the `fetch` function with a function that checks if the response is already cached and returns the cached response if it is.

```typescript
const fetchImpl = fetch;
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

const wrappedFetch = wrapFetch(fetchImpl, wrapper);

const url = 'https://example.com';

const response1 = await wrappedFetch(url);
const response2 = await wrappedFetch(url);
```

3. **Logging requests and responses:** You can use `wrapFetch` to log requests and responses by wrapping the `fetch` function with a function that logs the request and response data.

```typescript
const fetchImpl = fetch;
const log = console.log.bind(console);
const wrapper = async (fetch, ...args) => {
  log('Request:', args);
  const response = await fetch(...args);
  log('Response:', response);
  return response;
};

const wrappedFetch = wrapFetch(fetchImpl, wrapper);

const url = 'https://example.com';

const response = await wrappedFetch(url);
```

4. **Transforming responses:** You can use `wrapFetch` to transform responses by wrapping the `fetch` function with a function that transforms the response data before returning it.

```typescript
const fetchImpl = fetch;
const wrapper = async (fetch, ...args) => {
  const response = await fetch(...args);
  const data = await response.json();
  return { ...response, data };
};

const wrappedFetch = wrapFetch(fetchImpl, wrapper);

const url = 'https://example.com';

const response = await wrappedFetch(url);
```

5. **Mocking responses for testing:** You can use `wrapFetch` to mock responses for testing by wrapping the `fetch` function with a function that returns a predefined response instead of making a real request.

```typescript
const fetchImpl = fetch;
const wrapper = async () => {
  return new Response('{"foo": "bar"}', { status: 200 });
};

const wrappedFetch = wrapFetch(fetchImpl, wrapper);

const url = 'https://example.com';

const response = await wrappedFetch(url);
```

6. **Adding authentication tokens to requests:** You can use `wrapFetch` to add authentication tokens to requests by wrapping the `fetch` function with a function that adds the token to the request headers.

```typescript
const fetchImpl = fetch;
const token = 'secret';
const wrapper = (fetch, ...args) => {
  const headers = new Headers(args[1].headers);
  headers.set('Authorization', `Bearer ${token}`);
  args[1].headers = headers;
  return fetch(...args);
};

const wrappedFetch = wrapFetch(fetchImpl, wrapper);

const url = 'https://example.com';

const response = await wrappedFetch(url);
```

7. **Handling errors:** You can use `wrapFetch` to handle errors by wrapping the `fetch` function with a function that checks for errors in the response and throws an error if one is found.

```typescript
const fetchImpl = fetch;
const wrapper = async (fetch, ...args) => {
  const response = await fetch(...args);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error);
  }
  return response;
};

const wrappedFetch = wrapFetch(fetchImpl, wrapper);

const url = 'https://example.com';

await expect(wrappedFetch(url)).rejects.toThrow('Not found');
```

8. **Adding query parameters to requests:** You can use `wrapFetch` to add query parameters to requests by wrapping the `fetch` function with a function that adds the parameters to the request URL.

```typescript
const fetchImpl = fetch;
const wrapper = (fetch, ...args) => {
  const url = new URL(args[0]);
  url.searchParams.set('foo', 'bar');
  args[0] = url.toString();
  return fetch(...args);
};

const wrappedFetch = wrapFetch(fetchImpl, wrapper);

const url = 'https://example.com';

const response = await wrappedFetch(url);
```

These examples should provide a good starting point for using `@windyroad/wrap-fetch` in your own projects.

## API

### `wrapFetch(fetchImpl: typeof fetch, wrapper: WrapperFunction): typeof fetch`

Wraps the global `fetch` function with a custom wrapper function.

- `fetchImpl`: The global `fetch` function to wrap.
- `wrapper`: The wrapper function to use.

Returns a wrapped `fetch` function.

### `WrapperFunction(fetch: typeof fetch, ...args: any[]): Promise<Response>`

The type of the wrapper function used by `wrapFetch`.

- `fetch`: The global `fetch` function.
- `args`: The arguments passed to the `fetch` function.

Returns a promise that resolves to the response.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](../../CONTRIBUTING.md) for more information.

## License

`@windyroad/wrap-fetch` is lovingly licensed under the [MIT License](../../LICENSE). ❤️

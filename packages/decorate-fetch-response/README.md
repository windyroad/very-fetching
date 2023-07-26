# @windyroad/decorate-fetch-response

This package provides a function for decorating the response of a `fetch` request with
additional properties. It uses the `wrapFetch` function from the `@windyroad/wrap-fetch`
package to wrap the `fetch` implementation with a decorator function.

## Installation

To use this package in your project, you can install it via npm:

```sh
npm install --save @windyroad/decorate-fetch-response
```

## Usage

To use this package in your project, you can import the `decorateFetchResponse` function and
use it to decorate the response of a `fetch` request:

```typescript
import decorateFetchResponse from '@windyroad/decorate-fetch-response';

const fetchWithCustomHeader = decorateFetchResponse((response) => {
  return response.headers.set('X-Custom-Header', 'custom-value');
});

fetchWithCustomHeader('https://example.com').then((response) => {
  console.log(response.headers.get('X-Custom-Header')); // 'custom-value'
});
```

In this example, the `decorateFetchResponse` function is used to add a custom header to the
response of a `fetch` request. The `fetchWithCustomHeader` function is a decorated version of
the `fetch` implementation that adds the `X-Custom-Header` header to the response.

## Examples

Here are a few examples of how you can use the `decorateFetchResponse` function:

### Adding custom headers to the response

```typescript
import decorateFetchResponse from '@windyroad/decorate-fetch-response';

const fetchWithCustomHeader = decorateFetchResponse((response) => {
  return response.headers.set('X-Custom-Header', 'custom-value');
});

fetchWithCustomHeader('https://example.com').then((response) => {
  console.log(response.headers.get('X-Custom-Header')); // 'custom-value'
});
```

### Modifying the response body

```typescript
import decorateFetchResponse from '@windyroad/decorate-fetch-response';

const fetchWithCustomBody = decorateFetchResponse(async (response) => {
  const body = await response.text();
  return new Response('custom-body', {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
});

fetchWithCustomBody('https://example.com').then((response) => {
  response.text().then((body) => {
    console.log(body); // 'custom-body'
  });
});
```

### Handling errors

```typescript
import decorateFetchResponse from '@windyroad/decorate-fetch-response';

const fetchWithCustomError = decorateFetchResponse(async (response) => {
  if (response.status === 404) {
    return new Response('custom-error', {
      status: 404,
      statusText: 'Not Found',
    });
  }
  return response;
});

fetchWithCustomError('https://example.com/not-found').then((response) => {
  response.text().then((body) => {
    console.log(response.status); // 404
    console.log(body); // 'custom-error'
  });
});
```

## API

### `decorateFetchResponse(decorator, fetchImpl?)`

```typescript
function decorateFetchResponse<
  DecoratorReturns = Awaited<ReturnType<typeof fetch>>,
  FetchImpl extends (...args: any) => Promise<any> = typeof fetch,
>(
  decorator: (
    response: FetchReturns<FetchImpl>,
  ) => Promise<DecoratorReturns> | DecoratorReturns,
  fetchImpl?: FetchImpl,
): (...args: FetchParameters<FetchImpl>) => Promise<DecoratorReturns>
```

Decorates the response of a `fetch` request with additional properties.

### Parameters

- `decorator`: The decorator function to apply to the response.
- `fetchImpl`: The `fetch` implementation to use. Defaults to the global `fetch` function.

### Type Parameters

- `DecoratorReturns`: The return type of the decorator function. Defaults to `Awaited<ReturnType<typeof fetch>>`.
- `FetchImpl`: The type of the `fetch` implementation. Defaults to `typeof fetch`.

### Returns

A decorated version of the `fetch` implementation.

### `decorateFetchResponseUsingInputs(decorator, fetchImpl?)`

Decorates the response of a fetch request with additional properties.

#### Type parameters

- `FetchImpl`: The type of the `fetch` implementation.
- `DecoratorReturns`: The return type of the decorator function.

#### Parameters

- `decorator`: The decorator function to apply to the response.
  - Type: `(response: AwaitedFetchReturns<FetchImpl>, ...arguments_: FetchInputs<FetchImpl>)
   => Promise<DecoratorReturns> | DecoratorReturns`
  - The `response` parameter is the response object returned by the `fetch` function.
  - The `arguments_` parameter is an array of arguments passed to the `fetch` function.
  - The function should return a new response object or a promise that resolves to a new response object.
- `fetchImpl` (optional): The `fetch` implementation to use.
  - Type: `FetchImpl`
  - Default: `fetch`

#### Returns

A decorated version of the `fetch` implementation.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](../../CONTRIBUTING.md) for more information.

## License

`@windyroad/decorate-fetch-response` is lovingly licensed under the [MIT License](../../LICENSE). ❤️

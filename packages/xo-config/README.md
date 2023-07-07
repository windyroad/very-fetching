# @windyroad/decorate-fetch-response

A small library that provides a function to decorate the response of a fetch request.

## Installation

You can install this library via npm:

```bash
npm install @windyroad/decorate-fetch-response
```

## Usage

The library exports a single function, `decorateFetchResponse`, which takes two arguments:

1. `fetchImpl`: A function that implements the `fetch` API. This can be the built-in `fetch` function, a custom implementation or an already decorated implementation.
2. `decorator`: A function that takes a `Response` object and returns an object that extends it.

Here's an example of how to use the library:

```typescript
import decorateFetchResponse from '@windyroad/decorate-fetch-response';

const decorator = async (response: Response) => {
  return {
    status: response.status,
    headers: response.headers,
    body: await response.text(),
  };
};

const decoratedFetch = decorateFetchResponse(fetch, decorator);

const response = await decoratedFetch('https://example.com');
console.log(response);
```

In this example, the `decorator` function extends the `Response` object with additional properties (`headers` and `body`). The `decoratedFetch` function can then be used to make a fetch request and return the decorated response.

## API

### `decorateFetchResponse(fetchImpl, decorator)`

A function that takes two arguments:

1. `fetchImpl`: A function that implements the `fetch` API. This can be the built-in `fetch` function or a custom implementation.
2. `decorator`: A function that takes a `Response` object and returns an object that extends it.

Returns a new function that implements the `fetch` API and returns a decorated response.

### `ExtendedResponse<P, T extends Response = Response>`

A type that extends the `Response` object with additional properties.

### `EnhancedFetch<T extends Response = Response>`

A type that defines a function that implements the `fetch` API.

## Contributing

Contributions are welcome! Please open an issue or pull request on GitHub.

## License

This library is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


# @windyroad/very-fetching

We believe that hypermedia APIs, APIs who's responses include links and forms, significantly
reduces to coupling between the client and server, making them easier to evolve.

The [`packages/fetch-link`](./packages/fetch-link/README.md) library, and the libraries its
built on, adapts the fetch API to work with
[RFC8288](https://datatracker.ietf.org/doc/html/rfc8288) Links. It parses `Link` and
`Link-Template` headers, providing them via `links()` method on the `Response`, and
it can use links and request inputs, allowing call chaining.

## Packages

- [`@windyroad/adapt-fetch-input`](./packages/adapt-fetch-inputs/README.md) A library
   for adapting fetch inputs
- [`@windyroad/decorate-fetch-response`](./packages/decorate-fetch-response/README.md): A library for decorating fetch responses.
- [`@windyroad/fetch-fragment`](./packages/fetch-fragment/README.md): A fetch library that can retrieve json fragments
- [`@windyroad/fetch-link`](./packages/fetch-link/README.md): A library that adapts the fetch
  API to work with [RFC8288](https://datatracker.ietf.org/doc/html/rfc8288) Link objects.
- [`@windyroad/link-header`](./packages/link-header/README.md): Parse & format HTTP link headers according to
  [RFC8288](https://datatracker.ietf.org/doc/html/rfc8288)
- [`@windyroad/wrap-fetch`](./packages/wrap-fetch/README.md): A library for wrapping fetch, so
   requests and responses can be modified.
- [`@windyroad/eslint-config`](./packages/eslint-config/README.md): XO config for the Windy Road style
   guide.

<p align="center">
  <img width="480" height="270" src="https://media0.giphy.com/media/xlYKItjhiDsY/giphy.webp?cid=dda24d50bdf2tch82tmqm5a3qrgbl9e0yo4q4gf1qvc6gjvj&amp;ep=v1_gifs_gifId&amp;rid=giphy.webp&amp;ct=g">
</p>

## Contributing

Contributions are welcome! Please see our [contributing guidelines](CONTRIBUTING.md)
for more information.

## License

Very Fetching is lovingly licensed under the [MIT License](LICENSE). ❤️

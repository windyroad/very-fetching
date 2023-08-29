# @windyroad/link-header

Parse & format HTTP link headers according to [RFC 8288], based on the awesome [HTTP Link Header library].

A huge shout-out goes to the team behind the [HTTP Link Header library]. The comprehensive implementation and set
of tests, made porting it to Typescript a breeze.

[RFC 8288]: https://tools.ietf.org/html/rfc8288
[HTTP Link Header library]: https://github.com/jhermsmeier/node-http-link-header

## Why?

I needed something that worked in the browser and the [HTTP Link Header library]'s support for node.js Buffer's prevent that.

## Installation

You can install `@windyroad/link-header` using `npm`:

```sh
npm install @windyroad/link-header
```

## Usage

### Parsing a Link Header

To parse a link header string, you can use the `parseLinkHeader` function:

```typescript
import { parseLinkHeader } from '@windyroad/link-header';

const linkHeader = '<https://api.example.com/users?page=2>; rel="next", <https://api.example.com/users?page=5>; rel="last"';
const links = parse(linkHeader);

console.log(links);
```

This will output:

```js
[
  {
    uri: 'https://api.example.com/users?page=2',
    rel: 'next'
  },
  {
    uri: 'https://api.example.com/users?page=5',
    rel: 'last'
  }
]
```

this is equivalent to

```typescript
import { LinkHeader } from '@windyroad/link-header';

const linkHeader = '<https://api.example.com/users?page=2>; rel="next", <https://api.example.com/users?page=5>; rel="last"';
const links = new LinkHeader(linkHeader);

console.log(links);
```

### Manipulating a Link Header

To manipulate a link header, you can use the `LinkHeader` class:

```typescript
import { LinkHeader } from '@windyroad/link-header';

const linkHeaderString = '<https://api.example.com/users?page=2>; rel="next", <https://api.example.com/users?page=5>; rel="last"';
const linkHeader = LinkHeader.parse(linkHeaderString);

// Find the link with rel="next" and change its URI.
const nextLink = linkHeader.rel('next');
nextLink.uri = 'https://api.example.com/users?page=3';

// Add a new link with rel="prev".
linkHeader.set({ uri: 'https://api.example.com/users?page=1', rel: 'prev' }));

const newLinkHeaderString = linkHeader.toString();

console.log(newLinkHeaderString);
```

This will output:

```string
<https://api.example.com/users?page=3>; rel="next", <https://api.example.com/users?page=1>; rel="prev"
```

## API

### `parse(linkHeader: string): LinkHeader`

Parses a link header string into an array of LinkHeader object.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](../../CONTRIBUTING.md) for more information.

## License

`@windyroad/link-header` is lovingly licensed under the [MIT License](LICENSE.md). ❤️

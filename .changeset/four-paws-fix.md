---
"@windyroad/fetch-link": minor
---

Added support for automatically expanding templated fragments links. For instance if a response has
a body

```json
{
    "foo": [1,2,3],
    "bar": ["a","b"]
}
```

and a `link` `<#/{key}/{index}>; rel="item"`, then the `links()` response method will return the following links.

- `#/foo/0`
- `#/foo/1`
- `#/foo/2`
- `#/bar/0`
- `#/bar/1`

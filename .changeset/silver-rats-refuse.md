---
"@windyroad/fetch-link": minor
---

Links for JSON responses that have a fragment identifier now include the matched fragment.
For collections, this provides an easy and fast way to iterate over the items on the
collection. While it is possible to call `fetchLink` for each fragment link, that is much
slower due to network overheads and the serialisation of the json into a `Response`.

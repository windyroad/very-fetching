---
"@windyroad/decorate-fetch-response": major
"@windyroad/adapt-fetch-inputs": major
"@windyroad/fetch-fragment": major
"@windyroad/fetch-link": major
"@windyroad/wrap-fetch": major
---

BREAKING CHANGE: We have had to modify the the template parameters for `wrapFetch`,
`decorateFetchResponse`, `adaptFetchInputs`, `addFragmentSupportToFetch`, `fetchFragment`
and `fetchLink`, replacing the `FetchImpl` parameter with and `Arguments` and `ResponseType`
parameter. Originally the intention was to try and leverage Typescript's
type inference and have it figure out the types based on the passed in fetch implementation,
but we couldn't figure out how to make it work properly and we were getting lots of type
errors. Replacing the `FetchImpl` parameter with the `Arguments` and `ResponseType` parameters solve those errors.

`fetchLink` will now check if the link has a `fragment` and use that to return a fragment
response instead of fetching the resource and getting the fragment from it. For iterating
over items in a collection, this is orders of magnitude faster.

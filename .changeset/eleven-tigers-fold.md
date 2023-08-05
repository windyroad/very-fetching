---
"@windyroad/decorate-fetch-response": major
"@windyroad/adapt-fetch-inputs": major
"@windyroad/fetch-fragment": major
"@windyroad/fetch-link": major
"@windyroad/wrap-fetch": major
---

BREAKING CHANGE: We have had to modify the the template parameters for `wrapFetch`,
`decorateFetchResponse`, `adaptFetchInputs`, `addFragmentSupportToFetch` and the `fetchLink`,
adding `Arguments` parameter. Originally the intention was to try and leverage Typescript's
type inference and have it figure out the types based on the passed in fetch implementation,
but we couldn't figure out how to make it work properly and we were getting lots of type
errors. Adding an `Arguments` parameter solve those errors.

`fetchLink` will now check if the link has a `fragment` and use that to return a fragment
response instead of fetching the resource and getting the fragment from it. For iterating
over items in a collection, this is orders of magnitude faster.

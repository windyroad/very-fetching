---
"@windyroad/decorate-fetch-response": minor
---

Added `decorateFetchResponseUsingInputs` which allows you to decorate the fetch response
based on the fetch inputs. For instance `@windyroad/fetch-fragment` uses the hash in the
requested URL to return a response with a body which is just the matching fragment.

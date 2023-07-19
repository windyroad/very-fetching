---
"@windyroad/fetch-link": minor
---

The links() method on LinkedResponse now supports link templates, which allow for variables to
be replaced with values to provide a concrete URL. To achieve this, a new optional parameters
parameter has been added to the links() method, which accepts a set of name-value pairs to be
interpolated into the link templates. This enhancement provides greater flexibility and
customization for users of the LinkedResponse type.

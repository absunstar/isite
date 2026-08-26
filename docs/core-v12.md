# iSite Core v12 - Smart Code Full-Project Compatibility

Core v12 is based on a complete scan of the uploaded Smart Code source tree.

## Full project baseline

- 1,019 JavaScript files scanned
- 14,728,177 source bytes scanned
- zero read/parse errors
- all 21 observed collection method names analyzed
- project-defined collection extension `newCode` excluded from the iSite contract
- legacy prototype helpers `like`, `contains`, and `test` protected

## `res.sendStatus(code)`

Smart Code uses `res.sendStatus(401)` in its payments integration. v12 adds this helper without changing any existing response API:

```js
res.sendStatus(401);
```

It sets the response status, ends the response, and returns `res`.

## Smart Code real-world gate

The baseline now protects the actual collection APIs used by the uploaded project, plus response/request/prototype usage.

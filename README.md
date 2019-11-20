# Facade to create apollo client
Apollo HTTP client with response caching

Example: how to execute graphql `query`
```node
const client = require('@gospime/apollo-client');

const plan = 'userSelect';
const args = { id: 2 }; // criteria to find a user
const fields = { fullname, email }; // fields to select

// calling of `query` method
client()
  .query({ plan, args, fields })
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

Example: how to execute graphql `mutation`
```node
const client = require('@gospime/apollo-client');

const plan = 'userEdit';
const args = { id: 2, fullname: 'new fullname' }; // find user by `id` and update the fullname

// calling of `mutate` method
client()
  .mutate({ plan, args })
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

# Facade to create apollo client
Apollo HTTP client with response caching

Options:
```node
const uri = `https://${hostname}:${port}${graphqlPath}`;
// options of https.Agent
const options = {
  //rejectUnauthorized: false // Skip SSL-restrictions
};

```

ApolloOptions:
[fetch-policy](https://medium.com/@galen.corey/understanding-apollo-fetch-policies-705b5ad71980)
```node
const apolloOptions = {
  query: {
    // How you want your component to interact with the Apollo cache.
    // Defaults to "cache-first".
    fetchPolicy: 'no-cache',
    // How you want your component to handle network and GraphQL errors.
    // Defaults to "none", which means we treat GraphQL errors as runtime errors.
    errorPolicy: 'all',
  }
};

```

Example: how to execute graphql `query`
```node
const Client = require('@gospime/apollo-client');

const plan = 'userSelect';
const args = { id: 2 }; // criteria to find a user
const fields = { fullname, email }; // fields to select

// calling of `query` method
Client
  .create(uri, options, apolloOptions)
  .query({ plan, args, fields })
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

Example: how to execute graphql `mutation`
```node
const Client = require('@gospime/apollo-client');

const plan = 'userEdit';
const args = { id: 2, fullname: 'new fullname' }; // find user by `id` and update the fullname

// calling of `mutate` method
Client
  .create(uri, options, apolloOptions)
  .mutate({ plan, args })
  .then(result => console.log(result))
  .catch(error => console.error(error));
```
Async/await example:
```node
async () => await Client.create(uri, options, apolloOptions).mutate({ plan, args });
```

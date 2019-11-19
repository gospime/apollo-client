const https = require('https');
const fetch = require('node-fetch');

// const ApolloClient = require('@apollo/client').ApolloClient; // @todo: use it in future
const ApolloClient = require('apollo-client').ApolloClient;

const ApolloLink = require('apollo-link').ApolloLink;
const HttpLink = require('apollo-link-http').HttpLink;
const onError = require('apollo-link-error').onError;
const InMemoryCache = require('apollo-cache-inmemory').InMemoryCache;
//const createPersistedQueryLink = require('apollo-link-persisted-queries');

const onFailCallback = ({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    const handler = ({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );

    graphQLErrors.forEach(handler);
  }

  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
};

module.exports = (uri, agentOptions) => {
  const agent = new https.Agent(agentOptions);

  const fnFetch = (fetchUri, fetchOptions) =>
    fetch(fetchUri, { ...fetchOptions, agent });

  const httpLink = new HttpLink({
    fetch: fnFetch,
    uri,
    // https://github.com/github/fetch#sending-cookies
    credentials: 'same-origin'
  });

  const link = ApolloLink.from([
    onError(onFailCallback),
    // createPersistedQueryLink({ useGETForHashedQueries: true }),
    httpLink
  ]);

  const cache = new InMemoryCache();
  const ssrMode = true;

  return new ApolloClient({ ssrMode, link, cache });
};

const https = require('https');
const fetch = require('node-fetch');

// const ApolloClient = require('@apollo/client').ApolloClient; // @todo: use it in future
const ApolloClient = require('apollo-client').ApolloClient;

const ApolloLink = require('apollo-link').ApolloLink;
const HttpLink = require('apollo-link-http').HttpLink;
const onError = require('apollo-link-error').onError;
const InMemoryCache = require('apollo-cache-inmemory').InMemoryCache;
//const createPersistedQueryLink = require('apollo-link-persisted-queries');

const getErrorHandler = logger => {
  if (!logger || typeof logger !== 'object' || typeof logger.error !== 'function') {
    logger = console;
  };

  return ({ /*operation, response, */graphQLErrors, networkError }) => {

    if (graphQLErrors) {
      const handler = ({ message, locations, path }) =>
        logger.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );

      graphQLErrors.forEach(handler);
    }

    if (networkError) {
      logger.error(`[Network error]: ${networkError}`);
    }
  }
};

module.exports = (uri, agentOptions, logger) => {
  const agent = new https.Agent(agentOptions);

  const fnFetch = (fetchUri, fetchOptions) =>
    fetch(fetchUri, { ...fetchOptions, agent });

  const httpLink = new HttpLink({
    fetch: fnFetch,
    uri,
    // https://github.com/github/fetch#sending-cookies
    credentials: 'same-origin'
  });

  const onErrorFn = onError(getErrorHandler(logger));

  //const persistedQuery = createPersistedQueryLink({ useGETForHashedQueries: true });

  const link = ApolloLink.from([ onErrorFn,/* persistedQuery,*/ httpLink ]);

  const cache = new InMemoryCache();
  const ssrMode = true;

  return new ApolloClient({ ssrMode, link, cache });
};

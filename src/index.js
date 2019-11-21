const https = require('https');
const fetch = require('node-fetch');

// const ApolloClient = require('@apollo/client').ApolloClient; // @todo: use it in future
const ApolloClient = require('apollo-client').ApolloClient;

const ApolloLink = require('apollo-link').ApolloLink;
const HttpLink = require('apollo-link-http').HttpLink;
const onError = require('apollo-link-error').onError;
const InMemoryCache = require('apollo-cache-inmemory').InMemoryCache;
//const createPersistedQueryLink = require('apollo-link-persisted-queries');

const gql = require('graphql-tag');
const introspectionQuery = require('graphql').introspectionQuery;

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

const createAgent = options => new https.Agent(options);
const getFetchFn = agent =>
  (fetchUri, fetchOptions) => fetch(fetchUri, { ...fetchOptions, agent });

module.exports = class Facade {
  constructor(client) {
    this.client = client;
  }

  /**
   * Facade to create instance of Apollo client
   */
  static create({ uri, token, agentOptions, logger }) {
    const agent = createAgent(agentOptions);
    const fetchFn = getFetchFn(agent);
    // https://github.com/github/fetch#sending-cookies
    const credentials = 'same-origin';
    const headers = token ? { authorization: `Bearer ${token}` } : undefined;

    const httpLink = new HttpLink({ fetch: fetchFn, uri, credentials, headers });

    const onErrorFn = onError(getErrorHandler(logger));

    //const persistedQuery = createPersistedQueryLink({ useGETForHashedQueries: true });

    const link = ApolloLink.from([ onErrorFn/*, persistedQuery*/, httpLink ]);

    const cache = new InMemoryCache();
    const ssrMode = true;

    const client = new ApolloClient(
      { ssrMode, link, cache }
    );

    return new Facade(client);
  }

  introspect() {
    const query = gql`${introspectionQuery}`;
    return this.client.query({ query });
  }

  query({ plan, args, fields }) {
    const body = this.build(plan, args, fields);
    const query = gql`query { ${body} }`;

    return this.client.query({ query });
  }

  mutate({ plan, args, fields }) {
    const body = this.build(plan, args, fields);
    const mutation = gql`mutation { ${body} }`;

    return this.client.mutate({ mutation });
  }

  build(plan, args, fields) {
    const _args = this.parseArguments(args);
    const _fields = this.parseFields(fields);

    let query = plan;
    if (_args) query += `( ${_args} )`;
    if (_fields) query += `{ ${_fields} }`;

    return query;
  }

  parseArguments(data = {}) {
    if (!data || typeof data !=='object') {
      return '';
    }

    const mapped = [];

    const mapper = ([key, value]) => {
      if (!value) return;

      let _value = '';

      if (Array.isArray(value)) {
        const formatted = value
          .map(item => `"${item}"`)
          .join(', ');

        _value = `[${formatted}]`;
      } else {
        switch (typeof value) {
          case 'string':
            _value = `"${value}"`;
            break;
          case 'boolean':
            _value = value;
            break;
        }
      }

      if (_value) {
        mapped.push(`${key}: ${_value}`);
      }
    };

    Object.entries(data).map(mapper);

    return mapped.join(', ');
  }

  parseFields(fields = []) {
    if (!fields || !Array.isArray(fields)) {
      return '';
    }

    const mapped = [];

    const mapper = field => {
      if (!field) return;

      if (typeof field === 'string') {
        mapped.push(field);
      }
    };

    Object.values(fields).map(mapper);

    return mapped.join(' ');
  }
};

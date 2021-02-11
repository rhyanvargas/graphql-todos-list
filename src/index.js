import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://react-graphql-rhyguy.hasura.app/v1/graphql",
  cache: new InMemoryCache(),
});

// client
//   .query({
//     query: gql`
//       query MyQuery {
//         todos {
//           done
//           id
//           text
//         }
//       }
//     `,
//   })
//   .then((data) => console.log(data));

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

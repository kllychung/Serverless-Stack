import { Api, StackContext, Table } from "sst/constructs";
import 'dotenv/config'

export function AppStack({ stack }: StackContext) {
  // Create the table
  const table = new Table(stack, "Users", {
    fields: {
      email: "string",
      password: "string",
      name: "string"
    },
    primaryIndex: { partitionKey: "email" },
  });
  const auth0Url: string = process.env.AUTH0_URL ? process.env.AUTH0_URL.toString() : ''
  // Create the API
  const api = new Api(stack, "Api", {
    authorizers: {
      auth0: {
        type: "jwt",
        jwt: {
          issuer: auth0Url,
          audience: ["https://auth0-jwt-authorizer"],
        },
      },
    },
    defaults: {
      function: {
        // Bind the table name to our API
        bind: [table],
      },
      authorizer: "auth0"
    },
    routes: {
      "POST /login": {
        function: "packages/functions/src/login.main",
        authorizer: "none"
      },
      "POST /register": {
        function: "packages/functions/src/register.main",
        authorizer: "none"
      },
      "GET /user/{email}": {
        function: "packages/functions/src/get.user",
        authorizer: "none"
      },
      "GET /treasure": {
        function: "packages/functions/src/get.treasure",
        authorizer: "auth0"
      },
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

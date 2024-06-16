const express = require('express');
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import { User } from './User';
import cors from 'cors';
import { GraphqlContext } from '../interfaces';
import { JWTService } from '../services/jwt.service';
import { Tweet } from './Tweets';

export async function initServer() {

  const app = express();

  // enable cors
  app.use(cors());
  app.options("*", cors());

  //  ! means its required;
  const graphqlServer = new ApolloServer<GraphqlContext>({
    typeDefs: `
            ${User.types}
            ${Tweet.types}

            type Query {
                ${User.queries}
            }

            type Mutation {
              ${Tweet.mutations}
            }
        `,
    resolvers: {
      Query: {
        ...User.resolvers.queries
      },
      Mutation: {
        ...Tweet.resolvers.mutations,
      }
    },
  });


  await graphqlServer.start();

  // MW
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(
    "/graphql",
    expressMiddleware(graphqlServer, {

      /**
       * authorization: 'Bearer null' <<=== this is how our token will look as getItem can return a null and will be appended as string
       */
      context: async ({ req }) => {

        const token = req.headers.authorization?.split(" ")[1];

        if (!token || token == 'null') {
          console.log("Token missing or null after split ============================================================");
          return {}; // Return empty context if token is not provided
        }

        try {
          console.log("Token:", token, "inside try block");
          console.log("Token Present ============================================================");
          const user = await JWTService.decodeTokenForUser(token);
          return { user }; // Attach decoded user to context
        } catch (error) {
          console.error('Error decoding JWT:', error);
          return {}; // Return empty context in case of error
        }
      },
    })
  );


  return app;
}
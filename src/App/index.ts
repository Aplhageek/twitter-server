const express = require('express');
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import { User } from './User';
import cors from 'cors';

export async function initServer() {
    const app = express();

    // enable cors
    app.use(cors());
    app.options("*", cors());

    //  ! means its required;
    const graphqlServer = new ApolloServer({
        typeDefs: `
            ${User.types}

            type Query {
                ${User.queries}
            }
        `,
        resolvers: {
            Query: {
                ...User.resolvers.queries
            }
        },
    });


    await graphqlServer.start();

    // MW
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use("/graphql", expressMiddleware(graphqlServer));

    return app;
}
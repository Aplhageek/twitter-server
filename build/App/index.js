"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initServer = void 0;
const express = require('express');
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const body_parser_1 = __importDefault(require("body-parser"));
const User_1 = require("./User");
const cors_1 = __importDefault(require("cors"));
function initServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express();
        // enable cors
        app.use((0, cors_1.default)());
        app.options("*", (0, cors_1.default)());
        //  ! means its required;
        const graphqlServer = new server_1.ApolloServer({
            typeDefs: `
            ${User_1.User.types}

            type Query {
                ${User_1.User.queries}
            }
        `,
            resolvers: {
                Query: Object.assign({}, User_1.User.resolvers.queries)
            },
        });
        yield graphqlServer.start();
        // MW
        app.use(body_parser_1.default.json());
        app.use(body_parser_1.default.urlencoded({ extended: true }));
        app.use(body_parser_1.default.json());
        app.use("/graphql", (0, express4_1.expressMiddleware)(graphqlServer));
        return app;
    });
}
exports.initServer = initServer;

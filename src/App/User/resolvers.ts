import axios from "axios"
import { prismaClient } from "../../client/db";
import { JWTService } from "../../services/jwt.service";
import { GraphqlContext } from "../../interfaces";
import { User } from "@prisma/client";
import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";



const queries = {
    verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
        const customGeneratedToken = await AuthService.verifyTokenAndUser(token);
        return customGeneratedToken;
    },

    /**
     * Resolver function to fetch the current user's information.
     *
     * @param parent - The return value of the resolver for the field's parent type. Not used in this function.
     * @param args - The arguments provided to the field in the GraphQL query. Not used in this function.
     * @param ctx - The context object containing the authenticated user and other shared information.
     * @returns The user object if the user is authenticated and found in the database, otherwise null.
     */
    getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
        // Extract the user ID from the context object. This assumes the context includes a user object with an id field.
        // The ctx (context) object is typically created and passed to resolvers by the GraphQL server setup. 
        const id = ctx.user?.id;
        // If the user ID is not present, return null indicating that the user is not authenticated.
        if (!id) return null;
        // Query the database to find a user with the given ID.
        const user = await UserService.findById(id);
        // Return the user object if found. If no user is found, this will return null.
        return user;
    },

    getUserById: async (parent: any, {id} : {id: string}, ctx : GraphqlContext) => await UserService.findById(id),
}

/**
 *  This syntax suggests that Tweet model might have a nested user object (or relation) that contains an id field. Prisma uses this syntax when dealing with relational data and nested queries.
 *  tweets: (parent: User) => prismaClient.tweet.findMany({where: {user : {id: parent.id}}}), 

 */
const nestedRelationResolver = {
    User : {
        tweets: (parent: User) => prismaClient.tweet.findMany({where: {userId : parent.id} , orderBy: { createdAt: "desc" }}), 
    }
}

export const resolvers = { queries,nestedRelationResolver };
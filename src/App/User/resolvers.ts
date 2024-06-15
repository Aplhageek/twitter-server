import axios from "axios"
import { prismaClient } from "../../client/db";
import { JWTService } from "../../services/jwt.service";
import { GraphqlContext } from "../../interfaces";

/**
 * {token}:{token : String}
 * this is just defining a type of token parameter
 */

interface GoogleTokenResult {
    iss?: string;
    nbf?: string;
    aud?: string;
    sub?: string;
    email: string;
    email_verified: string;
    azp?: string;
    name?: string;
    picture?: string;
    given_name: string;
    family_name?: string;
    iat?: string;
    exp?: string;
    jti?: string;
    alg?: string;
    kid?: string;
    typ?: string;
}

const queries = {
    verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
        const googleToken = token;
        // TODO : MAGIC STRING and param 
        const googleOAuthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
        googleOAuthURL.searchParams.set("id_token", googleToken);

        const { data } = await axios.get<GoogleTokenResult>(googleOAuthURL.toString(), { responseType: "json", });

        // check if user present in our DB
        const user = await prismaClient.user.findUnique({ where: { email: data.email } });

        // if no user, create one
        if (!user) {
            await prismaClient.user.create({
                data: {
                    email: data.email,
                    firstName: data.given_name,
                    lastName: data.family_name,
                    profileImage: data.picture,
                }
            });
        }

        const userInDB = await prismaClient.user.findUnique({ where: { email: data.email } });

        if (!userInDB) throw new Error("User not found");

        // generate token using jsonwebtoken
        const userToken = JWTService.generateTokenForUser(userInDB);

        return userToken;
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
        const user = await prismaClient.user.findUnique({ where: { id } });

        // Return the user object if found. If no user is found, this will return null.
        return user;
    }
}

export const resolvers = { queries };
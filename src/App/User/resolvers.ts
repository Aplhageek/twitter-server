import { prisma, prismaClient } from "../../client/db";
import { GraphqlContext } from "../../interfaces";
import { User } from "@prisma/client";
import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import { RecommendationService } from "../../services/recommendation.service";
import { redisClient } from "../../client/db/redis";



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
        console.log( "Get current user" ,user)
        return user;
    },

    getUserById: async (parent: any, { id }: { id: string }, ctx: GraphqlContext) => await UserService.findById(id),
}

const mutations = {
    followUser: async (parent: any, { to }: { to: string }, ctx: GraphqlContext) => {
        if (!ctx.user || !ctx.user.id) throw new Error("Unauthenticated");
        const res = await UserService.followUser(ctx.user.id, to);
        await redisClient.del(`RECOMMENDED_USERS:${ctx.user.id}`);
        return !!res;
    },
    unfollowUser: async (parent: any, { to }: { to: string }, ctx: GraphqlContext) => {
        if (!ctx.user || !ctx.user.id) throw new Error("Unauthenticated");
        const res = await UserService.unfollowUser(ctx.user.id, to);
        await redisClient.del(`RECOMMENDED_USERS:${ctx.user.id}`);
        return !!res;
    }
}



/**
 *  This syntax suggests that Tweet model might have a nested user object (or relation) that contains an id field. 
 *  Prisma uses this syntax when dealing with relational data and nested queries.
 *  tweets: (parent: User) => prismaClient.tweet.findMany({where: {user : {id: parent.id}}}), 
 */

/*

            followings: async (parent: User) => {
                const res = await prismaClient.follows.findMany({
                    where: { follower: { id: parent.id } },
                    include: { following: true }
                });
                console.log(res);
            },

            it consoles the below result stating the fiels of followerId and followingId 
            follower as it is a relaiton it refers to the actual User object
            {
                followerId: 'clxhz8hdb0000by11fz6ri3h2',
                followingId: 'clxrtn8ul0000e5paze67bp1t',
                following: {
                  id: 'clxrtn8ul0000e5paze67bp1t',
                  firstName: 'Aboli',
                  lastName: 'Ahirrao',
                  email: 'aboliahirrao1@gmail.com',
                  profileImageURL: 'https://lh3.googleusercontent.com/a/ACg8ocIun8ZpOToGIhfLEp9bBWPbP0lCEcD_ZxUYEfay0OdLdytLnQ=s96-c',
                  createdAt: 2024-06-23T17:27:23.242Z,
                  updatedAt: 2024-06-23T17:27:23.242Z
                }
            }
*/
const nestedRelationResolver = {
    User: {
        tweets: (parent: User) => prismaClient.tweet.findMany({ where: { userId: parent.id }, orderBy: { createdAt: "desc" } }),
        followers: async (parent: User) => {
            const res = await prismaClient.follows.findMany({
                where: { following: { id: parent.id } },
                include: { follower: true },
            });
            return res.map(record => record.follower);
        },
        followings: async (parent: User) => {
            const res = await prismaClient.follows.findMany({
                where: { follower: { id: parent.id } },
                include: { following: true }
            });
            return res.map(record => record.following);
        },

        recommendedUsers: async (parent: User, anything: any, ctx: GraphqlContext) => {
            if (!ctx.user) return [];

            const cachedRecList = await redisClient.get(`RECOMMENDED_USERS:${ctx.user.id}`);

            if(cachedRecList) return JSON.parse(cachedRecList);


            const myFollowingsIdArray = await prismaClient.follows.findMany({
                where: {
                    follower : {id : ctx.user.id},
                },

            });

            const expectedUsers = await prismaClient.follows.findMany({
                where: {
                    follower: { id: ctx.user.id },
                },
                include: {
                    following: {
                        include: {
                            followings : {
                                include: {
                                    follower : true,
                                }
                            }
                        }
                    },
                },
            });

            const arr = expectedUsers.flatMap(entry => entry.following.followings.map(rec => rec.follower));
            
            const recUserList = RecommendationService.getTopKRecommendedUsers(myFollowingsIdArray , arr as User[], 2, ctx.user.id);

            await redisClient.set(`RECOMMENDED_USERS:${ctx.user.id}` , JSON.stringify(recUserList));

            return recUserList;
        }
    }
}

export const resolvers = { queries, nestedRelationResolver, mutations };
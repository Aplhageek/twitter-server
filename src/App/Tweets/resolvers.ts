import { Tweet } from "@prisma/client";
import { prismaClient } from "../../client/db";
import { GraphqlContext } from "../../interfaces";

interface CreateTweetPayload{
    content: string;
    imageURL?: string;
}

// Define mutations for  tweets
const mutations = {
  // Resolver function for createTweet mutation 
  createTweet: async (parent: any, { payload }: { payload: CreateTweetPayload }, ctx: GraphqlContext ) => {
    // Check if the user is authenticated
    if (!ctx.user) throw new Error("You are not authenticated");

    // Create a new tweet using Prisma client
    const tweet = await prismaClient.tweet.create({
      data: {
        content: payload.content,
        imageURL: payload.imageURL,
        // Establish a relationship with the user who created the tweet
        user: {
          connect: { id: ctx.user.id } // Connect the user's ID from context with the tweet
        }
        // Alternatively, you can use 'userId' to directly set the user ID
        // userId: ctx.user.id,
      }
    });

    // Return the newly created tweet
    return tweet;
  },
};


  // defining extra resolvers for users 
// Define extra resolvers for the Tweet type
const nestedRelationResolver = {
  Tweet: {
    // Resolve the 'user' field for the Tweet type
    user: (parent: Tweet) => {
      // Use PrismaClient to find a unique user based on the parent Tweet's userId
      return prismaClient.user.findUnique({
        where: { id: parent.userId }  // Query by userId from the parent Tweet
      });
    },
  },
};




  export const resolvers = {
    mutations,
    nestedRelationResolver
  }
import { prismaClient } from "../../client/db";
import { GraphqlContext } from "../../interfaces";

interface CreateTweetPayload{
    content: string;
    imageURL?: string;
}

const mutations = {
    createTweet: async (parent: any, { payload }: { payload: CreateTweetPayload }, ctx: GraphqlContext ) => {
      if (!ctx.user) throw new Error("You are not authenticated");
      const tweet =  await prismaClient.tweet.create({
        data: {
          content: payload.content,
          imageURL: payload.imageURL,
          user : {connect: {id: ctx.user.id}} //it will find the id of ctx.user.id and attach it as a relation with this tweet
          // userId: ctx.user.id,

        }
      });
  
      return tweet;
    },
  };


  export const resolvers = {
    mutations,
  }
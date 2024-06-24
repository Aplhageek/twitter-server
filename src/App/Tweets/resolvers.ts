import { Tweet } from "@prisma/client";
import { GraphqlContext } from "../../interfaces";
import { config } from "../../config"
import UserService from "../../services/user.service";
import { TweetService } from "../../services/tweet.service";
import { AwsService } from "../../services/aws.service";

interface CreateTweetPayload {
  content: string;
  imageURL?: string;
}

// Define mutations for  tweets
const mutations = {
  // Resolver function for createTweet mutation 
  createTweet: async (parent: any, { payload }: { payload: CreateTweetPayload }, ctx: GraphqlContext) => {
    if (!ctx.user) throw new Error("You are not authenticated");
    const tweet = await TweetService.create(ctx.user.id , payload);
    return tweet;
  },
};

// Define extra resolvers for the Tweet type when asked for user inside it
const nestedRelationResolver = {
  Tweet: {
    // Resolve the 'user' field for the Tweet type
    user: async  (parent: Tweet) => {
      // Use PrismaClient to find a unique user based on the parent Tweet's userId
      return await UserService.findById(parent.userId)  // Query by userId from the parent Tweet
    },
  },
};

const queries = {
  getAllTweets: async () => await TweetService.getAll("desc"),

  getSignedURLForTweet:
    async (parent: any, { imageName, imageType }: { imageType: string, imageName: string }, ctx: GraphqlContext) => {
      // is user authenticated
      if (!ctx.user || !ctx.user.id) throw new Error("you are not Authenticated");

      if (!config.allowed.imageTypes.includes(imageType)) throw new Error("This Image type is not Supported");

      const bucketName = config.env.AWS.S3.tweet_bucket;
      const bucketKey = `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}`;

      const signedUrl = await AwsService.whatsMySignURL(bucketName, bucketKey);
      return signedUrl;
    }
}


export const resolvers = {
  mutations,
  nestedRelationResolver,
  queries,
}
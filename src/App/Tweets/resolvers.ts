import { Tweet } from "@prisma/client";
import { prismaClient } from "../../client/db";
import { GraphqlContext } from "../../interfaces";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../../config"

interface CreateTweetPayload {
  content: string;
  imageURL?: string;
}

// Define mutations for  tweets
const mutations = {
  // Resolver function for createTweet mutation 
  createTweet: async (parent: any, { payload }: { payload: CreateTweetPayload }, ctx: GraphqlContext) => {
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


const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    secretAccessKey: config.env.AWS.S3.secret_key,
    accessKeyId: config.env.AWS.S3.access_key,
  },
});

const whatsMySignURL = async (bucketName: string, bucketKey: string) => {

  const putObjectCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: bucketKey,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600, // Example expiration time (1 hour)
    });

    console.log("Signed URL:", signedUrl);
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

// console.log(config.env.AWS.S3.access_key);



const queries = {
  getAllTweets: () => prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } }),

  getSignedURLForTweetImage:
    async (parent: any, { imageName, imageType }: { imageType: string, imageName: string }, ctx: GraphqlContext) => {
      // is user authenticated
      if (!ctx.user || !ctx.user.id) throw new Error("you are not Authenticated");

      if (!config.allowed.imageTypes.includes(imageType)) throw new Error("This Image type is not Supported");

      const bucketName = "mytwitter-dev-bucket"
      const bucketKey = `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}.${imageType}`


      const signedUrl = await whatsMySignURL(bucketName, bucketKey);
      return signedUrl;
    }
}


export const resolvers = {
  mutations,
  nestedRelationResolver,
  queries,
}
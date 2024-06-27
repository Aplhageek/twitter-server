import { Tweet } from "@prisma/client";
import { prismaClient } from "../client/db";
import { redisClient } from "../client/db/redis";


interface CreateTweetPayload {
    content: string;
    imageURL?: string;
}

type OrderBy = "asc" | "desc"

// const rateLimitTime = 10;
// const allowedRequest = 1;


export class TweetService {
    public static async create(userId: string, payload: CreateTweetPayload): Promise<Tweet> {

        // const rateLimitFlag = await redisClient.get(`RATE_LIMIT:TWEET:${userId}`);

        // if (rateLimitFlag) throw new Error("Please wait....");

        const tweets = await prismaClient.tweet.create({
            data: {
                content: payload.content,
                imageURL: payload.imageURL,

                user: {
                    connect: { id: userId }
                }
            }
        });

        // await redisClient.setex(`RATE_LIMIT:TWEET:${userId}`, rateLimitTime, allowedRequest);

        return tweets;
    }

    public static async getAll(orderBy: OrderBy = "desc"): Promise<Tweet[]> {
        return await prismaClient.tweet.findMany({ orderBy: { createdAt: orderBy } });
    }
}
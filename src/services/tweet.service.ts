import { Tweet } from "@prisma/client";
import { prismaClient } from "../client/db";


interface CreateTweetPayload {
    content: string;
    imageURL?: string;
  }

export class TweetService {
    public static async create( userId : string, payload : CreateTweetPayload ) : Promise<Tweet> {
        return await prismaClient.tweet.create({
            data : {
                content: payload.content,
                imageURL: payload.imageURL,

                user : {
                    connect: {id : userId}
                }
            }
        })
    }
}
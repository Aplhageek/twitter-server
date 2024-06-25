import { prismaClient } from "../client/db";
import { CreateUser } from "../interfaces";

class UserService {
   public static async findByEmail(email: string) {
      try {
         return await prismaClient.user.findUnique({ where: { email } });
      } catch (error) {
         throw new Error('Could not find user by email');
      }
   }

   public static async findById(id: string) {
      try {
         return await prismaClient.user.findUnique({ where: { id } });
      } catch (error) {
         throw new Error('Could not find user by ID');
      }
   }

   public static async create(user: CreateUser) {
      try {
         return await prismaClient.user.create({ data: user });
      } catch (error) {
         throw new Error('Could not create user');
      }
   }

   public static async followUser(fromUserId: string, toUserId: string) {
      try {
         return await prismaClient.follows.create({
            data: {
               follower: { connect: { id: fromUserId } },
               following: { connect: { id: toUserId } },
            }
         });
      } catch (error) {
         console.log(error);
         throw new Error('Could not follow user');
      }
   }

   public static async unfollowUser(fromUserId: string, toUserId: string) {
      try {
         return await prismaClient.follows.delete({
            where: {
               followerId_followingId: {
                  followerId: fromUserId,
                  followingId: toUserId
               }
            }
         });
      } catch (error) {
         throw new Error('Could not unfollow user');
      }
   };

}

export default UserService;
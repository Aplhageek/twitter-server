import { prismaClient } from "../client/db";
import { CreateUser } from "../interfaces";

class UserService {
    public static async findByEmail(email: string) {
       return await prismaClient.user.findUnique({ where: { email } });
    }
    public static async findById(email: string) {
       return await prismaClient.user.findUnique({ where: { email } });
    }
    public static async create(user : CreateUser) {
       return await prismaClient.user.create({data : user});
    }
}

export default UserService;
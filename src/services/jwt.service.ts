import JWT from 'jsonwebtoken';
import { prismaClient } from '../client/db';
import { User } from '@prisma/client';

export class JWTService {
    private static secreteKey = "$uper#duper";

    public static  generateTokenForUser(user: User): string{
        
        const payload = {
            id: user?.id,
            email: user?.email,
        }

        const token = JWT.sign(payload, this.secreteKey);
        return token;
    }
}

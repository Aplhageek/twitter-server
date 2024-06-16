import JWT from 'jsonwebtoken';

import { User } from '@prisma/client';
import { JWTUser } from '../interfaces';

// TODO: MAgic secreteKey

export class JWTService {
    private static secreteKey = "$uper#duper";

    public static  generateTokenForUser(user: User): string{
        
        const payload : JWTUser = {
            id: user?.id,
            email: user?.email,
        }

        const token = JWT.sign(payload, this.secreteKey);
        return token;
    }

    // TODO: refactor to use better token with exp and types.
    public static decodeTokenForUser = (token : any) => {
        return JWT.verify(token, this.secreteKey) as JWTUser;
    }
}

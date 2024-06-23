/**
 * {token}:{token : String}
 * this is just defining a type of token parameter
 */

import axios from "axios";
import { prismaClient } from "../client/db";
import { config } from "../config";
import { JWTService } from "./jwt.service";
import UserService from "./user.service";
import { User } from "@prisma/client";

interface GoogleTokenResult {
    iss?: string;
    nbf?: string;
    aud?: string;
    sub?: string;
    email: string;
    email_verified: string;
    azp?: string;
    name?: string;
    picture?: string;
    given_name: string;
    family_name?: string;
    iat?: string;
    exp?: string;
    jti?: string;
    alg?: string;
    kid?: string;
    typ?: string;
}

class AuthService {
    public static async verifyTokenAndUser(token: string) : Promise<string> {
        try {
            const googleTokenData = await this.verifyGoogleToken(token);
            const user = await this.getOrCreateUser(googleTokenData);
            const userToken = JWTService.generateTokenForUser(user);
            return userToken;   
        } catch (error) {
            console.log(error);
            throw new Error("Failed to verify token and user");
        }
    }


    private static async verifyGoogleToken(token: string): Promise<GoogleTokenResult> {
        const googleOAuthURL = new URL(config.googleOAuthURL);
        googleOAuthURL.searchParams.set("id_token", token);
        const { data } = await axios.get<GoogleTokenResult>(googleOAuthURL.toString(), { responseType: "json" });
        return data;
    }

    private static async getOrCreateUser(data: GoogleTokenResult): Promise<User> {
        let user = await UserService.findByEmail(data.email);
        // if no user, create one
        if (!user) {
            // console.log(user); //type will be null because of type inference;
            user = await UserService.create({
                email: data.email,
                firstName: data.given_name,
                lastName: data.family_name,
                profileImageURL: data.picture,
            });
        }
        return user;
    }
}


export default AuthService;
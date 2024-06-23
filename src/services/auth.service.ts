/**
 * {token}:{token : String}
 * this is just defining a type of token parameter
 */

import axios from "axios";
import { prismaClient } from "../client/db";
import { config } from "../config";
import { JWTService } from "./jwt.service";
import UserService from "./user.service";

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
    /**
     * Verifies a Google OAuth token, checks for the existence of the corresponding user in the database,
     * creates a new user if not found, and generates a JSON Web Token (JWT) for the user.
     *
     * @param {string} token - The Google OAuth token to be verified.
     * @returns {Promise<string>} - A promise that resolves to a JWT for the user.
     *
     * @example
     * const token = await verifyTokenAndUser(googleOAuthToken);
     *
     * @description
     * The method follows these steps:
     * 
     * 1. **Initialize Google Token and URL:**
     *    - The provided `token` is assigned to `googleToken`.
     *    - A new `URL` object is created using `config.googleOAuthURL`.
     *    - The `id_token` search parameter is set to the value of `googleToken`.
     * 
     * 2. **Fetch Google Token Data:**
     *    - An HTTP GET request is made to the constructed Google OAuth URL to retrieve token information.
     *    - The response data is typed as `GoogleTokenResult`.
     * 
     * 3. **Check for Existing User:**
     *    - The method checks if a user with the email from the Google token data exists in the database using `UserService.findByEmail`.
     * 
     * 4. **Create New User if Not Found:**
     *    - If the user does not exist, a new user is created with the data retrieved from the Google token.
     * 
     * 5. **Generate JWT:**
     *    - A JWT is generated for the user using `JWTService.generateTokenForUser`.
     * 
     * 6. **Return JWT:**
     *    - The generated JWT is returned.
     */
    public static async verifyTokenAndUser(token: string) {
        const googleToken = token;
        const googleOAuthURL = new URL(config.googleOAuthURL);
        googleOAuthURL.searchParams.set("id_token", googleToken);

        const { data } = await axios.get<GoogleTokenResult>(googleOAuthURL.toString(), { responseType: "json", });

        // check if user present in our DB
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

        // console.log(user) //here user will def be a not null or undefined as we have created it already

        // generate token using jsonwebtoken
        const userToken = JWTService.generateTokenForUser(user);

        return userToken;
    }
}


export default AuthService;
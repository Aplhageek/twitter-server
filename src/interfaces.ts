export interface JWTUser {
    id : string;
    email : string;
}

export interface GraphqlContext {
    user?: JWTUser;
}

export interface CreateUser {
    email: string,
    firstName: string,
    lastName?: string ,
    profileImageURL?: string,

}
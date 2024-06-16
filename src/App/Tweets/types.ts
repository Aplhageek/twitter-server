export const types = `#graphql
    type Tweet {
        id: ID!
        content: String!
        imageURL: String

        user: User
    }
    input CreateTweetData {
        content: String!
        imageURL: String
    }
`;
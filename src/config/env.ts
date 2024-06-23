// config.ts
const  dotenv = require("dotenv");
import Joi from "joi";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../backend/.env") });

const envVarSchema = Joi.object().keys({
    PORT: Joi.number().default(8000),
    DATABASE_URL: Joi.string().description("Mongo DB Url").required(),
    NODE_ENV: Joi.string()
        .valid("production", "development", "test")
        .required(),
    AWS_S3_SECRETE_KAY: Joi.string().required().description("S3 Secrete key"),
    AWS_S3_ACCESS_KEY: Joi.string().required().description("S3 access key"),
}).unknown();

const { value: envVars, error } = envVarSchema
    .prefs({ errors: { label: "key" } })
    .validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export const env = {
    NODE_ENV: envVars.NODE_ENV,
    port: envVars.PORT,
    database: {
        url: envVars.DATABASE_URL,
    },
    AWS: {
        S3: {
            access_key: envVars.AWS_S3_ACCESS_KEY,
            secret_key: envVars.AWS_S3_SECRETE_KAY,
            tweet_bucket: envVars.AWS_S3_TWEET_BUCKET,
        }
    }
};

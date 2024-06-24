import { S3Client } from "@aws-sdk/client-s3";
import  {config}  from "../../config"


export const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
      secretAccessKey: config.env.AWS.S3.secret_key,
      accessKeyId: config.env.AWS.S3.access_key,
    },
});


  
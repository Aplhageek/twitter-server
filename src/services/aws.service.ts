import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../aws/s3";

export const whatsMySignURL = async (bucketName: string, bucketKey: string) => {

    const putObjectCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: bucketKey,
    });
  
    try {
      const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
        expiresIn: 3600, // Example expiration time (1 hour)
      });
  
      console.log("Signed URL:", signedUrl);
      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      throw error;
    }
  };
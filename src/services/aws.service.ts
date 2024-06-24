import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../aws/s3";

export class AwsService {
  public static async whatsMySignURL(bucketName: string, bucketKey: string): Promise<string> {
    const putObjectCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: bucketKey,
    });
    try {
      const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
        expiresIn: 3600, // Example expiration time (1 hour)
      });
      return signedUrl;
    } catch (error) {
      throw error;
    }
  }
}
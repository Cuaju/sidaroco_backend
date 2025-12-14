import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

export async function uploadToS3(
  file: Express.Multer.File,
  folder: string
): Promise<string> {
  const key = `${folder}/${randomUUID()}-${file.originalname}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
}
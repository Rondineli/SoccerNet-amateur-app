import { S3Client } from "@aws-sdk/client-s3";

export const API_ENDPOINT = process.env.API_ENDPOINT || "https://metal-everybody-ipod-blackberry.trycloudflare.com";
export const DISTRO = "https://d3tdwb735roscv.cloudfront.net";
export const S3_BUCKET_NAME = "soccernet-v2-amateur";
export const S3_CLIENT = new S3Client({
  region: process.env.AWS_REGION || "us-east-1"
});
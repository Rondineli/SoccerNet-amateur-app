import { S3_CLIENT, DISTRO, S3_BUCKET_NAME } from "./lib/constants";

import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export default async function handler(req, res) {
  try {
    const bucket = S3_BUCKET_NAME;
    const prefix = "videos/downloads/";

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    const response = await S3_CLIENT.send(command);

    const fileUrls =
      response.Contents
        ?.filter((obj) => obj.Key.toLowerCase().endsWith(".mp4"))
        .map((obj) => {
          return `${DISTRO}/${obj.Key}`;
        }) || [];

    console.log("S3 files:", fileUrls);
    console.log(`Total of: ${fileUrls.length}`);

    res.status(200).json({ files: fileUrls });
  } catch (err) {
    console.error("Error reading S3 bucket:", err);
    res.status(500).json({ error: err.message });
  }
}

import fs from "fs";
import path from "path";
import ytDlp from "yt-dlp-exec";

import { loadJobs, saveJobs } from "./downloadJobStatus.js";
import { S3_CLIENT, DISTRO, S3_BUCKET_NAME } from "./constants";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const OUTPUT_DIR = path.join(process.cwd(), "public/videos");
const outputTemplate = `${OUTPUT_DIR}/%(title)s [%(id)s].%(ext)s`;

export async function uploadToS3(localPath, fileName) {
  const fileStream = fs.createReadStream(localPath);

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: `videos/downloads/${fileName}`,
    Body: fileStream,
    ContentType: "video/mp4",
  });

  await S3_CLIENT.send(command);

  return `${DISTRO}/videos/downloads/${fileName}`;
}

export async function startDownload(jobId, videoUrl) {
  const jobs = loadJobs();

  jobs[jobId].status = "downloading";
  saveJobs(jobs);

  try {
    // Launch yt-dlp using the Node wrapper
    await ytDlp(videoUrl, {
      output: outputTemplate,
      progress: true,
      newline: true,
      print: "after_move:filepath",
      // This allows capturing stdout and parsing progress
      // You could also add format options if needed
      onProgress: (progress) => {
        // progress.percent is a number from 0 to 100
        if (progress.percent != null) {
          jobs[jobId].progress = Math.floor(progress.percent);
          jobs[jobId].message = `Downloading: ${Math.floor(progress.percent)}%`;
          saveJobs(jobs);
        }
      },
      onStdout: (line) => {
        // catch the final filepath output
        line = line.toString().trim();
        if (line.startsWith(OUTPUT_DIR)) {
          jobs[jobId].filePath = line;
          jobs[jobId].fileName = path.basename(line);
          saveJobs(jobs);
        }
      },
    });

    // After download, upload to S3
    const localPath = jobs[jobId].filePath;
    const fileName = jobs[jobId].fileName;

    if (!localPath || !fs.existsSync(localPath)) {
      throw new Error("Downloaded file not found");
    }

    const s3Url = await uploadToS3(localPath, fileName);
    jobs[jobId].s3Location = s3Url;
    jobs[jobId].status = "done";
    saveJobs(jobs);

    console.log(`[DEBUG] Uploaded to S3: ${s3Url}`);
  } catch (err) {
    console.error("[DEBUG][ERROR] Download or upload failed:", err);

    jobs[jobId].status = "error";
    jobs[jobId].error = err.message;
    saveJobs(jobs);
  }
}

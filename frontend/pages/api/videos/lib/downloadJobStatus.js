// lib/jobStore.js
import fs from "fs";

const FILE = "/tmp/jobs.json";

export function loadJobs() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

export function saveJobs(jobs) {
  fs.writeFileSync(FILE, JSON.stringify(jobs, null, 2));
}

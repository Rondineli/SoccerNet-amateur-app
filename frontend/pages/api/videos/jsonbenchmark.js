const path = require("path");

import { API_ENDPOINT } from "./lib/constants";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log(`Process => ${JSON.stringify(req.body)}`);

  const { fileName } = req.body;
  

  if (!fileName) {
    return res.status(400).json({ error: "Missing fileName" });
  }

  const parsed = path.parse(fileName);

  let data = {};

  try {
    const res = await fetch(`${API_ENDPOINT}/json/amateur/benchmark/${parsed.name}`);
    if (!res.ok) {
      throw new Error("Request failed");
    }
    data = await res.json();
  } catch (err) {
    console.log(err)
    data = { status: "error", message: "Failed to fetch status" };
  }

   console.log(`Returning => ${JSON.stringify(data)}`)

  return res.status(200).json(data);
}

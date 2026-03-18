import { API_ENDPOINT } from "./lib/constants";


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log(`Process => ${JSON.stringify(req.body)}`)

  const { youtubeID, modelType } = req.body;

  if (!youtubeID || !modelType) {
    return res.status(400).json({ error: "Missing youtubeID or model type" });
  }

  let data = {};

  try {
    const res = await fetch(`${API_ENDPOINT}/${youtubeID}?modelConfig=${modelType}`);
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

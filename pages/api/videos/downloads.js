import { API_ENDPOINT } from "./lib/constants";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log(`Post received: ${JSON.stringify(req.body)}`)

  const { youtubeUrlOrId } = req.body;

  if (!youtubeUrlOrId) {
    return res.status(400).json({ error: "Missing youtubeUrlOrId" });
  }

  const videoUrl = youtubeUrlOrId.startsWith("http")
    ? youtubeUrlOrId
    : `https://www.youtube.com/watch?v=${youtubeUrlOrId}`;

  let data = {}

  try {
      const res = await fetch(`${API_ENDPOINT}/download`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ youtubeUrlOrId:  videoUrl})
      });
      if (!res.ok) {
        throw new Error("Request failed");
      }
      data = await res.json();
    } catch (err) {
      console.log(err)
      data = { status: "error", message: "Failed to fetch status" };
    }

  return res.status(200).json(data);
}

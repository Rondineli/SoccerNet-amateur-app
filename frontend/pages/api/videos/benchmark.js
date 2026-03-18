import { API_ENDPOINT } from "./lib/constants";

export default async function handler(req, res) {
  console.log(`[DEBUG] handler started => ${JSON.stringify(req.body)}`)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { dataset } = req.body;

  console.log(`[DEBUG] Requesting BE Process => ${API_ENDPOINT}/benchmark?annotation=${dataset}`);

  if (!dataset) {
    return res.status(400).json({ error: "Missing dataset" });
  }
  
  let data = {};

  try {
    const res = await fetch(`${API_ENDPOINT}/benchmark?annotation=${dataset}`);
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

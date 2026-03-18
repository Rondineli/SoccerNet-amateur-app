import { API_ENDPOINT } from "./lib/constants";


export default async function handler(req, res) {
  const { jobId } = req.query;

  let data = {};

  try {
    const res = await fetch(`${API_ENDPOINT}/status/${jobId}`);

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

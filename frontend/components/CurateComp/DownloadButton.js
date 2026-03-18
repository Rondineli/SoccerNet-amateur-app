import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  LinearProgress,
} from "@mui/material";

export default function DownloadButton({youtubeUrl, setUrl}) {
  const [open, setOpen] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);

  console.log(`Downloading an url: ${JSON.stringify(youtubeUrl)}`)

  const startDownload = async () => {
    const res = await fetch("/api/videos/downloads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtubeUrlOrId: youtubeUrl }),
    });

    const data = await res.json();

    console.log(`[DEBUG] => JOBID: ${JSON.stringify(data)}`)
    setJobId(data.jobId);
    setOpen(true);
  };

  // Poll status
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/videos/downloadStatus?jobId=${jobId}`);
      const data = await res.json();

      console.log(`Final data: ${JSON.stringify(data)}`)
      setStatus(data);

      if (data.status === "done" || data.status === "error" || data?.phase_1_status === "finished") {
        clearInterval(interval);
        setOpen(false);
        console.log(`Url being set: :=> /videos/${data.filename}`);
        setUrl(data?.s3_location || `/videos/${data.filename}`);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <>
      <Button variant="contained" onClick={startDownload}>
        Download Video
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: 400,
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            mx: "auto",
            mt: "20%",
          }}
        >
          <Typography variant="h6">
            Downloading…
          </Typography>

          {status && (
            <>
              <Typography sx={{ mt: 1 }}>
                {status.message}
              </Typography>

              <LinearProgress
                variant="determinate"
                value={status.progress || 0}
                sx={{ mt: 2 }}
              />

              <Typography sx={{ mt: 1 }}>
                {status.progress || 0}%
              </Typography>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
}

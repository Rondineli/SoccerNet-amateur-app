"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";

export default function FetchJsonModal({dataset, resultsData}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!open) return;

    const fetchData = async (fileName) => {

      const fileRequest = fileName ? fileName : "/datasets/amateur/test_amateur_annotations"
      setLoading(true);
      try {
        const res = await fetch('/api/videos/jsonbenchmark/', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({"fileName": fileRequest})
        });
    
        const json = await res.json();
        setData(json);
      } catch (err) {
        setData({ error: "Failed to load data" });
      } finally {
        setLoading(false);
      }
    };

    fetchData(dataset);
  }, [open]);

  return (
    <div style={{ paddingBottom: '10px' }}>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open JSON benchmark
      </Button>
      {/*{resultsData}*/}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 500,
            bgcolor: "background.paper",
            fontColor: "#fff",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" mb={2} sx={{ color: "#000"}}>
            JSON Response
          </Typography>

          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              bgcolor: "background.paper",
              color: "#00ff88",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.85rem",
            }}
          >
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <pre style={{ margin: 0, color: "#00ff88"}}>
                {data ? JSON.stringify(data, null, 2) : "No data"}
              </pre>
            )}
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

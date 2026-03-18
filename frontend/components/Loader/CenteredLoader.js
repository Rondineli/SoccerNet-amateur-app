"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

export default function CenteredLoader({ size = 48 }) {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="h6" color="text.primary">
        Loading benchmark...
      </Typography>

      <CircularProgress size={size} />
    </Box>
  );
}

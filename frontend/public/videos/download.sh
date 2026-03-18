#!/usr/bin/env bash

set -e

DATASET_DIR="/opt/projects/datasets"

if [ -z "$1" ]; then
  echo "Usage: $0 <youtube-url-or-id>"
  exit 1
fi

INPUT="$1"

# -------------------------------
# 1. Extract YouTube ID
# -------------------------------
if [[ "$INPUT" =~ v=([^&]+) ]]; then
  YT_ID="${BASH_REMATCH[1]}"
elif [[ "$INPUT" =~ youtu\.be/([^?&/]+) ]]; then
  YT_ID="${BASH_REMATCH[1]}"
else
  # Assume raw ID
  YT_ID="$INPUT"
fi

echo "YouTube ID: $YT_ID"

# -------------------------------
# 2. Check if already exists
# -------------------------------
if find "$DATASET_DIR" -type f -name "1_${YT_ID}.mp4" | grep -q .; then
  echo "❌ Video already exists in dataset. Aborting."
  exit 0
fi

echo "✅ Video not found. Downloading..."

# -------------------------------
# 3. Download (video-only if possible)
# -------------------------------
yt-dlp "https://www.youtube.com/watch?v=${YT_ID}"

echo "🎉 Download completed: 1_${YT_ID}.mp4"

import os
import random
import subprocess

from pathlib import Path


def seconds_to_mmss(seconds):
    if isinstance(seconds, str):
        seconds = seconds.rstrip("s")

    seconds = int(float(seconds))
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60

    if not h:
        return f"{m:02d}:{s:02d}"
    return f"{h:02d}:{m:02d}:{s:02d}"


def split_video_ffmpeg(input_path, kick_off, end_time):
    """
    Splits a video into `num_slices` equal parts using FFmpeg.

    Args:
        input_path (str): Path to the input video.
        output_dir (str): Directory to save slices.
        num_slices (int): Number of parts to divide the video into.
    """

    # Get duration using ffprobe
    result = subprocess.run(
        [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", input_path
        ],
        capture_output=True, text=True
    )
    duration = float(result.stdout.strip())

    print(f"🎥 Splitting {input_path} ({duration:.2f}s) ...")

    video_path = Path(input_path)

    output_file = os.path.join("./", f"cut_{video_path.stem}{video_path.suffix}")

    # FFmpeg command to cut without re-encoding for speed/quality
    cmd = [
        "ffmpeg",
        "-y",
        "-ss", seconds_to_mmss(kick_off),
        "-t", seconds_to_mmss(end_time),
        "-i", input_path,
        "-c:v", "libx264",
        "-c:a", "aac",
        "-preset", "veryfast",
        output_file
    ]

    print(f"Executing.... {subprocess.run(cmd, capture_output=True, text=True)}")

    print("🎬 Done splitting video!")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Split a video into N equal parts using FFmpeg.")
    parser.add_argument("--video", required=True, help="Path to input video")
    parser.add_argument("--kick-off", help="Start of the video to cut")
    parser.add_argument("--end-time", help="End of the video to cut")

    args = parser.parse_args()

    size_video = args.end_time

    try:
        start_time = int(args.kick_off)
        end_time = int(args.end_time)

        size_video = end_time - start_time # trying to guess size of the video once start is set

    except:
        pass

    split_video_ffmpeg(args.video, args.kick_off, size_video)


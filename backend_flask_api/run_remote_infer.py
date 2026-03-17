import argparse
import json
import os
import paramiko
import logging

from pathlib import Path
from typing import Optional, List

from split_video import split_video_ffmpeg

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())


def mmss_to_seconds(time_str: str) -> int:
    minutes, seconds = map(int, time_str.split(":"))
    return minutes * 60 + seconds


def seconds_to_mmss(total_seconds: int) -> str:
    minutes = total_seconds // 60
    seconds = total_seconds % 60
    return f"{minutes:02d}:{seconds:02d}"


def prediction_window_mmss(prediction_mmss: str, window_s: int = 0):
    pred_sec = mmss_to_seconds(prediction_mmss)

    lower = max(0, pred_sec - window_s)
    upper = pred_sec + window_s

    return seconds_to_mmss(lower)


class SshProtocolExecution:
    def __init__(self, host: str, port: int,
                 cwd: Optional[str] = "/tmp/_remote_file_execution",
                 ssh_client: Optional[paramiko.SSHClient] = ssh,
                 username: Optional[str] = 'root'
                 ):
        self.host = host
        self.port = port
        self.username = username
        self.client = ssh_client
        self.local_path = "./"
        self.remote_dir = cwd
        self.sftp = None
        self.__connect()
        self._transfer_lib_files_execution()

    def __connect(self) -> None:
        self.client.connect(self.host, self.port, self.username)
        self.sftp = self.client.open_sftp()

    def _transfer_lib_files_execution(self):
        try:
            self.sftp.mkdir(self.remote_dir)
        except IOError:
            pass  # already exists
        
        for file in os.listdir(self.local_path):
            if file in ["__pycache__"]:
                continue
            self.sftp.put(
                os.path.join(self.local_path, file),
                f"{self.remote_dir}/{file}"
            )

    def _get_output_results(self, remote_file: str, file_output: str):
        print(f"Saving remote: {remote_file} to ./{file_output}")
        self.sftp.get(remote_file, f"./{file_output}")

    def execute_cmd(self, cmd: str) -> List:
        stdin, stdout, stderr = self.client.exec_command(cmd)
        output_cmd = []
        input = []
        err = []
        
        try:
            output_cmd = stdout.read().decode('utf-8').split("\n")
        except:
            pass
        
        try:
            input = stdin.read().decode('utf-8').split("\n")
        except:
            pass

        try:
            err = stderr.read().decode('utf-8').split("\n")
        except:
            pass
        
        return (output_cmd, input, err)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True, help="Path to model config.py")
    parser.add_argument("--features", required=True, help="Path to PCA512 features (.npy)")
    parser.add_argument("--dataset-root-dir", required=False, default="/workspace/datasets/amateur-dataset/", help=f"Data root for dataset files" )

    # Server part of configs
    parser.add_argument("--remote-host", required=True, help="Remote host server")
    #parser.add_argument("--remote-port", required=True, help="Remote port server")
    parser.add_argument("--remote-port", required=True, help="Remote port server", type=int)
    parser.add_argument("--remote-cwd", required=False, default="/tmp/_remote_file_execution", help="Remote port server")
    parser.add_argument("--remote-username", required=False, default='root', help="Remote username server")

    args = parser.parse_args()

    logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)s: %(message)s")
    logging.debug(f"Connecting to: {args.remote_host}:{args.remote_port} as {args.remote_username}")
    ssh = SshProtocolExecution(
        host=args.remote_host,
        port=args.remote_port,
        username=args.remote_username,
        cwd=args.remote_cwd
    )
    input_path = Path(args.config)
    output = f"cleaned_output.json"
    outout = ssh.execute_cmd(
        f"""
            . /root/miniconda3/etc/profile.d/conda.sh &&
            conda activate osl-action-spotting && 
            cd {args.remote_cwd} && bash -x ./execute.sh {args.config} {args.dataset_root_dir} {args.features} {output}
        """
    )
    ssh._get_output_results(f"{args.remote_cwd}/{output}", output)

    with open(f"cleaned_output.json", "r") as f:
        json_output = json.loads(f.read())

    base_path = "/opt/projects/next-soccernet-annotator/public/videos/"

    urls = list(json_output.keys())

    for url in urls:
        for gg in json_output[url]:
            video_feature = Path(url)

            _input_video_feature = video_feature.parts[-2].split("_")[-1]
            os.makedirs(os.path.join("./", "outputs"), exist_ok=True)
            os.makedirs(os.path.join(f"./outputs/{_input_video_feature}"), exist_ok=True)
            video_mp4 = os.path.join(base_path, f"1_{_input_video_feature}.mp4")
            timestamp = gg["gameTime"]
            label = gg["label"]
            confidence = gg["confidence"]
            kick_off = prediction_window_mmss(timestamp)
            split_video_ffmpeg(
                video_mp4,
                kick_off,
                f"./outputs/{_input_video_feature}",
                suffix=f"{label}_{kick_off}"
            )

import os
import subprocess
import logging
from pathlib import Path

logger = logging.getLogger("mp3_loud_norm")

class LoudNormCore:
    def __init__(self, cfg):
        self.cfg = cfg
        self.I = cfg["target_lufs"]
        self.LRA = cfg["lra"]
        self.TP = cfg["tp"]
        self.mode = cfg["run_mode"]
        self.recursive = cfg["recursive"]
        self.out_sub = cfg["output_subdir"]

    def single_file_handle(self, src_path: str, base_dir: str):
        src = Path(src_path)
        if not src.suffix.lower() == ".mp3":
            return True
        try:
            if self.mode == "copy":
                out_dir = Path(base_dir) / self.out_sub
                out_dir.mkdir(exist_ok=True, parents=True)
                out_path = str(out_dir / src.name)
            else:
                out_path = src_path

            cmd = [
                "ffmpeg",
                "-hide_banner", "-loglevel", "error",
                "-i", src_path,
                "-filter:a", f"loudnorm=I={self.I}:LRA={self.LRA}:TP={self.TP}",
                "-c:a", "copy",
                "-y", out_path
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            logger.info(f"Success: {src_path}")
            return True
        except Exception as e:
            logger.error(f"Fail {src_path} | Err:{str(e)}")
            return False

    def scan_and_run(self, music_root: str):
        root = Path(music_root)
        success, fail = 0, 0
        file_list = list(root.rglob("*.mp3")) if self.recursive else list(root.glob("*.mp3"))
        for file in file_list:
            if self.single_file_handle(str(file), str(root)):
                success += 1
            else:
                fail += 1
        logger.info(f"Task Finish | Success:{success} Fail:{fail}")
        return success, fail

import yaml
import logging
from pathlib import Path
from .loud_core import LoudNormCore

PLUGIN_NAME = "mp3_loud_norm"
PLUGIN_VERSION = "1.0.0"
PLUGIN_AUTHOR = "sujiajun"
PLUGIN_DESC = "FFmpeg custom LUFS mp3 loudness plugin for SongLoft"

log_path = Path(__file__).parent / "plugin.log"
logging.basicConfig(
    filename=str(log_path),
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    encoding="utf-8"
)
logger = logging.getLogger(PLUGIN_NAME)

cfg_path = Path(__file__).parent / "config.yaml"
with open(cfg_path, "r", encoding="utf-8") as f:
    CONFIG = yaml.safe_load(f)

core = LoudNormCore(CONFIG)

def run_task(music_library_path: str):
    logger.info("=== Start Loudness Normalize Task ===")
    return core.scan_and_run(music_library_path)

def register_plugin():
    return {
        "name": PLUGIN_NAME,
        "version": PLUGIN_VERSION,
        "desc": PLUGIN_DESC,
        "exec_func": run_task
    }

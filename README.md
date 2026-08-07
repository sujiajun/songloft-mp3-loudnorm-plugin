# songloft-mp3-loudnorm-plugin
 独立第三方插件，适配 songloft-org 音乐管理程序，基于ffmpeg实现MP3批量EBU R128响度统一，支持自定义LUFS。
 本插件为独立开源项目，不属于原songloft-org官方仓库。
 ## Features
 - 自定义目标响度(-12/-14/-16LUFS自由设置)
 - 音轨copy模式，无二次重编码，最大保留音质
 - 两种运行模式：生成新文件 / 直接覆盖原音频
 - 自动日志记录损坏音频，不中断批量任务
 - 递归扫描全曲库MP3，兼容群晖/NAS部署
 ## Deploy
 1. Download this repo, copy folder `mp3_loud_norm` into `songloft/plugins/`
 2. Install dependency
 ```bash
 pip install -r requirements.txt

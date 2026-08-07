#!/bin/bash
set -e

# 进入 dist 目录
cd dist

# 计算 index.js 的 SHA256 作为 entryHash
ENTRY_HASH=$(sha256sum index.js | cut -d' ' -f1)

# 先打包一个临时 zip（不含 plugin.json）
zip -q -r ../temp.zip *
cd ..
ZIP_HASH=$(sha256sum temp.zip | cut -d' ' -f1)
rm temp.zip

# 用 jq 更新 plugin.json（添加 entryHash 和 zipHash）
sudo apt-get update -qq && sudo apt-get install -y jq -qq
jq --arg entry "$ENTRY_HASH" --arg zip "$ZIP_HASH" \
   '.entryHash = $entry | .zipHash = $zip' \
   plugin.json > plugin.tmp.json
mv plugin.tmp.json plugin.json

# 最终打包（包含 plugin.json 和 dist 文件夹）
zip -q -r loudness.jsplugin.zip plugin.json dist

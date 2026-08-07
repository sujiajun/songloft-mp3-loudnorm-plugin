#!/bin/bash
set -e

# 1. 计算 dist/index.js 的 SHA256（entryHash）
ENTRY_HASH=$(sha256sum dist/index.js | cut -d' ' -f1)

# 2. 先打包 dist 目录（不含 plugin.json），计算 zipHash
cd dist
zip -q -r ../temp.zip *
cd ..
ZIP_HASH=$(sha256sum temp.zip | cut -d' ' -f1)
rm temp.zip

# 3. 更新 plugin.json（写入两个 hash）
sudo apt-get update -qq && sudo apt-get install -y jq -qq
jq --arg entry "$ENTRY_HASH" --arg zip "$ZIP_HASH" \
   '.entryHash = $entry | .zipHash = $zip' \
   plugin.json > plugin.tmp.json
mv plugin.tmp.json plugin.json

# 4. 最终打包（包含 plugin.json 和 dist 文件夹）
zip -q -r loudness.jsplugin.zip plugin.json dist

echo "✅ 构建完成：loudness.jsplugin.zip"

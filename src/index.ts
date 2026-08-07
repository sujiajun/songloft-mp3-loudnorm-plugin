import * as sdk from '@songloft/plugin-sdk';
const { songloft, jsonResponse } = sdk;

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface Song {
  id: string;
  file_path: string;
  title: string;
}

// 获取所有本地 MP3 歌曲
async function getAllLocalMp3Songs(): Promise<Song[]> {
  const songs = await songloft.db.songs.find({
    where: { type: 'local', file_path: { endsWith: '.mp3' } }
  });
  return songs;
}

// 处理单首歌曲
async function normalizeLoudness(song: Song, targetLoudness: number): Promise<{ success: boolean; error?: string }> {
  const inputPath = song.file_path;
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const baseName = path.basename(inputPath, ext);
  const tempPath = path.join(dir, `${baseName}_normalized${ext}`);

  // 使用 ffmpeg loudnorm 滤镜
  const ffmpegCmd = `ffmpeg -i "${inputPath}" -af "loudnorm=I=${targetLoudness}:LRA=11:TP=-1.5" -y "${tempPath}"`;

  try {
    await execAsync(ffmpegCmd);

    // 替换原文件
    await fs.rename(tempPath, inputPath);
    await songloft.db.songs.update({ id: song.id }, { file_path: inputPath });

    return { success: true };
  } catch (error: any) {
    // 清理临时文件
    await fs.unlink(tempPath).catch(() => {});
    return { success: false, error: error.message };
  }
}

// 批量处理路由
songloft.route.post('/api/normalize', async (req) => {
  const { songIds, targetLoudness = -16 } = req.body as { songIds: string[]; targetLoudness?: number };

  const allSongs = await getAllLocalMp3Songs();
  const targetSongs = allSongs.filter(s => songIds.includes(s.id));

  const results = [];
  for (const song of targetSongs) {
    const result = await normalizeLoudness(song, targetLoudness);
    results.push({ id: song.id, title: song.title, ...result });
  }

  return jsonResponse({ success: true, results });
});

import { createPlugin, jsonResponse } from '@songloft/plugin-sdk';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export default createPlugin({
  async init({ router, db }) {
    router.get('/songs', async () => {
      const songs = await db.songs.find({
        where: { type: 'local', file_path: { endsWith: '.mp3' } }
      });
      return jsonResponse(songs);
    });

    router.post('/normalize', async (req) => {
      const { songIds, targetLoudness = -16 } = req.body;
      const allSongs = await db.songs.find({
        where: { type: 'local', file_path: { endsWith: '.mp3' } }
      });
      const targetSongs = allSongs.filter(s => songIds.includes(s.id));
      
      const results = [];
      for (const song of targetSongs) {
        const inputPath = song.file_path;
        const dir = path.dirname(inputPath);
        const ext = path.extname(inputPath);
        const baseName = path.basename(inputPath, ext);
        const tempPath = path.join(dir, `${baseName}_normalized${ext}`);
        try {
          await execAsync(`ffmpeg -i "${inputPath}" -af "loudnorm=I=${targetLoudness}:LRA=11:TP=-1.5" -y "${tempPath}"`);
          await fs.rename(tempPath, inputPath);
          await db.songs.update({ id: song.id }, { file_path: inputPath });
          results.push({ id: song.id, title: song.title, success: true });
        } catch (e: any) {
          await fs.unlink(tempPath).catch(() => {});
          results.push({ id: song.id, title: song.title, success: false, error: e.message });
        }
      }
      return jsonResponse({ success: true, results });
    });
  }
});

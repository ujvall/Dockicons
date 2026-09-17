import { generateIconsSvg } from '../src/engine/renderer';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req: any, res: any) {
  try {
    const { i, theme, perline } = req.query;

    const iconIds = typeof i === 'string' ? i.split(',').filter(Boolean) : [];
    const safeTheme = theme === 'dark' ? 'dark' : 'light';
    const safePerLine = typeof perline === 'string' ? parseInt(perline, 10) : 15;

    const imageFetcher = async (imagePath: string) => {
      const relativePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
      const absolutePath = path.join(process.cwd(), 'public', relativePath);
      
      const fileBuffer = await fs.readFile(absolutePath);
      const ext = path.extname(absolutePath).slice(1);
      const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
      
      return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    };

    const svg = await generateIconsSvg({
      iconIds,
      theme: safeTheme,
      perLine: isNaN(safePerLine) || safePerLine < 1 ? 15 : safePerLine,
      imageFetcher
    });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate');
    
    res.status(200).send(svg);
  } catch (error) {
    console.error('Error generating SVG:', error);
    res.status(500).json({ error: 'Failed to generate SVG' });
  }
}

import { icons } from '../data/icons';
import type { IconData } from '../types/icons';

export interface RenderOptions {
  iconIds: string[];
  theme: 'light' | 'dark';
  perLine: number;
  imageFetcher: (path: string) => Promise<string>;
}

export const ICON_SIZE = 64;
export const GAP = 16;

export async function generateIconsSvg(options: RenderOptions): Promise<string> {
  const { iconIds, theme, perLine, imageFetcher } = options;

  const validIcons: IconData[] = iconIds
    .map(id => icons.find(icon => icon.id === id))
    .filter((icon): icon is NonNullable<typeof icon> => icon !== undefined);

  if (validIcons.length === 0) {
    return `<svg width="0" height="0" viewBox="0 0 0 0" xmlns="http://www.w3.org/2000/svg"></svg>`;
  }

  const columns = Math.min(validIcons.length, perLine);
  const rows = Math.ceil(validIcons.length / perLine);
  const width = (columns * ICON_SIZE) + ((columns - 1) * GAP);
  const height = (rows * ICON_SIZE) + ((rows - 1) * GAP);

  const imageElementsPromises = validIcons.map(async (icon, index) => {
    const col = index % perLine;
    const row = Math.floor(index / perLine);

    const x = col * (ICON_SIZE + GAP);
    const y = row * (ICON_SIZE + GAP);

    const imagePath = theme === 'light' ? icon.paths.light : icon.paths.dark;
    
    try {
      const base64Data = await imageFetcher(imagePath);
      return `<image href="${base64Data}" x="${x}" y="${y}" width="${ICON_SIZE}" height="${ICON_SIZE}" />`;
    } catch (e) {
      console.error(`Failed to fetch image for ${icon.id}:`, e);
      return ''; 
    }
  });

  const imageElements = (await Promise.all(imageElementsPromises)).filter(Boolean).join('\n    ');

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
    ${imageElements}
</svg>`;
}

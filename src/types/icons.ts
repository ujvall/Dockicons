export type IconCategory = 
  | 'language'
  | 'framework'
  | 'tool'
  | 'database'
  | 'service'
  | 'other';

export interface IconVariantPaths {
  light: string;
  dark: string;
}

export interface IconData {
  id: string; // e.g., 'react'
  displayName: string; // e.g., 'React'
  category: IconCategory;
  paths: IconVariantPaths;
}

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
  id: string;
  displayName: string;
  category: IconCategory;
  paths: IconVariantPaths;
}

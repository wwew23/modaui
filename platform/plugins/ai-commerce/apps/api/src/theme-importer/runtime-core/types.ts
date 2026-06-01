import { SourceLocation } from '../runtime-mapping/source-map';
import { Ownership } from '../runtime-mapping/ownership';

/** 设计 Tokens —— 这里只给出骨架，你可以细化 */
export type ColorTokenRef = {
  paletteId: string;
  key: string;
};

export type Responsive<T> = {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
};

export type SemanticColorTokens = {
  background: Responsive<ColorTokenRef>;
  surface: Responsive<ColorTokenRef>;
  textPrimary: Responsive<ColorTokenRef>;
  textSecondary: Responsive<ColorTokenRef>;
  accent: Responsive<ColorTokenRef>;
  [key: string]: Responsive<ColorTokenRef>;
};

export type TypographyToken = {
  fontFamily: string;
  fontSize: Responsive<string>;
  lineHeight: Responsive<string>;
  fontWeight: Responsive<number>;
};

export type SemanticTypographyTokens = {
  headingLg: TypographyToken;
  headingMd: TypographyToken;
  body: TypographyToken;
  caption: TypographyToken;
};

export type ThemeTokens = {
  colors: SemanticColorTokens;
  typography: SemanticTypographyTokens;
  spacing: Record<string, Responsive<string>>;
  radius: Record<string, Responsive<string>>;
};

export interface WithSourceAndOwnership {
  source?: SourceLocation;
  ownership: Ownership;
}

/** 布局树节点 - 扁平化存储 */
export interface BlockInstance extends WithSourceAndOwnership {
  id: string;
  type: string;
  settings: Record<string, any>;
  hash: {
    content: string;
    structure: string;
    export?: string;
  };
}

export interface SectionInstance extends WithSourceAndOwnership {
  id: string;
  type: string;
  settings: Record<string, any>;
  hash: {
    content: string;
    structure: string;
    export?: string;
  };
}

export interface PageRuntime {
  id: string;
  name: string;
  handle: string;
}

/** 整个主题的运行时状态 - 规范化图结构 (Normalized Graph) */
export interface ThemeRuntime {
  id: string;
  name: string;
  tokens: ThemeTokens;
  
  // 核心节点存储
  pages: Record<string, PageRuntime>;
  nodes: {
    sections: Record<string, SectionInstance>;
    blocks: Record<string, BlockInstance>;
  };
  
  // 关系映射 (Adjacency Lists)
  relations: {
    pageSections: Record<string, string[]>; // pageHandle -> sectionIds
    sectionBlocks: Record<string, string[]>; // sectionId -> blockIds
  };

  globalSettings: Record<string, any>;
  
  metadata: {
    revision: number; // 全局版本号
    importedAt: string;
    originalThemeId?: string;
    version: string;
  };
}

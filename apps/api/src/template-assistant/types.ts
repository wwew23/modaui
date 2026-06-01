export type StyleChanges = {
  spacing?: { multiplier: number };
  typography?: { fontFamily: string };
  colors?: { tone?: string; paletteHint?: string[] };
  sectionDensity?: 'sparse' | 'normal' | 'dense';
  [k: string]: any;
};

export type DSLPatch = {
  sectionId: string;
  changes: {
    style: StyleChanges;
    props: Record<string, any>;
  };
};

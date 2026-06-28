import * as React from 'react';

export interface SectionHeaderProps {
  /** Small uppercase Latin label above the title. */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  /** Phrase rendered in brand red, appended after the title. */
  highlight?: React.ReactNode;
  description?: React.ReactNode;
  /** @default "center" */
  align?: 'center' | 'left';
  /** Title typeface. @default "sans" */
  font?: 'sans' | 'serif' | 'display';
  style?: React.CSSProperties;
}

/** Signature section heading: eyebrow + title with a red highlight + lead. */
export function SectionHeader(props: SectionHeaderProps): JSX.Element;

import * as React from 'react';

export interface TagProps {
  children?: React.ReactNode;
  /** @default "neutral" */
  tone?: 'neutral' | 'brand' | 'seal' | 'outline';
  /** @default "md" */
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

/** Compact label for categories, statuses, and metadata. */
export function Tag(props: TagProps): JSX.Element;

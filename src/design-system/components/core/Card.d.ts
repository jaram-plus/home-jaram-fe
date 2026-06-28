import * as React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  /** Adds a hover lift for clickable cards. @default false */
  interactive?: boolean;
  /** Decorative red rule. @default "none" */
  accent?: 'none' | 'top';
  /** @default "lg" */
  padding?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

/** Paper surface for grouping related content. */
export function Card(props: CardProps): JSX.Element;

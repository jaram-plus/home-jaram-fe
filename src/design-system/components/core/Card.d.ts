import * as React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  /** Adds a hover lift for clickable cards. @default false */
  interactive?: boolean;
  /** @default "lg" */
  padding?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

/** Paper surface for grouping related content. */
export function Card(props: CardProps): JSX.Element;

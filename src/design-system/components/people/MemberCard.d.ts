import * as React from 'react';

/**
 * Props for the member portrait card.
 */
export interface MemberCardProps {
  name: React.ReactNode;
  /** Role / position, rendered in brand red. */
  role?: React.ReactNode;
  bio?: React.ReactNode;
  /** Photo URL. Falls back to the name's initial in the display font. */
  photo?: string;
  /** Skill / interest chips. */
  tags?: string[];
  style?: React.CSSProperties;
}

/**
 * Member portrait card for People / Featured surfaces.
 */
export function MemberCard(props: MemberCardProps): JSX.Element;

import * as React from 'react';

/**
 * Props for the primary action control on JARAM surfaces.
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual emphasis. @default "primary" */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Render as a link when provided. */
  href?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent) => void;
  /** Optional trailing icon/element (e.g. an arrow). */
  iconRight?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Primary action control for JARAM surfaces.
 */
export function Button(props: ButtonProps): JSX.Element;

import * as React from 'react';

export interface StatProps {
  /** The figure, e.g. 41, "1984", "500". */
  value: React.ReactNode;
  label: React.ReactNode;
  /** Small superscript after the value, e.g. "+". */
  suffix?: React.ReactNode;
  /** @default "center" */
  align?: 'center' | 'left';
  style?: React.CSSProperties;
}

/** Heritage figure: large serif numeral over a sans label. */
export function Stat(props: StatProps): JSX.Element;

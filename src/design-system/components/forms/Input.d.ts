import * as React from 'react';

export interface InputProps {
  label?: React.ReactNode;
  /** Helper text below the field. */
  hint?: React.ReactNode;
  /** Error message — overrides hint and turns the field red. */
  error?: React.ReactNode;
  /** @default "input" */
  as?: 'input' | 'textarea';
  id?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  type?: string;
  onChange?: (e: React.ChangeEvent) => void;
  style?: React.CSSProperties;
}

/** Labelled text field with hint/error states and a brand focus ring. */
export function Input(props: InputProps): JSX.Element;

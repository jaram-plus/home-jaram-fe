/**
 * JARAM Design System — barrel export.
 *
 * Usage in your app entry (once):
 *   import '@/design-system/styles.css';   // tokens + webfonts
 *
 * Then import components anywhere:
 *   import { Button, Card, MemberCard } from '@/design-system';
 *
 * Every component is a pure React function whose styling references the
 * CSS custom properties defined in styles.css. No runtime dependency
 * beyond React itself. Fonts load from CDN (see tokens/fonts.css).
 */

// core
export * from './components/core/Button';
export * from './components/core/Card';
export * from './components/core/SectionHeader';
export * from './components/core/Stat';
export * from './components/core/Tag';

// forms
export * from './components/forms/Input';

// people
export * from './components/people/MemberCard';

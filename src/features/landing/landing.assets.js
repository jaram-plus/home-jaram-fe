/**
 * Landing page assets — re-exported from the design-system asset folder so
 * the bundler fingerprints them and sections import by name (no string paths).
 *
 * Path alias `@` → `src` (see tsconfig / vite config). If you don't use the
 * alias, swap for a relative path: '../../design-system/assets/...'.
 */

import jaramMark from '@/design-system/assets/logos/jaram-mark.png';

import naver from '@/design-system/assets/companies/naver.png';
import kakao from '@/design-system/assets/companies/kakao.png';
import toss from '@/design-system/assets/companies/toss.webp';
import samsung from '@/design-system/assets/companies/samsung.png';
import ncsoft from '@/design-system/assets/companies/ncsoft.png';
import nexon from '@/design-system/assets/companies/nexon.jpg';
import aws from '@/design-system/assets/companies/aws.png';
import pearlabyss from '@/design-system/assets/companies/pearlabyss.png';

// Vite returns a URL string for `import x from '*.png'`; Next/webpack returns a
// StaticImageData object ({ src, width, height }). Normalize to a plain URL so
// the sections' <img src={...}> works under either bundler.
const url = (m) => (typeof m === 'string' ? m : m.src);

const jaramMarkUrl = url(jaramMark);
export { jaramMarkUrl as jaramMark };

export const ALUMNI_LOGOS = {
  naver: url(naver),
  kakao: url(kakao),
  toss: url(toss),
  samsung: url(samsung),
  ncsoft: url(ncsoft),
  nexon: url(nexon),
  aws: url(aws),
  pearlabyss: url(pearlabyss),
};

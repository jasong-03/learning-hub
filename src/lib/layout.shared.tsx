import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { appName } from './shared';

// Wordmark is 1958x427 after trimming; rendered 28px tall in the nav.
const LOGO_HEIGHT = 28;
const LOGO_WIDTH = Math.round((1958 / 427) * LOGO_HEIGHT);

/** Light and dark wordmarks: the "Learning" text is navy in the light variant and near-white in the dark one. */
function Logo() {
  return (
    <>
      <Image src="/brand/logo-light.png" alt={appName} width={LOGO_WIDTH} height={LOGO_HEIGHT} priority className="dark:hidden" />
      <Image src="/brand/logo-dark.png" alt={appName} width={LOGO_WIDTH} height={LOGO_HEIGHT} priority className="hidden dark:block" />
    </>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Logo />,
      url: '/dashboard',
    },
  };
}

/** Quick links back to the hub, shown above a course's own sidebar. */
export const hubLinks: BaseLayoutProps['links'] = [
  { text: 'Dashboard', url: '/dashboard', active: 'url' },
  { text: 'All courses', url: '/courses', active: 'url' },
  { text: 'Review', url: '/review', active: 'url' },
];

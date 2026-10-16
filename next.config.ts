import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import { LEGACY_REDIRECTS } from './src/config/legacy-redirects';

const withMDX = createMDX();

const config: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return LEGACY_REDIRECTS;
  },
};

export default withMDX(config);

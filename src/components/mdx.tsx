import type { ComponentProps } from 'react';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Admonition } from '@/components/admonition';

const DefaultImage = defaultMdxComponents.img;

/**
 * Remote images (badges and banners in imported GitHub Markdown) have no known
 * size at build time, so they render as plain <img>; local images keep the
 * optimized Fumadocs/Next image.
 */
function ContentImage(props: ComponentProps<'img'>) {
  if (typeof props.src === 'string' && /^https?:\/\//.test(props.src)) {
    // eslint-disable-next-line @next/next/no-img-element -- remote image of unknown size; next/image requires dimensions
    return <img {...props} alt={props.alt ?? ''} loading="lazy" className="inline-block" />;
  }
  return <DefaultImage {...(props as ComponentProps<typeof DefaultImage>)} />;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    img: ContentImage,
    Admonition,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

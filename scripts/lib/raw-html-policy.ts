/**
 * Raw HTML allowed in rendered content. Imported GitHub Markdown uses a few tags
 * (<details> reveals, centered <div> headers, <sub> footers, badge <img>/<a>);
 * everything else, any event-handler/style attribute, and javascript: URLs are
 * rejected at build time, because rehype-raw renders whatever passes.
 */
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  details: ['open'],
  summary: [],
  sub: [],
  sup: [],
  br: [],
  kbd: [],
  b: [],
  i: [],
  em: [],
  strong: [],
  code: [],
  p: ['align'],
  div: ['align'],
  span: [],
  img: ['src', 'alt', 'width', 'height'],
  a: ['href', 'name', 'id', 'title'],
};

// Opening or closing tag: captures "/" (closing), the tag name and the raw attribute text.
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g;
// One attribute: name, then an optional quoted or bare value.
const ATTRIBUTE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

export function findRawHtmlViolations(html: string): string[] {
  const violations: string[] = [];
  for (const [, , rawName, attributeText] of html.matchAll(TAG)) {
    const name = rawName.toLowerCase();
    const allowed = ALLOWED_ATTRIBUTES[name];
    if (!allowed) {
      violations.push(`<${name}> is not allowed`);
      continue;
    }
    for (const [, attribute, doubleQuoted, singleQuoted, bare] of attributeText.replace(/\/\s*$/, '').matchAll(ATTRIBUTE)) {
      const value = doubleQuoted ?? singleQuoted ?? bare ?? '';
      if (!allowed.includes(attribute.toLowerCase())) violations.push(`<${name} ${attribute}> attribute is not allowed`);
      else if (/^\s*(javascript|data|vbscript):/i.test(value)) violations.push(`<${name} ${attribute}> uses a script URL`);
    }
  }
  return violations;
}

/** Anchor targets created by raw HTML, e.g. <a name="top"> or <a id="x">. */
export function rawHtmlAnchors(html: string): string[] {
  return [...html.matchAll(/<a\s[^>]*\b(?:name|id)="([^"]+)"/g)].map((match) => match[1]);
}

/** href/src values in an HTML string, for link checking. */
export function htmlLinkTargets(html: string): string[] {
  return [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
}

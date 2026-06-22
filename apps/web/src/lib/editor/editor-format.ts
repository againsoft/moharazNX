export const BLOCK_FORMATS = [
  { value: "p", label: "Paragraph" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "h4", label: "Heading 4" },
] as const;

export type BlockFormat = (typeof BLOCK_FORMATS)[number]["value"];

const BLOCK_TAGS = new Set(BLOCK_FORMATS.map((item) => item.value));

export function getCurrentBlockFormat(container: HTMLElement | null): BlockFormat {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !container) return "p";

  let node: Node | null = selection.getRangeAt(0).commonAncestorContainer;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }

  while (node && node !== container) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = (node as Element).tagName.toLowerCase();
      if (BLOCK_TAGS.has(tag as BlockFormat)) {
        return tag as BlockFormat;
      }
    }
    node = node.parentElement;
  }

  return "p";
}

export function applyBlockFormat(tag: BlockFormat) {
  document.execCommand("formatBlock", false, tag === "p" ? "<p>" : `<${tag}>`);
}

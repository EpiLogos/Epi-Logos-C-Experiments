import { Mark, mergeAttributes } from '@tiptap/core';

export interface HighlightAttributes {
  id: string;
  category: 'daily-note' | 'oracle' | 'dream' | 'expand' | string;
  timestamp: number;
  originalText: string;
  label?: string;
  color?: string;
}

export interface ExtractedHighlight extends HighlightAttributes {
  from: number;
  to: number;
  text: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    highlight: {
      setHighlight: (attributes: HighlightAttributes) => ReturnType;
      unsetHighlight: () => ReturnType;
      toggleHighlight: (attributes: HighlightAttributes) => ReturnType;
    };
  }
}

export const HighlightMark = Mark.create<{}, HighlightAttributes>({
  name: 'highlight',

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-highlight-id'),
        renderHTML: attributes => ({
          'data-highlight-id': attributes.id
        })
      },
      category: {
        default: 'daily-note',
        parseHTML: element => element.getAttribute('data-category'),
        renderHTML: attributes => ({
          'data-category': attributes.category
        })
      },
      timestamp: {
        default: Date.now(),
        parseHTML: element => parseInt(element.getAttribute('data-timestamp') || '0'),
        renderHTML: attributes => ({
          'data-timestamp': attributes.timestamp
        })
      },
      originalText: {
        default: '',
        parseHTML: element => element.getAttribute('data-original-text'),
        renderHTML: attributes => ({
          'data-original-text': attributes.originalText
        })
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-highlight-label'),
        renderHTML: attributes => (attributes.label ? { 'data-highlight-label': attributes.label } : {})
      },
      color: {
        default: null,
        parseHTML: element => element.getAttribute('data-highlight-color'),
        renderHTML: attributes => (attributes.color ? { 'data-highlight-color': attributes.color } : {})
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'mark[data-highlight-id]',
        getAttrs: element => {
          if (typeof element === 'string') return false;
          const el = element as HTMLElement;
          return {
            id: el.getAttribute('data-highlight-id'),
            category: el.getAttribute('data-category'),
            timestamp: parseInt(el.getAttribute('data-timestamp') || '0'),
            originalText: el.getAttribute('data-original-text'),
            label: el.getAttribute('data-highlight-label'),
            color: el.getAttribute('data-highlight-color')
          };
        }
      }
    ];
  },

  renderHTML({ HTMLAttributes, mark }) {
    const accentColor = mark.attrs.color || undefined;
    const attrs = mergeAttributes(
      HTMLAttributes,
      {
        class: `highlight highlight-${mark.attrs.category}`,
        'data-highlight-id': mark.attrs.id,
        ...(accentColor ? { style: `--highlight-accent:${accentColor};` } : {})
      }
    );
    return ['mark', attrs, 0];
  },

  addCommands() {
    return {
      setHighlight: (attributes: HighlightAttributes) => ({ commands }) => {
        return commands.setMark('highlight', attributes);
      },
      unsetHighlight: () => ({ commands }) => {
        return commands.unsetMark('highlight');
      },
      toggleHighlight: (attributes: HighlightAttributes) => ({ commands }) => {
        return commands.toggleMark('highlight', attributes);
      }
    };
  }
});

// Utility to extract all highlights from document
export function extractHighlights(doc: any): ExtractedHighlight[] {
  const highlights: ExtractedHighlight[] = [];

  doc.descendants((node: any, pos: number) => {
    if (!node.marks) return;
    if (!node.isText) return;

    node.marks.forEach((mark: any) => {
      if (mark.type.name === 'highlight') {
        const text = node.text || mark.attrs.originalText || '';
        highlights.push({
          id: mark.attrs.id,
          category: mark.attrs.category,
          timestamp: mark.attrs.timestamp,
          originalText: mark.attrs.originalText || text,
          label: mark.attrs.label || undefined,
          color: mark.attrs.color || undefined,
          from: pos,
          to: pos + text.length,
          text,
        });
      }
    });
  });

  return highlights;
}

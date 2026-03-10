import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

export interface FloatingMenuState {
  isOpen: boolean;
  rect: DOMRect | null;
  selectedText: string;
}

export const FloatingMenuPluginKey = new PluginKey<FloatingMenuState>('floatingMenu');

export interface FloatingMenuOptions {
  onOpen: (state: FloatingMenuState) => void;
  onClose: () => void;
}

const CLOSED_STATE: FloatingMenuState = {
  isOpen: false,
  rect: null,
  selectedText: '',
};

function makeSelectionRect(editorView: EditorView, from: number, to: number): DOMRect {
  const startCoords = editorView.coordsAtPos(from);
  const endCoords = editorView.coordsAtPos(to);

  const left = Math.min(startCoords.left, endCoords.left);
  const top = Math.min(startCoords.top, endCoords.top);
  const right = Math.max(startCoords.right ?? endCoords.right ?? endCoords.left, endCoords.right ?? endCoords.left);
  const bottom = Math.max(startCoords.bottom, endCoords.bottom);
  const width = Math.max(1, right - left);
  const height = Math.max(1, bottom - top);

  if (typeof DOMRect !== 'undefined' && typeof DOMRect.fromRect === 'function') {
    return DOMRect.fromRect({ x: left, y: top, width, height });
  }

  return {
    x: left,
    y: top,
    left,
    top,
    right,
    bottom,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect;
}

export const FloatingMenuExtension = Extension.create<FloatingMenuOptions>({
  name: 'floatingMenu',

  addOptions() {
    return {
      onOpen: () => {},
      onClose: () => {},
    };
  },

  addProseMirrorPlugins() {
    const options = this.options;

    return [
      new Plugin<FloatingMenuState>({
        key: FloatingMenuPluginKey,
        state: {
          init() {
            return CLOSED_STATE;
          },
          apply(tr, value) {
            const meta = tr.getMeta(FloatingMenuPluginKey) as FloatingMenuState | undefined;
            return meta ?? value;
          },
        },
        view(editorView) {
          const closeMenu = () => {
            const tr = editorView.state.tr.setMeta(FloatingMenuPluginKey, CLOSED_STATE);
            editorView.dispatch(tr);
            options.onClose();
          };

          const handleMouseUp = () => {
            window.setTimeout(() => {
              const { state } = editorView;
              const { selection } = state;

              if (selection.empty) {
                closeMenu();
                return;
              }

              const selectedText = state.doc.textBetween(selection.from, selection.to).trim();
              if (!selectedText) {
                closeMenu();
                return;
              }

              const nextState: FloatingMenuState = {
                isOpen: true,
                rect: makeSelectionRect(editorView, selection.from, selection.to),
                selectedText,
              };

              const tr = editorView.state.tr.setMeta(FloatingMenuPluginKey, nextState);
              editorView.dispatch(tr);
              options.onOpen(nextState);
            }, 10);
          };

          const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
              closeMenu();
            }
          };

          document.addEventListener('mouseup', handleMouseUp);
          document.addEventListener('keydown', handleKeyDown);

          return {
            destroy() {
              document.removeEventListener('mouseup', handleMouseUp);
              document.removeEventListener('keydown', handleKeyDown);
            },
          };
        },
      }),
    ];
  },
});

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import { useEffect, useRef, useState, useCallback } from 'react';
import { HighlightMark, extractHighlights } from '../editor/extensions/highlightMark';
import { FloatingMenuExtension, type FloatingMenuState } from '../editor/extensions/floatingMenu';
import { FloatingMenu } from '../editor/components/FloatingMenu';
import './NaraEditor.css';

interface NaraEditorProps {
  content: string;
  onChange: (content: string) => void;
  onHighlightsChange?: (highlights: ReturnType<typeof extractHighlights>) => void;
  placeholder?: string;
  focusMode?: boolean;
  className?: string;
  onTypingChange?: (isTyping: boolean) => void;
  formattingToolbarVisible?: boolean;
  onToggleFormattingToolbar?: () => void;
  onSendToAgent?: (action: 'chat' | 'oracle' | 'dream' | 'expand', text: string) => void;
}

// Custom keyboard shortcuts extension
const CustomKeybindings = Extension.create({
  name: 'customKeybindings',
  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.chain().focus().toggleBold().run(),
      'Mod-i': () => this.editor.chain().focus().toggleItalic().run(),
      'Mod-k': () => this.editor.chain().focus().toggleCode().run(),
      'Mod-u': () => this.editor.chain().focus().toggleStrike().run(),
    };
  },
});

export function NaraEditor({
  content,
  onChange,
  onHighlightsChange,
  placeholder = 'Write stream, highlight text for Context Menu...',
  focusMode = true,
  className = '',
  onTypingChange,
  formattingToolbarVisible = true,
  onToggleFormattingToolbar,
  onSendToAgent
}: NaraEditorProps) {
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const lastEditorUpdateRef = useRef<string>('');
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [floatingMenuState, setFloatingMenuState] = useState<FloatingMenuState>({
    isOpen: false,
    rect: null,
    selectedText: '',
  });

  const handleFloatingMenuOpen = useCallback((state: FloatingMenuState) => {
    setFloatingMenuState(state);
    if (!formattingToolbarVisible) onToggleFormattingToolbar?.();
  }, [formattingToolbarVisible, onToggleFormattingToolbar]);

  const handleFloatingMenuClose = useCallback(() => {
    setFloatingMenuState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleHighlight = useCallback(() => {
    if (!editor) return;
    onHighlightsChange?.(extractHighlights(editor.state.doc));
  }, [onHighlightsChange]);

  const handleSendToAgent = useCallback(
    (action: 'chat' | 'oracle' | 'dream' | 'expand') => {
      onSendToAgent?.(action, floatingMenuState.selectedText);
    },
    [onSendToAgent, floatingMenuState.selectedText]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        heading: { levels: [1, 2, 3] },
      }),
      HighlightMark,
      FloatingMenuExtension.configure({
        onOpen: handleFloatingMenuOpen,
        onClose: handleFloatingMenuClose,
      }),
      CustomKeybindings,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty'
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEditorUpdateRef.current = html;
      onChange(html);
      onHighlightsChange?.(extractHighlights(editor.state.doc));
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none font-playfair text-[18px] leading-[1.8] text-[var(--text-primary)] placeholder:font-light placeholder:italic placeholder:text-[var(--text-secondary)]/50 ${focusMode ? 'min-h-[500px]' : 'min-h-[300px]'}`,
        'data-testid': 'nara-editor'
      },
      handleClick: (view) => {
        view.focus();
        return false;
      }
    }
  });

  // Typewriter scrolling (basic implementation)
  const scrollToCursor = useCallback(() => {
    if (!editor || !focusMode) return;

    const { view } = editor;
    const coords = view.coordsAtPos(view.state.selection.from);
    const scrollContainer = view.dom.closest('.custom-scrollbar') as HTMLElement;

    if (!scrollContainer) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    const targetY = containerRect.top + (containerRect.height * 0.4);

    if (coords.top > targetY) {
      scrollContainer.scrollTop += coords.top - targetY;
    }
  }, [editor, focusMode]);

  useEffect(() => {
    if (!editor) return;

    editor.on('selectionUpdate', scrollToCursor);
    return () => {
      editor.off('selectionUpdate', scrollToCursor);
    };
  }, [editor, scrollToCursor]);

  // Update content when prop changes
  useEffect(() => {
    if (!editor) return;

    const currentContent = editor.getHTML();
    if (content !== lastEditorUpdateRef.current && currentContent !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  // Typing detection with 1 second timeout
  useEffect(() => {
    if (!editor || !onTypingChange) return;

    const handleUpdate = () => {
      onTypingChange(true);
      if (typingTimeout) clearTimeout(typingTimeout);
      const timeout = setTimeout(() => {
        onTypingChange(false);
      }, 1000);
      setTypingTimeout(timeout);
    };

    editor.on('update', handleUpdate);

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      editor.off('update', handleUpdate);
    };
  }, [editor, onTypingChange]);

  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [typingTimeout]);

  useEffect(() => {
    if (!formattingToolbarVisible || !onToggleFormattingToolbar) return;

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (wrapperRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest('[data-testid="floating-action-menu"]')) return;
      onToggleFormattingToolbar();
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [formattingToolbarVisible, onToggleFormattingToolbar]);

  // Formatting toolbar for selected text
  const FormattingToolbar = editor && {
    Bold: () => (
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded ${editor.isActive('bold') ? 'bg-[var(--text-primary)]/20 text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
        aria-label="Bold"
      >
        <strong>B</strong>
      </button>
    ),
    Italic: () => (
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded ${editor.isActive('italic') ? 'bg-[var(--text-primary)]/20 text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
        aria-label="Italic"
      >
        <em>I</em>
      </button>
    ),
    Strike: () => (
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1 rounded ${editor.isActive('strike') ? 'bg-[var(--text-primary)]/20 text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
        aria-label="Strikethrough"
      >
        <s>S</s>
      </button>
    ),
    Code: () => (
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1 rounded font-mono text-xs ${editor.isActive('code') ? 'bg-[var(--text-primary)]/20 text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
        aria-label="Inline code"
      >
        {'<>'}
      </button>
    ),
    H1: () => (
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1 rounded text-xs ${editor.isActive('heading', { level: 1 }) ? 'bg-[var(--text-primary)]/20 text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
        aria-label="Heading 1"
      >
        H1
      </button>
    ),
    H2: () => (
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1 rounded text-xs ${editor.isActive('heading', { level: 2 }) ? 'bg-[var(--text-primary)]/20 text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
        aria-label="Heading 2"
      >
        H2
      </button>
    ),
    H3: () => (
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1 rounded text-xs ${editor.isActive('heading', { level: 3 }) ? 'bg-[var(--text-primary)]/20 text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
        aria-label="Heading 3"
      >
        H3
      </button>
    ),
    BulletList: () => (
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-[var(--text-primary)]/20 text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
        aria-label="Bullet list"
      >
        •
      </button>
    ),
    OrderedList: () => (
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-[var(--text-primary)]/20 text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
        aria-label="Numbered list"
      >
        1.
      </button>
    ),
  };

  const toolbarGroups = editor
    ? [
        [FormattingToolbar.Bold, FormattingToolbar.Italic, FormattingToolbar.Strike, FormattingToolbar.Code],
        [FormattingToolbar.H1, FormattingToolbar.H2, FormattingToolbar.H3],
        [FormattingToolbar.BulletList, FormattingToolbar.OrderedList],
      ]
    : [];

  return (
    <div ref={wrapperRef} className={`relative z-10 w-full ${focusMode ? 'min-h-[500px]' : ''} ${className}`} data-testid="nara-editor-wrapper">
      <div className="sticky top-0 z-20 mb-1 flex h-9 items-center justify-end gap-1 pr-0.5">
        {editor && (
          <div
            className={`origin-right transition-all duration-200 ease-out ${
              formattingToolbarVisible
                ? 'pointer-events-auto translate-x-0 opacity-100 scale-100'
                : 'pointer-events-none translate-x-1 opacity-0 scale-95'
            }`}
          >
            <div className="flex h-8 items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-panel)]/92 px-1.5 py-0.5 shadow-[0_4px_14px_rgba(0,0,0,0.08)] backdrop-blur-md">
            {toolbarGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="flex items-center gap-1">
                {group.map((Component, index) => (
                  <Component key={`${groupIndex}-${index}`} />
                ))}
                {groupIndex < toolbarGroups.length - 1 && <div className="mx-1 h-5 w-px bg-[var(--border-subtle)]" />}
              </div>
            ))}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleFormattingToolbar}
          aria-label={formattingToolbarVisible ? 'Hide formatting toolbar' : 'Show formatting toolbar'}
          aria-pressed={formattingToolbarVisible}
          className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-panel)]/88 text-[var(--text-primary)] shadow-sm backdrop-blur-sm transition hover:opacity-100 opacity-70"
          data-testid="nara-pencil-button"
          title="Toggle formatting toolbar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z"/>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
            <path d="M2 2l7.586 7.586"/>
            <circle cx="11" cy="11" r="2"/>
          </svg>
        </button>
      </div>

      <EditorContent editor={editor} className="prose prose-invert max-w-none focus:outline-none min-h-full" />
      <FloatingMenu
        editor={editor as any}
        state={floatingMenuState}
        onClose={handleFloatingMenuClose}
        onHighlight={handleHighlight}
        onSendToAgent={handleSendToAgent}
      />
    </div>
  );
}

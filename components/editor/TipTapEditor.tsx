"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import { useState, useEffect } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { cn } from '@/lib/utils';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onRephrase?: (selectedText: string) => Promise<string>;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
}

export function TipTapEditor({
  content,
  onChange,
  onRephrase,
  placeholder = "Start writing...",
  className = "",
  showToolbar = true
}: TipTapEditorProps) {

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Typography,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-6 overflow-y-auto',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Set content without emitting update to prevent auto-save loops
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className={cn("relative flex flex-col h-full", className)}>
        <div className="prose prose-lg max-w-none min-h-[400px] p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative flex flex-col h-full", className)}>
      {/* Toolbar - Always visible at the top */}
      {showToolbar && <EditorToolbar editor={editor} />}

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent
          editor={editor}
          className="h-full min-h-[500px] prose prose-lg max-w-none focus:outline-none p-6"
        />
      </div>

      {/* Character Count */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white px-2 py-1 rounded border shadow-sm">
        {editor.storage.characterCount.characters()} characters, {editor.storage.characterCount.words()} words
      </div>
    </div>
  );
}
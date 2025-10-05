"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Wand2,
  ChevronDown
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onRephrase?: (selectedText: string) => Promise<string>;
  placeholder?: string;
  className?: string;
}

export function TipTapEditor({ 
  content, 
  onChange, 
  onRephrase,
  placeholder = "Start writing...",
  className = ""
}: TipTapEditorProps) {
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [showBubbleMenu, setShowBubbleMenu] = useState(false);
  const [bubbleMenuPosition, setBubbleMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');

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
    onSelectionUpdate: ({ editor }) => {
      // Delay to ensure selection is stable
      setTimeout(() => {

        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        
        if (window.getSelection()?.isCollapsed === false && 
            document.getSelection()?.toString() !== text) {
          return; // Still selecting, don't show menu yet
        }

        if (text.trim() && from !== to) {
          setSelectedText(text);
          setShowBubbleMenu(true);
          
          // Get selection coordinates
          const { view } = editor;
          const start = view.coordsAtPos(from);
          const end = view.coordsAtPos(to);
          
          setBubbleMenuPosition({
            x: (start.left + end.left) / 2,
            y: end.bottom + 10 
          });
        } else if (!text.trim()) {
          setShowBubbleMenu(false);
          setSelectedText('');
        }
      }, 100);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-6 overflow-y-auto',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleRephrase = useCallback(async () => {
    if (!editor || !onRephrase || !selectedText.trim()) return;
    
    setIsRephrasing(true);
    try {
      const rephrasedText = await onRephrase(selectedText);
      editor.chain().focus().deleteSelection().insertContent(rephrasedText).run();
      setShowBubbleMenu(false);
    } catch (error) {
      console.error('Error rephrasing:', error);
    } finally {
      setIsRephrasing(false);
    }
  }, [editor, onRephrase, selectedText]);

  const handleClickOutside = useCallback(() => {
    // Don't hide immediately, check if we're still selecting
    setTimeout(() => {
      if (!window.getSelection()?.toString().trim()) {
        setShowBubbleMenu(false);
      }
    }, 200);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleClickOutside);
    document.addEventListener('keyup', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
      document.removeEventListener('keyup', handleClickOutside);
    };
  }, [showBubbleMenu, handleClickOutside]);

  if (!editor) {
    return (
      <div className={cn("relative", className)}>
        <div className="prose prose-lg max-w-none min-h-[400px] p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Custom Bubble Menu */}
      {showBubbleMenu && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1"
          style={{
            left: `${bubbleMenuPosition.x}px`,
            top: `${bubbleMenuPosition.y}px`,
            transform: 'translateX(-50%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Text Formatting */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('bold') ? 'bg-gray-100' : ''
            )}
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('italic') ? 'bg-gray-100' : ''
            )}
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('strike') ? 'bg-gray-100' : ''
            )}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('code') ? 'bg-gray-100' : ''
            )}
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Headings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <span className="text-sm">
                  {editor.isActive('heading', { level: 1 }) ? 'H1' :
                   editor.isActive('heading', { level: 2 }) ? 'H2' :
                   editor.isActive('heading', { level: 3 }) ? 'H3' : 'P'}
                </span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={editor.isActive('paragraph') ? 'bg-gray-100' : ''}
              >
                Paragraph
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-100' : ''}
              >
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''}
              >
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-100' : ''}
              >
                <Heading3 className="h-4 w-4 mr-2" />
                Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Lists */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('bulletList') ? 'bg-gray-100' : ''
            )}
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('orderedList') ? 'bg-gray-100' : ''
            )}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('blockquote') ? 'bg-gray-100' : ''
            )}
          >
            <Quote className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Alignment */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100' : ''
            )}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100' : ''
            )}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100' : ''
            )}
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Rephrase Button */}
          {onRephrase && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRephrase}
              disabled={isRephrasing}
              className="h-8 px-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              <Wand2 className="h-3 w-3 mr-1" />
              {isRephrasing ? 'Rephrasing...' : 'Rephrase'}
            </Button>
          )}
        </div>
      )}

      {/* Editor Content */}
      <div className="h-full overflow-y-auto">
        <EditorContent 
          editor={editor} 
          className="h-full min-h-[500px] prose prose-lg max-w-none focus:outline-none p-6"
        />
      </div>
      
      {/* Character Count */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white px-2 py-1 rounded border">
        {editor.storage.characterCount.characters()} characters, {editor.storage.characterCount.words()} words
      </div>
    </div>
  );
}
'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle, FontFamily, FontSize } from '@tiptap/extension-text-style';
import { Image } from '@tiptap/extension-image';
import { useRef } from 'react';

const FONTS = [
  { label: 'Default', value: '' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Sans', value: 'Arial, sans-serif' },
  { label: 'Mono', value: 'Courier New, monospace' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
];

const SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'];

const Divider = () => <div className="w-px h-5 bg-gray-300 mx-1 flex-shrink-0" />;

const ToolbarButton = ({ onClick, active, title, children }) => (
  <button type="button" onClick={onClick} title={title}
    className={`p-1.5 rounded text-sm font-medium transition-colors flex-shrink-0 ${active ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
    {children}
  </button>
);

export default function RichTextEditor({ value, onChange, placeholder = 'Tulis deskripsi atau artikel...' }) {
  const fileInputRef = useRef(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      FontFamily,
      FontSize,
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      editor.chain().focus().setImage({ src: ev.target.result, alt: file.name }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const currentFont = editor.getAttributes('textStyle').fontFamily || '';
  const currentSize = editor.getAttributes('textStyle').fontSize || '';

  return (
    <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-gray-50 border-b">

        {/* Font Family */}
        <select
          value={currentFont}
          onChange={(e) => {
            const val = e.target.value;
            if (val) editor.chain().focus().setFontFamily(val).run();
            else editor.chain().focus().unsetFontFamily().run();
          }}
          className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white text-gray-700 focus:outline-none focus:border-green-500 h-7"
          title="Font"
        >
          {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        {/* Font Size */}
        <select
          value={currentSize}
          onChange={(e) => {
            const val = e.target.value;
            if (val) editor.chain().focus().setFontSize(val).run();
            else editor.chain().focus().unsetFontSize().run();
          }}
          className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white text-gray-700 focus:outline-none focus:border-green-500 h-7 w-16"
          title="Ukuran Font"
        >
          <option value="">Size</option>
          {SIZES.map(s => <option key={s} value={s}>{s.replace('px', '')}</option>)}
        </select>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <span className="underline">U</span>
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          H3
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          • List
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
          1. List
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Rata Kiri">
          ≡←
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Rata Tengah">
          ≡↔
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Rata Kanan">
          ≡→
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          ❝
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Garis Pemisah">
          —
        </ToolbarButton>

        <Divider />

        {/* Insert Image */}
        <button type="button" title="Sisipkan Gambar ke Artikel"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100 flex-shrink-0 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">Gambar</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">↩</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">↪</ToolbarButton>
      </div>

      {/* Editor Area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
      />

      <style jsx global>{`
        .ProseMirror { outline: none; min-height: 200px; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left; color: #9ca3af; pointer-events: none; height: 0;
        }
        .ProseMirror h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.5rem; color: #166534; }
        .ProseMirror h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; color: #15803d; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror blockquote { border-left: 4px solid #16a34a; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 0.5rem 0; }
        .ProseMirror hr { border: none; border-top: 2px solid #e5e7eb; margin: 1rem 0; }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror u { text-decoration: underline; }
        .ProseMirror img { max-width: 100%; border-radius: 0.5rem; margin: 1rem auto; display: block; cursor: default; }
      `}</style>
    </div>
  );
}

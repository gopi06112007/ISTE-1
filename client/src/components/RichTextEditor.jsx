import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const RichTextEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '<p>Start writing here...</p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[250px] px-4 py-3 bg-[#EEF1F5] shadow-clay-inset rounded-b-clay-sm font-semibold text-slate-800',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const MenuBar = () => {
    return (
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#EEF1F5] shadow-clay-sm rounded-t-clay-sm select-none">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-clay-sm text-sm font-black transition-all duration-300 active:scale-95 ${
            editor.isActive('bold') ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-pressed' : 'text-slate-600 hover:text-slate-850 hover:shadow-clay-sm'
          }`}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-clay-sm text-sm italic font-extrabold transition-all duration-300 active:scale-95 ${
            editor.isActive('italic') ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-pressed' : 'text-slate-600 hover:text-slate-850 hover:shadow-clay-sm'
          }`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-clay-sm text-sm line-through font-extrabold transition-all duration-300 active:scale-95 ${
            editor.isActive('strike') ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-pressed' : 'text-slate-600 hover:text-slate-850 hover:shadow-clay-sm'
          }`}
          title="Strike"
        >
          S
        </button>
        <div className="w-[1.5px] h-6 bg-slate-300 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded-clay-sm text-xs font-black transition-all duration-300 active:scale-95 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-pressed' : 'text-slate-600 hover:text-slate-850 hover:shadow-clay-sm'
          }`}
          title="H1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-clay-sm text-xs font-black transition-all duration-300 active:scale-95 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-pressed' : 'text-slate-600 hover:text-slate-850 hover:shadow-clay-sm'
          }`}
          title="H2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-clay-sm text-xs font-black transition-all duration-300 active:scale-95 ${
            editor.isActive('heading', { level: 3 }) ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-pressed' : 'text-slate-600 hover:text-slate-850 hover:shadow-clay-sm'
          }`}
          title="H3"
        >
          H3
        </button>
        <div className="w-[1.5px] h-6 bg-slate-300 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-clay-sm text-sm font-extrabold transition-all duration-300 active:scale-95 ${
            editor.isActive('bulletList') ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-pressed' : 'text-slate-600 hover:text-slate-850 hover:shadow-clay-sm'
          }`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-clay-sm text-sm font-extrabold transition-all duration-300 active:scale-95 ${
            editor.isActive('orderedList') ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-pressed' : 'text-slate-600 hover:text-slate-850 hover:shadow-clay-sm'
          }`}
          title="Ordered List"
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-clay-sm text-sm font-extrabold transition-all duration-300 active:scale-95 ${
            editor.isActive('blockquote') ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-pressed' : 'text-slate-600 hover:text-slate-850 hover:shadow-clay-sm'
          }`}
          title="Blockquote"
        >
          “ Quote
        </button>
        <div className="w-[1.5px] h-6 bg-slate-300 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-1.5 rounded-clay-sm text-sm text-slate-500 font-extrabold hover:text-slate-850 hover:shadow-clay-sm active:shadow-clay-pressed disabled:opacity-50 transition-all duration-300"
          title="Undo"
        >
          ↩
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-1.5 rounded-clay-sm text-sm text-slate-500 font-extrabold hover:text-slate-850 hover:shadow-clay-sm active:shadow-clay-pressed disabled:opacity-50 transition-all duration-300"
          title="Redo"
        >
          ↪
        </button>
      </div>
    );
  };

  return (
    <div className="w-full text-left">
      <MenuBar />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;

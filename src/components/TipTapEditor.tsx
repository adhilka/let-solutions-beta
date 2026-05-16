import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Bold, Italic, List, ListOrdered, Code, Quote, Undo, Redo, Link as LinkIcon, Image as ImageIcon, FileText } from 'lucide-react'
import { useState, useRef } from 'react'

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // get markdown or html? We can use html for now since TipTap handles it
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/github/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (data.success && data.url) {
        // insert link to file
        editor.chain().focus().insertContent(`<a href="${data.url}" target="_blank" rel="noopener noreferrer">${data.name}</a>&nbsp;`).run();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { uploadToImgBB } = await import('../lib/imgbb');
      const res = await uploadToImgBB(file);
      // insert image
      editor.chain().focus().insertContent(`<img src="${res.url}" alt="${file.name}" />&nbsp;`).run();
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col">
      <div className="bg-slate-50 border-b p-2 flex flex-wrap gap-1 items-center">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}>
          <Bold size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}>
          <Italic size={16} />
        </button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 px-2 rounded font-bold hover:bg-slate-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-1.5 px-2 rounded font-bold hover:bg-slate-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}>
          H3
        </button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}>
          <List size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}>
          <ListOrdered size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('blockquote') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}>
          <Quote size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('codeBlock') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}>
          <Code size={16} />
        </button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        
        <button type="button" onClick={() => imageInputRef.current?.click()} disabled={isUploading} className="p-1.5 px-2 rounded text-sm font-medium hover:bg-slate-200 text-slate-600 flex items-center gap-1">
          <ImageIcon size={16} /> Image
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-1.5 px-2 rounded text-sm font-medium hover:bg-slate-200 text-slate-600 flex items-center gap-1">
          <FileText size={16} /> {isUploading ? 'Uploading...' : 'Attach File (GitHub)'}
        </button>
        
        <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        
        <div className="flex-1"></div>
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-1.5 rounded hover:bg-slate-200 text-slate-600">
          <Undo size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-1.5 rounded hover:bg-slate-200 text-slate-600">
          <Redo size={16} />
        </button>
      </div>
      <div className="p-4 flex-1 prose max-w-none prose-sm sm:prose-base min-h-[400px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

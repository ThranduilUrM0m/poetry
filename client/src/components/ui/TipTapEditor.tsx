// components/ui/TipTapEditor.tsx
'use client';
import React, { useEffect, useImperativeHandle, forwardRef, useState, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFontList, selectFontList } from '@/slices/fontsSlice';
import type { AppDispatch } from '@/store';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Dropcursor from '@tiptap/extension-dropcursor';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import FontSize from '@tiptap/extension-font-size';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import ImageResize from 'tiptap-extension-resize-image';
import { compressImage } from '@/utils/imageCompression';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Image as ImageIcon,
} from 'lucide-react';

export type TipTapEditorHandle = {
    getContent: () => string;
};

interface TipTapEditorProps {
    value?: string;
    forceReset?: boolean;
    onChange?: (html: string) => void;
}

const TipTapEditor = forwardRef<TipTapEditorHandle, TipTapEditorProps>(
    ({ value = '', forceReset = false, onChange }, ref) => {
        const dispatch = useDispatch<AppDispatch>();
        const fonts = useSelector(selectFontList);

        useEffect(() => {
            dispatch(fetchFontList());
        }, [dispatch]);

        const [currentFont, setCurrentFont] = useState<string>('');
        const [currentSize, setCurrentSize] = useState<string>('');

        const editor = useEditor({
            extensions: [
                StarterKit,
                Dropcursor,
                TextStyle,
                FontFamily.configure({ types: ['textStyle'] }),
                FontSize.configure({ types: ['textStyle'] }),
                TextAlign.configure({ types: ['heading', 'paragraph'] }),
                Link.configure({ openOnClick: true }),
                Underline,
                Subscript,
                Superscript,
                Placeholder.configure({ placeholder: 'Tell your story...' }),

                // Image with resize handles & float toolbar
                Image.configure({ inline: false }),
                ImageResize.configure({
                    // optional: set minimum / maximum dimensions
                    handleSize: 8,
                    enforceMaxWidth: true,
                }),
            ],
            content: value,
            onUpdate({ editor }) {
                onChange?.(editor.getHTML());
            },
        });

        useImperativeHandle(ref, () => ({ getContent: () => editor?.getHTML() || '' }), [editor]);

        useEffect(() => {
            if (!editor) return;
            if (forceReset) editor.commands.clearContent();
            if (value !== editor.getHTML()) {
                editor.commands.setContent(value, false);
            }
        }, [value, forceReset, editor]);

        const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !editor) return;
            const compressed = await compressImage(file);
            const form = new FormData();
            form.append('file', compressed);
            form.append(
                'upload_preset',
                process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string
            );
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: form }
            );
            const data = await res.json();
            if (data.secure_url) {
                editor
                    .chain()
                    .focus()
                    .setImage({ src: data.secure_url }) // insert the image
                    .updateAttributes('image', { float: 'none' }) // then apply our custom float
                    .run();
            }
        };

        const applyFont = (slug: string) => {
            setCurrentFont(slug);
            editor?.chain().focus().setMark('textStyle', { fontFamily: slug }).run();
        };
        const applySize = (size: string) => {
            setCurrentSize(size);
            editor
                ?.chain()
                .focus()
                .setMark('textStyle', { fontSize: `${size}pt` })
                .run();
        };

        return (
            <>
                <div className="tiptap-toolbar flex flex-wrap items-center gap-2 p-2 border-b bg-white shadow-sm">
                    {/* Font */}
                    <select
                        className="tiptap-select"
                        value={currentFont}
                        onChange={(e) => applyFont(e.target.value)}
                        aria-label="Font"
                        title="Font"
                    >
                        <option value="">Font</option>
                        {fonts.map((f) => {
                            const slug = f.replace(/\s+/g, '-');
                            return (
                                <option key={slug} value={slug}>
                                    {f}
                                </option>
                            );
                        })}
                    </select>

                    {/* Size */}
                    <select
                        className="tiptap-select"
                        value={currentSize}
                        onChange={(e) => applySize(e.target.value)}
                        aria-label="Font Size"
                        title="Font Size"
                    >
                        <option value="">Size</option>
                        {[
                            '8',
                            '9',
                            '10',
                            '11',
                            '12',
                            '14',
                            '16',
                            '18',
                            '20',
                            '22',
                            '24',
                            '26',
                            '28',
                            '36',
                            '48',
                            '72',
                        ].map((s) => (
                            <option key={s} value={s}>
                                {s}pt
                            </option>
                        ))}
                    </select>

                    {/* Bold/Italic/Underline */}
                    <ToolbarButton
                        icon={<Bold />}
                        action={() => editor?.chain().focus().toggleBold().run()}
                        label="Bold"
                    />
                    <ToolbarButton
                        icon={<Italic />}
                        action={() => editor?.chain().focus().toggleItalic().run()}
                        label="Italic"
                    />
                    <ToolbarButton
                        icon={<UnderlineIcon />}
                        action={() => editor?.chain().focus().toggleUnderline().run()}
                        label="Underline"
                    />

                    {/* Align */}
                    <ToolbarButton
                        icon={<AlignLeft />}
                        action={() => editor?.chain().focus().setTextAlign('left').run()}
                        label="Left"
                    />
                    <ToolbarButton
                        icon={<AlignCenter />}
                        action={() => editor?.chain().focus().setTextAlign('center').run()}
                        label="Center"
                    />
                    <ToolbarButton
                        icon={<AlignRight />}
                        action={() => editor?.chain().focus().setTextAlign('right').run()}
                        label="Right"
                    />

                    {/* Link */}
                    <ToolbarButton
                        icon={<LinkIcon />}
                        action={() => {
                            const url = prompt('Enter link URL');
                            if (url) editor?.chain().focus().setLink({ href: url }).run();
                        }}
                        label="Insert Link"
                    />

                    {/* Image */}
                    <label
                        className="tiptap-btn cursor-pointer"
                        title="Insert Image"
                        aria-label="Insert Image"
                    >
                        <ImageIcon className="w-4 h-4" />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </label>
                </div>

                <div className="tiptap-editor border p-2 min-h-[200px] overflow-auto">
                    <EditorContent editor={editor} />
                </div>
            </>
        );
    }
);

function ToolbarButton({
    icon,
    action,
    label,
}: {
    icon: React.ReactNode;
    action: () => void;
    label: string;
}) {
    return (
        <button
            type="button"
            className="tiptap-btn"
            onClick={action}
            aria-label={label}
            title={label}
        >
            {icon}
        </button>
    );
}

TipTapEditor.displayName = 'TipTapEditor';
export default TipTapEditor;

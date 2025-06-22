'use client';

import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFontList, selectFontList } from '@/slices/fontsSlice';
import { AppDispatch } from '@/store';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    /* Blockquote, */
    Code,
    ListOrdered,
    List,
    Indent,
    Outdent,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    /* ArrowRightLeft, */
    Link as LinkIcon,
    Image as ImageIcon,
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import FontSize from '@tiptap/extension-font-size';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

export type TipTapEditorHandle = { getContent: () => string };

interface TipTapEditorProps {
    value?: string;
    onChange?: (content: string) => void;
    forceReset?: boolean;
}

const sizes = [
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
].map((s) => ({ value: s, label: `${s}pt` }));

const TipTapEditor = forwardRef<TipTapEditorHandle, TipTapEditorProps>(
    ({ value = '', forceReset = false, onChange }, ref) => {
        const dispatch = useDispatch<AppDispatch>();
        const fonts = useSelector(selectFontList);

        // Fetch fonts only once
        useEffect(() => {
            dispatch(fetchFontList());
        }, [dispatch]);

        // State for toolbar selects
        const [currentHeader, setCurrentHeader] = useState('false');
        const [currentFont, setCurrentFont] = useState('');
        const [currentSize, setCurrentSize] = useState('');

        // Tiptap editor instance
        const editor = useEditor({
            extensions: [
                StarterKit,
                TextStyle,
                FontFamily,
                Subscript,
                Superscript,
                Highlight,

                FontSize,
                Color,
                TextAlign.configure({ types: ['heading', 'paragraph'] }),
                Link,
                Underline,
                Image.extend({
                    addAttributes() {
                        return {
                            ...this.parent?.(),
                            float: {
                                default: null,
                                parseHTML: (element) => element.style.float || null,
                                renderHTML: (attributes) => {
                                    if (!attributes.float) return {};
                                    return { style: `float: ${attributes.float}` };
                                },
                            },
                            width: {
                                default: null,
                                parseHTML: (element) => element.getAttribute('width') || null,
                                renderHTML: (attributes) => {
                                    if (!attributes.width) return {};
                                    return { width: attributes.width };
                                },
                            },
                        };
                    },
                }),
                Placeholder.configure({
                    placeholder: 'Tell your story...',
                }),
            ],
            content: value,
            onUpdate({ editor }) {
                onChange?.(editor.getHTML());
            },
        });

        useImperativeHandle(
            ref,
            () => ({
                getContent: () => editor?.getHTML() || '',
            }),
            [editor]
        );

        useEffect(() => {
            if (editor && value !== editor.getHTML()) {
                editor.commands.setContent(value || '', false);
            }
        }, [value, forceReset, editor]);

        // Image upload handler (Cloudinary)
        const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData }
            );
            const data = await res.json();
            if (data.secure_url) {
                editor?.chain().focus().setImage({ src: data.secure_url }).run();
            }
        };

        // Toolbar handlers
        const setHeader = (val: string) => {
            setCurrentHeader(val);
            if (val === 'false') {
                editor?.chain().focus().setParagraph().run();
            } else {
                editor
                    ?.chain()
                    .focus()
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .toggleHeading({ level: Number(val) as any })
                    .run();
            }
        };
        const setFont = (val: string) => {
            setCurrentFont(val);
            // You need to implement a custom extension for font-family in Tiptap for full support
            editor?.chain().focus().setMark('textStyle', { fontFamily: val }).run();
        };
        const setSize = (val: string) => {
            setCurrentSize(val);
            // You need to implement a custom extension for font-size in Tiptap for full support
            editor
                ?.chain()
                .focus()
                .setMark('textStyle', { fontSize: `${val}pt` })
                .run();
        };

        return (
            <>
                {/* Toolbar - use Quill classNames */}
                <div id="toolbar" className="ql-toolbar">
                    <span className="ql-formats">
                        {/* Header */}
                        <select
                            className="ql-header"
                            value={currentHeader}
                            onChange={(e) => setHeader(e.target.value)}
                        >
                            <option value="false">Normal</option>
                            <option value="1">H1</option>
                            <option value="2">H2</option>
                            <option value="3">H3</option>
                            <option value="4">H4</option>
                            <option value="5">H5</option>
                            <option value="6">H6</option>
                        </select>
                    </span>
                    <span className="ql-formats">
                        {/* Font */}
                        <select
                            className="ql-font"
                            value={currentFont}
                            onChange={(e) => setFont(e.target.value)}
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
                            className="ql-size"
                            value={currentSize}
                            onChange={(e) => setSize(e.target.value)}
                        >
                            <option value="">Size</option>
                            {sizes.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </span>
                    <span className="ql-formats">
                        {/* Bold, Italic, Underline, Strike */}
                        <button
                            className="ql-bold"
                            type="button"
                            onClick={() => editor?.chain().focus().toggleBold().run()}
                        >
                            <Bold size={18} />
                        </button>
                        <button
                            className="ql-italic"
                            type="button"
                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                        >
                            <Italic size={18} />
                        </button>
                        <button
                            className="ql-underline"
                            type="button"
                            onClick={() => editor?.chain().focus().toggleUnderline().run()}
                        >
                            <UnderlineIcon size={18} />
                        </button>
                        <button
                            className="ql-strike"
                            type="button"
                            onClick={() => editor?.chain().focus().toggleStrike().run()}
                        >
                            <Strikethrough size={18} />
                        </button>
                    </span>
                    <span className="ql-formats">
                        <button
                            className="ql-script"
                            value="sub"
                            type="button"
                            onClick={() => editor?.chain().focus().toggleSubscript().run()}
                        >
                            <SubscriptIcon size={18} />
                        </button>
                        <button
                            className="ql-script"
                            value="super"
                            type="button"
                            onClick={() => editor?.chain().focus().toggleSuperscript().run()}
                        >
                            <SuperscriptIcon size={18} />
                        </button>
                    </span>
                    <span className="ql-formats">
                        <button
                            className="ql-blockquote"
                            type="button"
                            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                        >
                            {/* <Blockquote size={18} /> */}
                        </button>
                        <button
                            className="ql-code-block"
                            type="button"
                            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                        >
                            <Code size={18} />
                        </button>
                    </span>
                    <span className="ql-formats">
                        {/* Color and Background */}
                        {/* You can use a color picker or a select here */}
                        <input
                            type="color"
                            className="ql-color"
                            onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
                            title="Text color"
                        />
                        <input
                            type="color"
                            className="ql-background"
                            onChange={(e) =>
                                editor
                                    ?.chain()
                                    .focus()
                                    .setHighlight({ color: e.target.value })
                                    .run()
                            }
                            title="Background color"
                        />
                    </span>
                    <span className="ql-formats">
                        <button
                            className="ql-list"
                            value="ordered"
                            type="button"
                            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        >
                            <ListOrdered size={18} />
                        </button>
                        <button
                            className="ql-list"
                            value="bullet"
                            type="button"
                            onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        >
                            <List size={18} />
                        </button>
                        <button
                            className="ql-indent"
                            value="-1"
                            type="button"
                            onClick={() => editor?.chain().focus().liftListItem('listItem').run()}
                        >
                            <Outdent size={18} />
                        </button>
                        <button
                            className="ql-indent"
                            value="+1"
                            type="button"
                            onClick={() => editor?.chain().focus().sinkListItem('listItem').run()}
                        >
                            <Indent size={18} />
                        </button>
                    </span>
                    <span className="ql-formats">
                        <button
                            className="ql-align"
                            value=""
                            type="button"
                            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                        >
                            <AlignLeft size={18} />
                        </button>
                        <button
                            className="ql-align"
                            value="center"
                            type="button"
                            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                        >
                            <AlignCenter size={18} />
                        </button>
                        <button
                            className="ql-align"
                            value="right"
                            type="button"
                            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                        >
                            <AlignRight size={18} />
                        </button>
                        <button
                            className="ql-align"
                            value="justify"
                            type="button"
                            onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                        >
                            <AlignJustify size={18} />
                        </button>
                        {/* <button
                            className="ql-direction"
                            value="rtl"
                            type="button"
                            onClick={() => editor?.chain().focus().setTextDirection('rtl').run()}
                        >
                            <ArrowRightLeft size={18} />
                        </button> */}
                    </span>
                    <span className="ql-formats">
                        <button
                            className="ql-link"
                            type="button"
                            onClick={() => {
                                const url = prompt('Enter URL');
                                if (url) editor?.chain().focus().setLink({ href: url }).run();
                            }}
                        >
                            <LinkIcon size={18} />
                        </button>
                        <button className="ql-image" type="button">
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="tiptap-image-upload"
                                onChange={handleImageUpload}
                            />
                            <label
                                htmlFor="tiptap-image-upload"
                                style={{ cursor: 'pointer', margin: 0 }}
                            >
                                <ImageIcon size={18} />
                            </label>
                        </button>
                        {/* Video not natively supported in Tiptap, needs custom extension */}
                    </span>
                </div>

                {/* Editor content - use Quill className */}
                <SimpleBar style={{ maxHeight: '33.5vh' }}>
                    <EditorContent editor={editor} className="ql-editor" />
                </SimpleBar>
            </>
        );
    }
);

TipTapEditor.displayName = 'TipTapEditor';
export default TipTapEditor;

'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import Quill from 'quill';
import { AppDispatch } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFontList, selectFontList } from '@/slices/fontsSlice';
import ToolbarSelect from '@/components/ui/ToolbarSelect';
import SimpleBar from 'simplebar-react';
import 'quill/dist/quill.snow.css'; // Import Quill styles

// ➊ Minimal types for our handler
interface QuillRange {
    index: number;
    length: number;
}
interface KeyboardContext {
    format: Record<string, unknown>;
}
interface Attributor {
    whitelist: string[];
}

// ➋ Import the **class** attributors for font & size
const RawFontAttributor = Quill.import('attributors/class/font') as unknown;
const RawSizeAttributor = Quill.import('attributors/class/size') as unknown;
const FontAttributor = RawFontAttributor as Attributor;
const SizeAttributor = RawSizeAttributor as Attributor;

// ➌ Initialize with empty whitelists (we’ll fill these dynamically)
FontAttributor.whitelist = [];
SizeAttributor.whitelist = [];
Quill.register('formats/font', FontAttributor, true);
Quill.register('formats/size', SizeAttributor, true);

interface RichTextEditorProps {
    value?: string;
    forceReset?: boolean;
    onChange?: (content: string) => void;
}
export type RichTextEditorHandle = { getContent: () => string };

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
    ({ value = '', forceReset = false, onChange }, ref) => {
        const [currentHeader, setCurrentHeader] = useState<string>('false');
        const [currentFont, setCurrentFont] = useState<string>('');
        const [currentSize, setCurrentSize] = useState<string>('');
        // ➊ Create refs to hold the *latest* selections
        const currentFontRef = useRef<string>('');
        const currentSizeRef = useRef<string>('');

        const editorRef = useRef<HTMLDivElement>(null);
        const quillRef = useRef<Quill | null>(null);

        const dispatch = useDispatch<AppDispatch>();
        const fonts = useSelector(selectFontList);
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
        const sizeOptions = sizes.map((o) => o.value);

        useEffect(() => {
            dispatch(fetchFontList());
        }, [dispatch]);

        // 1️⃣ Update attributors when fonts or sizes change
        useEffect(() => {
            // Only proceed if we have both Quill imported and a non-empty list
            if (!Quill || fonts.length === 0) return;

            // 1️⃣ Create an array of { value: slug, label: original }
            const fontOptions = fonts.map((f) => {
                const slug = f.replace(/\s+/g, '-'); // e.g. "Open Sans" ➔ "Open-Sans"
                return { value: slug, label: f };
            });
            FontAttributor.whitelist = fontOptions.map((o) => o.value);
            SizeAttributor.whitelist = sizeOptions;

            // 2️⃣ Whitelist exactly those same slugs
            Quill.register('formats/font', FontAttributor, true);
            Quill.register('formats/size', SizeAttributor, true);
        }, [fonts, sizeOptions]);

        // 2️⃣ Then initialize Quill once
        useEffect(() => {
            if (editorRef.current && !quillRef.current) {
                const quill = new Quill(editorRef.current, {
                    theme: 'snow',
                    modules: {
                        toolbar: '#toolbar',
                        history: { delay: 500, maxStack: 200, userOnly: true },
                    },
                    formats: [
                        'font',
                        'size',
                        'header',
                        'bold',
                        'italic',
                        'underline',
                        'strike',
                        'script',
                        'blockquote',
                        'code-block',
                        'list',
                        'bullet',
                        'indent',
                        'link',
                        'image',
                        'color',
                        'background',
                        'align',
                        'direction',
                    ],
                    placeholder: 'Tell your story...',
                });
                quillRef.current = quill;

                quill.keyboard.addBinding(
                    { key: 13, collapsed: true },
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    (range: QuillRange, context: KeyboardContext) => {
                        // Capture **all** current formats at the cursor
                        const formats = quill.getFormat(range.index) || {};

                        // Insert newline & move cursor
                        quill.insertText(range.index, '\n', 'user');
                        quill.setSelection(range.index + 1, 0, 'silent');

                        // Reapply each format found
                        Object.entries(formats).forEach(([name, value]) => {
                            quill.format(name, value, 'silent');
                        });

                        // Prevent Quill’s default handler which would reset inline formats
                        return false;
                    }
                );

                // Improved selection change handler
                quill.on('selection-change', (range: QuillRange | null) => {
                    if (range) {
                        const formats = quill.getFormat(range.index);
                        setCurrentFont((formats.font as string) || '');
                        setCurrentSize((formats.size as string) || '');
                        setCurrentHeader(formats.header?.toString() || 'false');
                    }
                });

                // Hook onChange
                quill.on('text-change', () => {
                    onChange?.(quill.root.innerHTML);
                });
            }
        }, [onChange, fonts, currentFont, currentSize]);

        useEffect(() => {
            if (quillRef.current) {
                // skip if it's already equal
                if (quillRef.current.root.innerHTML !== value) {
                    quillRef.current.root.innerHTML = value;
                }
            }
        }, [value, forceReset]);

        // ➋ Whenever state updates, mirror it in the refs
        useEffect(() => {
            currentFontRef.current = currentFont;
        }, [currentFont]);

        useEffect(() => {
            currentSizeRef.current = currentSize;
        }, [currentSize]);

        useImperativeHandle(ref, () => ({
            getContent: () => {
                return quillRef.current?.root.innerHTML || '';
            },
        }));

        return (
            <>
                {/* Custom Toolbar */}
                <div id="toolbar" className="ql-toolbar">
                    <span className="ql-formats">
                        {/* Header */}
                        <ToolbarSelect
                            format="header"
                            label="Header"
                            options={[
                                { value: '1', label: 'H1' },
                                { value: '2', label: 'H2' },
                                { value: '3', label: 'H3' },
                                { value: '4', label: 'H4' },
                                { value: '5', label: 'H5' },
                                { value: '6', label: 'H6' },
                                { value: 'false', label: 'Normal' },
                            ]}
                            current={currentHeader}
                            onSelect={(val) => {
                                setCurrentHeader(val);
                                quillRef.current?.format('header', val);
                            }}
                        />
                    </span>
                    <span className="ql-formats">
                        {/* Font */}
                        <ToolbarSelect
                            format="font"
                            label="Font"
                            options={fonts.map((f) => {
                                const slug = f.replace(/\s+/g, '-'); // e.g. "Open Sans" ➔ "Open-Sans"
                                return { value: slug, label: f };
                            })}
                            current={currentFont}
                            onSelect={(val) => {
                                setCurrentFont(val);
                                quillRef.current?.format('font', val);
                            }}
                        />

                        {/* Size */}
                        <ToolbarSelect
                            format="size"
                            label="Size"
                            options={sizes}
                            current={currentSize}
                            onSelect={(val) => {
                                setCurrentSize(val);
                                quillRef.current?.format('size', val);
                            }}
                        />
                    </span>
                    <span className="ql-formats">
                        {/* Remaining default buttons */}
                        <button className="ql-bold"></button>
                        <button className="ql-italic"></button>
                        <button className="ql-underline"></button>
                        <button className="ql-strike"></button>
                    </span>
                    <span className="ql-formats">
                        <button className="ql-script" value="sub"></button>
                        <button className="ql-script" value="super"></button>
                    </span>
                    <span className="ql-formats">
                        <button className="ql-blockquote"></button>
                        <button className="ql-code-block"></button>
                    </span>
                    <span className="ql-formats">
                        <select className="ql-color"></select>
                        <select className="ql-background"></select>
                    </span>
                    <span className="ql-formats">
                        <button className="ql-list" value="ordered"></button>
                        <button className="ql-list" value="bullet"></button>
                        <button className="ql-indent" value="-1"></button>
                        <button className="ql-indent" value="+1"></button>
                    </span>
                    <span className="ql-formats">
                        <button className="ql-align" value=""></button>
                        <button className="ql-align" value="center"></button>
                        <button className="ql-align" value="right"></button>
                        <button className="ql-align" value="justify"></button>
                        <button className="ql-direction" value="rtl"></button>
                    </span>
                    <span className="ql-formats">
                        <button className="ql-link"></button>
                        <button className="ql-image"></button>
                    </span>
                </div>

                {/* Quill Editor */}
                <SimpleBar style={{ maxHeight: '33.5vh' }}>
                    <div ref={editorRef} />
                </SimpleBar>
            </>
        );
    }
);

RichTextEditor.displayName = 'RichTextEditor';
export default RichTextEditor;

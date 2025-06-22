'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import Quill, { Delta } from 'quill';
import ResizeModule from '@botom/quill-resize-module';
import { ImageDrop } from 'quill-image-drop-module';
import { AppDispatch } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFontList, selectFontList } from '@/slices/fontsSlice';
import ToolbarSelect from '@/components/ui/ToolbarSelect';
import SimpleBar from 'simplebar-react';
import 'quill/dist/quill.snow.css'; // Import Quill styles
import imageCompression from 'browser-image-compression';
/* import SubmitModal from '@/components/ui/SubmitModal'; */

// ➊ Minimal types for our handler
// Types
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

Quill.register('modules/resize', ResizeModule);
Quill.register('modules/imageDrop', ImageDrop);

interface RichTextEditorProps {
    value?: string;
    forceReset?: boolean;
    onChange?: (content: string) => void;
}
export type RichTextEditorHandle = { getContent: () => string };

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
    ({ value = '', forceReset = false, onChange }, ref) => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        const [isUploading, setIsUploading] = useState(false);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [uploadError, setUploadError] = useState<string | null>(null);

        const [currentHeader, setCurrentHeader] = useState<string>('false');
        const [currentFont, setCurrentFont] = useState<string>('');
        const [currentSize, setCurrentSize] = useState<string>('');

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

        // Fetch fonts only once
        useEffect(() => {
            dispatch(fetchFontList());
        }, [dispatch]);

        // Update attributors when fonts or sizes change
        useEffect(() => {
            if (!Quill || fonts.length === 0) return;
            const fontOptions = fonts.map((f) => {
                const slug = f.replace(/\s+/g, '-');
                return { value: slug, label: f };
            });
            FontAttributor.whitelist = fontOptions.map((o) => o.value);
            SizeAttributor.whitelist = sizeOptions;
            Quill.register('formats/font', FontAttributor, true);
            Quill.register('formats/size', SizeAttributor, true);
        }, [fonts, sizeOptions]);

        // Initialize Quill only once, after fonts are loaded
        useEffect(() => {
            if (editorRef.current && !quillRef.current && fonts.length > 0) {
                const quill = new Quill(editorRef.current, {
                    theme: 'snow',
                    modules: {
                        toolbar: {
                            container: '#toolbar',
                            handlers: {
                                image: async function () {
                                    const input = document.createElement('input');
                                    input.setAttribute('type', 'file');
                                    input.setAttribute('accept', 'image/*');
                                    input.click();

                                    input.onchange = async () => {
                                        const file = input.files?.[0];
                                        if (!file) return;

                                        setIsUploading(true);
                                        setUploadError(null);

                                        let uploadFile = file;
                                        try {
                                            if (file.size > 10485760) {
                                                uploadFile = await imageCompression(file, {
                                                    maxSizeMB: 10,
                                                    maxWidthOrHeight: 1920,
                                                    useWebWorker: true,
                                                });
                                            }
                                        } catch {
                                            setUploadError('Image compression failed.');
                                            setIsUploading(false);
                                            return;
                                        }

                                        const formData = new FormData();
                                        formData.append('file', uploadFile);
                                        if (uploadPreset) {
                                            formData.append('upload_preset', uploadPreset);
                                        } else {
                                            setUploadError('Upload preset is not defined');
                                            setIsUploading(false);
                                            return;
                                        }

                                        try {
                                            const res = await fetch(
                                                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                                                { method: 'POST', body: formData }
                                            );
                                            const data = await res.json();

                                            if (data.secure_url) {
                                                const range = quill.getSelection(true);
                                                quill.insertEmbed(
                                                    range.index,
                                                    'image',
                                                    data.secure_url,
                                                    'user'
                                                );
                                            } else {
                                                setUploadError(
                                                    data.error?.message || 'Image upload failed'
                                                );
                                            }
                                        } catch {
                                            setUploadError('Image upload failed');
                                        } finally {
                                            setIsUploading(false);
                                        }
                                    };
                                },
                                video: async function () {
                                    const input = document.createElement('input');
                                    input.setAttribute('type', 'file');
                                    input.setAttribute('accept', 'video/*');
                                    input.click();

                                    input.onchange = async () => {
                                        const file = input.files?.[0];
                                        if (!file) return;

                                        setIsUploading(true);
                                        setUploadError(null);

                                        const uploadFile = file;
                                        const formData = new FormData();
                                        formData.append('file', uploadFile);
                                        if (uploadPreset) {
                                            formData.append('upload_preset', uploadPreset);
                                        } else {
                                            setUploadError('Upload preset is not defined');
                                            setIsUploading(false);
                                            return;
                                        }

                                        try {
                                            const res = await fetch(
                                                `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
                                                { method: 'POST', body: formData }
                                            );
                                            const data = await res.json();

                                            if (data.secure_url) {
                                                const range = quill.getSelection(true);
                                                quill.insertEmbed(
                                                    range.index,
                                                    'video',
                                                    data.secure_url,
                                                    'user'
                                                );
                                            } else {
                                                setUploadError(
                                                    data.error?.message || 'Video upload failed'
                                                );
                                            }
                                        } catch {
                                            setUploadError('Video upload failed');
                                        } finally {
                                            setIsUploading(false);
                                        }
                                    };
                                },
                            },
                        },
                        history: {
                            delay: 500,
                            maxStack: 200,
                            userOnly: true,
                        },
                        resize: {
                            locale: {
                                altTip: 'Hold down the alt key to zoom',
                                floatLeft: 'Left',
                                floatRight: 'Right',
                                center: 'Center',
                                restore: 'Restore',
                            },
                        },
                        imageDrop: true,
                        clipboard: {
                            matchers: [
                                [
                                    '*',
                                    (node: Node, delta: Delta) => {
                                        if (!(node instanceof HTMLElement)) return delta;

                                        const attributes: Record<string, string> = {};
                                        const classList = Array.from(node.classList);
                                        const style = node.style;

                                        // 1. Process Quill classes
                                        const fontClass = classList.find(
                                            (cls) =>
                                                cls.startsWith('ql-font-') &&
                                                FontAttributor.whitelist.includes(
                                                    cls.replace('ql-font-', '')
                                                )
                                        );
                                        if (fontClass)
                                            attributes.font = fontClass.replace('ql-font-', '');

                                        const sizeClass = classList.find(
                                            (cls) =>
                                                cls.startsWith('ql-size-') &&
                                                SizeAttributor.whitelist.includes(
                                                    cls.replace('ql-size-', '')
                                                )
                                        );
                                        if (sizeClass)
                                            attributes.size = sizeClass.replace('ql-size-', '');

                                        // 2. Process inline styles
                                        if (style.fontFamily && !attributes.font) {
                                            const fontValue = style.fontFamily
                                                .replace(/['"]/g, '')
                                                .replace(/\s+/g, '-');
                                            if (FontAttributor.whitelist.includes(fontValue)) {
                                                attributes.font = fontValue;
                                            }
                                        }

                                        if (style.fontSize && !attributes.size) {
                                            const sizeValue = style.fontSize.replace(
                                                /(pt|px)/g,
                                                ''
                                            );
                                            if (SizeAttributor.whitelist.includes(sizeValue)) {
                                                attributes.size = sizeValue;
                                            }
                                        }

                                        // 3. Apply attributes to all delta operations
                                        if (Object.keys(attributes).length > 0) {
                                            return new Delta(
                                                delta.ops.map((op) => ({
                                                    ...op,
                                                    attributes: {
                                                        ...(op.attributes || {}),
                                                        ...attributes,
                                                    },
                                                }))
                                            );
                                        }
                                        return delta;
                                    },
                                ],
                                [
                                    'img',
                                    (node: Node, delta: Delta) => {
                                        if (node instanceof HTMLImageElement) {
                                            const width =
                                                node.style.width || node.getAttribute('width');
                                            const height =
                                                node.style.height || node.getAttribute('height');
                                            let align: string | undefined;

                                            console.log('Processing image node:', node);

                                            // Handle float style
                                            if (node.style.float) {
                                                console.log('Image float style:', node.style.float);
                                                if (node.style.float === 'right') align = 'right';
                                                else if (node.style.float === 'left')
                                                    align = 'left';
                                                else if (node.style.float === 'none') align = '';
                                            }

                                            // Handle custom alignment classes (from resize module)
                                            const classList = Array.from(node.classList);
                                            if (classList.includes('ql-resize-style-center'))
                                                align = 'center';
                                            if (classList.includes('ql-resize-style-right'))
                                                align = 'right';
                                            if (classList.includes('ql-resize-style-left'))
                                                align = 'left';

                                            delta.ops.forEach((op) => {
                                                op.attributes = op.attributes || {};
                                                if (width) op.attributes.width = width;
                                                if (height) op.attributes.height = height;
                                                if (align !== undefined)
                                                    op.attributes.align = align;
                                            });
                                        }
                                        return delta;
                                    },
                                ],
                            ],
                        },
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
                        'video',
                        'color',
                        'background',
                        'align',
                        'direction',
                    ],
                    placeholder: 'Tell your story...',
                });

                quillRef.current = quill;

                // Updated value setting with proper clipboard handling
                if (value) {
                    const delta = quill.clipboard.convert({ html: value });
                    quill.setContents(delta, 'silent');
                }

                quill.keyboard.addBinding(
                    { key: 13, shiftKey: null }, // Enter (with or without shift)
                    {}, // no additional requirements
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    (range: QuillRange, context: KeyboardContext) => {
                        // handler
                        // 2️⃣ Insert our <br/> embed
                        quill.insertEmbed(range.index, 'break', true, Quill.sources.USER);

                        // 3️⃣ Move cursor _after_ the break
                        quill.setSelection(range.index + 1, Quill.sources.SILENT);

                        // 4️⃣ Prevent the default paragraph insertion
                        return false;
                    }
                );

                quill.on('selection-change', (range: QuillRange | null) => {
                    if (range) {
                        const formats = quill.getFormat(range.index);
                        setCurrentFont((formats.font as string) || '');
                        setCurrentSize((formats.size as string) || '');
                        setCurrentHeader(formats.header?.toString() || 'false');
                    }
                });

                quill.on('text-change', () => {
                    onChange?.(quill.root.innerHTML);
                });
            }
        }, [fonts, onChange, cloudName, uploadPreset]);

        // Keep editor value in sync with prop
        useEffect(() => {
            if (quillRef.current && value !== undefined) {
                if (quillRef.current.root.innerHTML !== value) {
                    console.log('Updating editor content:', value);
                    const Delta = Quill.import('delta');
                    const delta = quillRef.current.clipboard.convert({ html: value });

                    // Clear and set new content
                    quillRef.current.setContents(new Delta());
                    quillRef.current.updateContents(delta);
                }
            }
        }, [value, forceReset]);

        // Keep refs in sync
        useEffect(() => {
            currentFontRef.current = currentFont;
        }, [currentFont]);
        useEffect(() => {
            currentSizeRef.current = currentSize;
        }, [currentSize]);

        useImperativeHandle(ref, () => ({
            getContent: () => quillRef.current?.root.innerHTML || '',
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
                        <button className="ql-video"></button>
                    </span>
                </div>

                {/* Quill Editor */}
                <SimpleBar style={{ maxHeight: '33.5vh' }}>
                    <div ref={editorRef} />
                </SimpleBar>

                {/* Uploading indicator */}
                {isUploading && (
                    <div className="image-uploading-indicator">
                        <span>Uploading image...</span>
                    </div>
                )}

                {/* Error Modal */}
                {/* <SubmitModal
                    isSubmitOpen={!!uploadError}
                    onSubmitClose={() => setUploadError(null)}
                    header="Image Upload Error"
                    message={uploadError || ''}
                    isSuccess={false}
                /> */}
            </>
        );
    }
);

RichTextEditor.displayName = 'RichTextEditor';
export default RichTextEditor;

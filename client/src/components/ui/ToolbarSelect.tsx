'use client';

import React, { useState, useRef } from 'react';
import SimpleBar from 'simplebar-react';
import { useClickAway } from 'react-use';
/* DANGER : This react-use dependency is a lifesaver you need to go back over the entire project and use it */

interface Option {
    value: string;
    label: string;
}

interface ToolbarSelectProps {
    format: string; // Quill format name, e.g. 'font', 'size', 'header'
    options: Option[];
    current: string; // The currently selected value
    onSelect: (v: string) => void;
    label?: string; // e.g. “Font”, “Size”
}

export default function ToolbarSelect({
    format,
    options,
    current,
    onSelect,
    label,
}: ToolbarSelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useClickAway(ref, () => setOpen(false));

    // Ensure the toolbar button also informs Quill’s toolbar handlers
    // by adding the right class and value
    const btnClass = `ql-${format}`;

    return (
        <div ref={ref} className='_customSelectWrapper'>
            <button
                type="button"
                className={`_input __select ${btnClass}`}
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {label
                    ? `${options.find((o) => o.value === current)?.label ?? label}`
                    : options.find((o) => o.value === current)?.label ?? 'Select'}
            </button>

            {open && (
                <SimpleBar
                    className="_SimpleBar"
                    style={{ maxHeight: '20vh' }}
                    forceVisible="y"
                    autoHide={false}
                >
                    <ul role="listbox" className="p-1">
                        {options.map((opt) => (
                            <li
                                key={opt.value}
                                role="option"
                                aria-selected={opt.value === current}
                                className={`px-2 py-1 cursor-pointer hover:bg-blue-100 ${
                                    opt.value === current ? 'bg-blue-200 font-semibold' : ''
                                }`}
                                onClick={() => {
                                    onSelect(opt.value);
                                    setOpen(false);
                                }}
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                </SimpleBar>
            )}
        </div>
    );
}

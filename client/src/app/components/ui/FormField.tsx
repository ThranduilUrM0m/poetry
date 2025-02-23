import React, { useState } from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useCombobox } from 'downshift';
import AnimatedWrapper from './AnimatedWrapper';
import SimpleBar from 'simplebar-react';

interface SuggestionItem {
    id: string;
    title: string;
    body: string;
    author: string;
    category: string;
    tags: string[];
}

interface FormFieldProps<T extends FieldValues> {
    label: string;
    name: Path<T>;
    type?: 'text' | 'email' | 'password' | 'checkbox';
    icon?: React.ReactNode;
    error?: string;
    suggestions?: SuggestionItem[];
    control: Control<T>;
    rules?: object;
    onClear?: () => void;
    onSuggestionSelect?: (suggestion: SuggestionItem) => void;
}

// Modal variants
const SimpleBarVariants = {
    open: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
    closed: {
        opacity: 0,
        y: '2vh',
        filter: 'blur(10px)',
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
};

const FormField = <T extends FieldValues>({
    label,
    name,
    type = 'text',
    icon,
    error,
    suggestions = [],
    control,
    rules = {},
    onClear,
    onSuggestionSelect,
}: FormFieldProps<T>) => {
    const [inputItems, setInputItems] = useState<SuggestionItem[]>(suggestions);

    const {
        isOpen,
        getMenuProps,
        getInputProps,
        /* getComboboxProps, */
        getItemProps,
        highlightedIndex,
    } = useCombobox({
        items: inputItems,
        onInputValueChange: ({ inputValue }) => {
            if (inputValue) {
                setInputItems(
                    suggestions.filter((item) =>
                        item.title.toLowerCase().includes(inputValue.toLowerCase())
                    )
                );
            } else {
                setInputItems(suggestions);
            }
        },
        onSelectedItemChange: ({ selectedItem }) => {
            if (selectedItem && onSuggestionSelect) {
                onSuggestionSelect(selectedItem);
            }
        },
        itemToString: (item) => (item ? item.title : ''),
    });

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, onBlur, value, ref } }) => (
                <div
                    className={`_formGroup ${onClear && value ? '__notEmpty' : ''} ${
                        icon ? 'hasIcon' : ''
                    }`}
                >
                    {/* Floating label */}
                    <label htmlFor={name} className={`_floatingLabel ${value ? '_focused' : ''}`}>
                        {label}
                    </label>

                    {/* _formControl */}
                    <div className="_formControl"/*  {...getComboboxProps()} */>
                        {icon && <div className="_icon">{icon}</div>}
                        <input
                            type={type}
                            className={`_input ${value ? '_focused' : ''} ${icon ? '__icon' : ''} ${
                                error ? '__error' : ''
                            }`}
                            {...getInputProps({
                                onChange: (e) => {
                                    onChange(e);
                                },
                                onBlur: () => {
                                    onBlur();
                                },
                                ref,
                                value: value || '',
                            })}
                            /* onFocus={() => setIsFocused(true)}
                            onBlur={() => {
                                setIsFocused(false);
                                onBlur();
                            }} */
                            autoComplete="off"
                        />
                    </div>

                    {/* Autocorrect */}

                    {/* Clear button */}
                    {onClear && value && (
                        <AnimatedWrapper
                            as="button"
                            onClick={() => {
                                onChange('');
                                if (onClear) onClear();
                            }}
                            aria-label="Clear Search"
                            className="_clearButton"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.5 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                                <g>
                                    <line
                                        className="one"
                                        x1="29.5"
                                        y1="49.5"
                                        x2="70.5"
                                        y2="49.5"
                                    ></line>
                                    <line
                                        className="two"
                                        x1="29.5"
                                        y1="50.5"
                                        x2="70.5"
                                        y2="50.5"
                                    ></line>
                                </g>
                            </svg>
                        </AnimatedWrapper>
                    )}

                    {/* Error text */}
                    {error && (
                        <div className="__errorText" role="alert">
                            <span>Erreur{error}</span>
                        </div>
                    )}

                    {/* Suggestions */}
                    <AnimatedWrapper
                        variants={SimpleBarVariants}
                        initial="closed"
                        animate={isOpen && inputItems.length > 0 ? 'open' : 'closed'}
                        exit="closed"
                    >
                        <SimpleBar
                            className="_SimpleBar"
                            style={{ maxHeight: '40vh' }}
                            forceVisible="y"
                            autoHide={false}
                        >
                            <ul {...getMenuProps()}>
                                {isOpen &&
                                    inputItems.map((item, index) => (
                                        <li
                                            key={`${item.id}${index}`}
                                            className={
                                                highlightedIndex === index ? 'highlighted' : ''
                                            }
                                            {...getItemProps({ item, index })}
                                            /* onClick={() =>
                                            onSuggestionSelect && onSuggestionSelect(suggestion)
                                        } */
                                        >
                                            {/* icon */}
                                            {item.title}
                                        </li>
                                    ))}
                            </ul>
                        </SimpleBar>
                    </AnimatedWrapper>
                </div>
            )}
        />
    );
};

export default FormField;

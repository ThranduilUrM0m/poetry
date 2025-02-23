import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useCombobox } from 'downshift';
import AnimatedWrapper from './AnimatedWrapper';
import SimpleBar from 'simplebar-react';

interface FormFieldProps<T extends FieldValues, S extends { id: string; title: string }> {
    label: string;
    name: Path<T>;
    type?: 'text' | 'email' | 'password' | 'checkbox';
    icon?: React.ReactNode;
    error?: string;
    suggestions?: S[]; // Use the generic type S for suggestions
    control: Control<T>;
    rules?: object;
    onClear?: () => void;
    onSuggestionSelect?: (suggestion: S) => void; // Use the generic type S
    onInputChange?: (value: string) => void;
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

const FormField = <T extends FieldValues, S extends { id: string; title: string }>({
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
    onInputChange,
}: FormFieldProps<T, S>) => {
    const [inputItems, setInputItems] = useState<S[]>(suggestions);
    const { isOpen, getMenuProps, getInputProps, getItemProps, highlightedIndex } = useCombobox({
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
            // Call the onInputChange prop to update the searchQuery state
            if (onInputChange) {
                onInputChange(inputValue || '');
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
                    <div className="_formControl">
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
                        <AnimatePresence mode="wait">
                        <AnimatedWrapper
                            as="button"
                            onClick={() => {
                                onChange('');
                                if (onClear) onClear();
                            }}
                            aria-label="Clear Search"
                            className="_clearButton"
                            variants={{
                                open: {
                                    y: 0,
                                    opacity: 1,
                                    transition: {
                                        duration: 0.25, // Speed of fade-out
                                        ease: 'easeInOut',
                                    },
                                },
                                closed: {
                                    y: 25,
                                    opacity: 0,
                                    transition: {
                                        duration: 0.25, // Speed of fade-out
                                        ease: 'easeInOut',
                                    },
                                }
                            }}
                            initial="closed" // Pass initial
                            animate={value ? 'open' : 'closed'} // Pass animate
                            exit="closed"


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
                        </AnimatePresence>
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

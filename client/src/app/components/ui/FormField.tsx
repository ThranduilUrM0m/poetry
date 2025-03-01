import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCombobox } from 'downshift';
import { AnimatePresence } from 'framer-motion';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import AnimatedWrapper from './AnimatedWrapper';
import SimpleBar from 'simplebar-react';
import _ from 'lodash';
import { SearchSuggestion } from '@/app/types/search';

interface FormFieldProps<T extends FieldValues, S extends SearchSuggestion> {
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
    allArticles?: Array<{
        // Add this new property
        id: string;
        category: string;
        // ... other article properties
    }>;
    selectedSuggestions?: S[];
}

// Modal variants
const SimpleBarVariants = {
    open: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
    closed: {
        opacity: 0,
        y: -10, // Slight upward movement for a smooth exit
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
};

const floatingLabelVariants = {
    focused: {
        y: '-100%',
        x: '1vh',
        top: 0,
        scale: 0.85,
        opacity: 1,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
    unfocused: {
        y: '-50%',
        x: '6vh',
        scale: 1,
        opacity: 0.75,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
};

const clearButtonVariants = {
    open: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
    closed: {
        y: 25,
        opacity: 0,
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
};

const errorTextVariants = {
    open: {
        opacity: 1,
        top: '50%',
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
    closed: {
        opacity: 0,
        top: '100%',
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
};

// Add new animation variants
const suggestionGroupVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

const suggestionItemVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
    hover: (type: string) => ({
        backgroundColor: type === 'tag' ? 'rgb(var(--pink)/.15)' : 'rgb(var(--primary-light)/.5)',
        scale: 1.02,
    }),
    tap: { scale: 0.98 },
};

const FormField = <T extends FieldValues, S extends SearchSuggestion>({
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
    allArticles = [], // Add this new prop
    selectedSuggestions = [],
}: FormFieldProps<T, S>) => {
    const [inputItems, setInputItems] = useState<S[]>(suggestions);
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [autocompleteSuggestion, setAutocompleteSuggestion] = useState('');
    const [isSimpleBarOpen, setIsSimpleBarOpen] = useState(false);
    const formGroupRef = useRef<HTMLDivElement>(null);

    // Use a ref to store the `onChange` function from react-hook-form
    const onChangeRef = useRef<(value: string) => void>(() => {});

    const { getMenuProps, getInputProps, getItemProps, highlightedIndex } = useCombobox({
        items: inputItems,
        isOpen: isSimpleBarOpen && inputItems.length > 0,
        onInputValueChange: ({ inputValue }) => {
            setInputValue(inputValue || '');
            setIsSimpleBarOpen(true);
            if (!_.isUndefined(inputValue)) {
                // Filter suggestions based on input
                const filteredItems = _.filter(suggestions, (item) =>
                    _.includes(_.toLower(item.title), _.toLower(inputValue))
                );
                setInputItems(filteredItems);
                if (onInputChange) {
                    onInputChange(inputValue);
                }
            } else {
                setInputItems(suggestions);
            }
        },
        onSelectedItemChange: ({ selectedItem }) => {
            if (selectedItem && onSuggestionSelect) {
                onSuggestionSelect(selectedItem);
                setInputValue(''); // Clear the input value
                setAutocompleteSuggestion(''); // Clear the autocomplete suggestion
                setIsSimpleBarOpen(false); // Close the suggestions dropdown
                onChangeRef.current?.(''); // Clear the form value (from react-hook-form)
            }
        },
        itemToString: (item) => (item ? item.title : ''),
    });
    getInputProps({}, { suppressRefError: true });
    getMenuProps({}, { suppressRefError: true });

    // Update inputItems when suggestions change
    useEffect(() => {
        const filteredItems = suggestions.filter(
            (item) => !selectedSuggestions?.some((s) => s.id === item.id)
        );
        setInputItems(filteredItems);
    }, [suggestions, selectedSuggestions]);

    // Group suggestions by type instead of source
    const groupedSuggestions = useMemo(() => {
        return (
            _.chain(inputItems)
                .groupBy('type')
                // Sort groups in specific order: tags, categories, authors, titles
                .toPairs()
                .sortBy(([type]) => {
                    const order = { tag: 1, category: 2, author: 3, title: 4 };
                    return order[type as keyof typeof order] || 5;
                })
                .value()
        );
    }, [inputItems]);

    // Update autocomplete suggestion when input or suggestions change
    useEffect(() => {
        if (!inputValue) {
            setAutocompleteSuggestion('');
            return;
        }

        const inputLower = _.toLower(inputValue);
        const matchingSuggestions = inputItems.filter((item) =>
            _.includes(_.toLower(item.title), inputLower)
        );

        if (matchingSuggestions.length > 0) {
            // First try exact title matches
            const exactMatch = matchingSuggestions.find(
                (item) => item.type === 'title' && _.startsWith(_.toLower(item.title), inputLower)
            );

            if (exactMatch) {
                setAutocompleteSuggestion(exactMatch.title);
            } else {
                // Otherwise use the highest priority match
                const bestMatch = _.minBy(matchingSuggestions, 'priority');
                setAutocompleteSuggestion(bestMatch?.title || '');
            }
        } else {
            setAutocompleteSuggestion('');
        }
    }, [inputValue, inputItems]);

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (formGroupRef.current && !formGroupRef.current.contains(event.target as Node)) {
                setIsSimpleBarOpen(false);
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const renderAutocomplete = () => {
        if (!autocompleteSuggestion || !inputValue) return null;

        const suggestionLower = _.toLower(autocompleteSuggestion);
        const inputLower = _.toLower(inputValue);

        if (!_.includes(suggestionLower, inputLower)) {
            return (
                <span className="_autocomplete">
                    <span className="_typed">{inputValue}</span>
                </span>
            );
        }

        const parts = [];
        const matchIndex = suggestionLower.indexOf(inputLower);

        // Add pre-match text if it exists
        if (matchIndex > 0) {
            parts.push(
                <span key="prefix" className="_suggestion">
                    {autocompleteSuggestion.slice(0, matchIndex)}
                </span>
            );
        }

        // Add the matched text
        parts.push(
            <span key="match" className="_typed">
                {autocompleteSuggestion.slice(matchIndex, matchIndex + inputValue.length)}
            </span>
        );

        // Add post-match text if it exists
        const postMatchIndex = matchIndex + inputValue.length;
        if (postMatchIndex < autocompleteSuggestion.length) {
            parts.push(
                <span key="suffix" className="_suggestion">
                    {autocompleteSuggestion.slice(postMatchIndex)}
                </span>
            );
        }

        return <span className="_autocomplete">{parts}</span>;
    };

    // Clear button event handler
    const handleClear = (onChange: (value: string) => void) => {
        return (e: React.MouseEvent) => {
            e.preventDefault();
            onChange('');
            setInputValue('');
            onClear?.();
        };
    };

    const getCategoryArticleCount = (categoryName: string): number => {
        // Count articles that have this category
        return allArticles.filter((article) => article.category === categoryName).length;
    };

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, onBlur, value, ref } }) => {
                // Store the `onChange` function in the ref
                onChangeRef.current = onChange;

                const inputProps = {
                    ...getInputProps({
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                            const newValue = e.target.value;
                            onChange(newValue);
                            setInputValue(newValue);
                        },
                        onBlur,
                        ref,
                        value: value || '',
                    }),
                    onFocus: () => {
                        setIsFocused(true);
                        setIsSimpleBarOpen(true);
                    },
                };

                return (
                    <div
                        ref={formGroupRef}
                        className={`_formGroup ${onClear && value ? '__notEmpty' : ''} ${
                            icon ? 'hasIcon' : ''
                        }`}
                    >
                        {/* Floating label */}
                        <AnimatedWrapper
                            as="label"
                            htmlFor={name}
                            className="_floatingLabel"
                            variants={floatingLabelVariants}
                            initial="unfocused"
                            animate={isFocused || value ? 'focused' : 'unfocused'}
                        >
                            {label}
                        </AnimatedWrapper>

                        {/* _formControl */}
                        <div className="_formControl">
                            {icon && <div className="_icon">{icon}</div>}
                            <input
                                type={type}
                                className={`_input ${value ? '_focused' : ''} ${
                                    icon ? '__icon' : ''
                                } ${error ? '__error' : ''}`}
                                {...inputProps}
                                autoComplete="off"
                                style={{
                                    color: !autocompleteSuggestion ? 'inherit' : 'transparent',
                                }}
                            />
                        </div>

                        {/* Autocorrect */}
                        {/* The words typped are not matching the autocorrect */}
                        <AnimatePresence mode="wait">
                            {autocompleteSuggestion && (
                                <AnimatedWrapper
                                    className="_autocorrectWrapper"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {renderAutocomplete()}
                                </AnimatedWrapper>
                            )}
                        </AnimatePresence>

                        {/* Clear button */}
                        <AnimatePresence mode="wait">
                            {onClear && value && (
                                <AnimatedWrapper
                                    as="button"
                                    type="button" // Add this line to prevent form submission
                                    onClick={handleClear(onChange)}
                                    aria-label="Clear Search"
                                    className="_clearButton"
                                    variants={clearButtonVariants}
                                    initial="closed"
                                    animate={value ? 'open' : 'closed'}
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
                            )}
                        </AnimatePresence>

                        {/* Error text */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <AnimatedWrapper
                                    as="div"
                                    className="__errorText"
                                    role="alert"
                                    variants={errorTextVariants}
                                    initial="closed"
                                    animate={error ? 'open' : 'closed'}
                                    exit="closed"
                                >
                                    <span>{error}</span>
                                </AnimatedWrapper>
                            )}
                        </AnimatePresence>

                        {/* Suggestions */}
                        <AnimatePresence mode="wait">
                            {isSimpleBarOpen && inputItems.length > 0 && (
                                <AnimatedWrapper
                                    variants={SimpleBarVariants}
                                    initial="closed"
                                    animate="open"
                                    exit="closed"
                                >
                                    <SimpleBar
                                        className="_SimpleBar"
                                        style={{ maxHeight: '40vh' }}
                                        forceVisible="y"
                                        autoHide={false}
                                    >
                                        <ul className="_SimpleBar-Group" {...getMenuProps()}>
                                            <AnimatePresence>
                                                {groupedSuggestions.map(([type, items]) => (
                                                    <AnimatedWrapper
                                                        key={type}
                                                        className="suggestion-group"
                                                        variants={suggestionGroupVariants}
                                                        initial="initial"
                                                        animate="animate"
                                                        exit="exit"
                                                    >
                                                        <AnimatedWrapper
                                                            className="suggestion-group-header"
                                                            variants={suggestionGroupVariants}
                                                        >
                                                            {type === 'tag' && 'Tags'}
                                                            {type === 'category' && 'Categories'}
                                                            {type === 'author' && 'Authors'}
                                                            {type === 'title' && 'Articles'}
                                                        </AnimatedWrapper>
                                                        <ul className={`suggestionList-${type}`}>
                                                            <AnimatePresence>
                                                                {items.map((item, index) => {
                                                                    const typedItem = item as S;
                                                                    const globalIndex =
                                                                        inputItems.indexOf(
                                                                            typedItem
                                                                        );
                                                                    return (
                                                                        <AnimatedWrapper
                                                                            key={`${typedItem.id}${index}`}
                                                                            className={`suggestion-item ${
                                                                                highlightedIndex ===
                                                                                globalIndex
                                                                                    ? 'highlighted'
                                                                                    : ''
                                                                            }`}
                                                                            variants={
                                                                                suggestionItemVariants
                                                                            }
                                                                            initial="initial"
                                                                            animate="animate"
                                                                            exit="exit"
                                                                            whileHover="hover"
                                                                            whileTap="tap"
                                                                            custom={typedItem.type}
                                                                            {...getItemProps({
                                                                                item: typedItem,
                                                                                index: globalIndex,
                                                                            })}
                                                                        >
                                                                            <span
                                                                                className={`suggestion ${typedItem.type}`}
                                                                            >
                                                                                {typedItem.type ===
                                                                                'author' ? (
                                                                                    <div className="author-suggestion">
                                                                                        <div className="author-info">
                                                                                            {typedItem.icon && (
                                                                                                <span className="suggestion-icon">
                                                                                                    {
                                                                                                        typedItem.icon
                                                                                                    }
                                                                                                </span>
                                                                                            )}
                                                                                            <span className="fullname">
                                                                                                {
                                                                                                    typedItem
                                                                                                        .source
                                                                                                        .author
                                                                                                        .firstname
                                                                                                }{' '}
                                                                                                {
                                                                                                    typedItem
                                                                                                        .source
                                                                                                        .author
                                                                                                        .lastname
                                                                                                }
                                                                                            </span>
                                                                                            <span className="username">
                                                                                                <span className="at-sign">
                                                                                                    @
                                                                                                </span>
                                                                                                {
                                                                                                    typedItem.title
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="location">
                                                                                            {
                                                                                                typedItem
                                                                                                    .source
                                                                                                    .author
                                                                                                    .city
                                                                                            }
                                                                                            ,{' '}
                                                                                            {
                                                                                                typedItem
                                                                                                    .source
                                                                                                    .author
                                                                                                    .country
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                ) : typedItem.type ===
                                                                                  'category' ? (
                                                                                    <div className="category-suggestion">
                                                                                        <span className="category-name">
                                                                                            {
                                                                                                typedItem.title
                                                                                            }
                                                                                        </span>
                                                                                        <span className="category-count">
                                                                                            {getCategoryArticleCount(
                                                                                                typedItem.title
                                                                                            )}
                                                                                        </span>
                                                                                    </div>
                                                                                ) : (
                                                                                    <>
                                                                                        {typedItem.icon && (
                                                                                            <span className="suggestion-icon">
                                                                                                {
                                                                                                    typedItem.icon
                                                                                                }
                                                                                            </span>
                                                                                        )}
                                                                                        {
                                                                                            typedItem.title
                                                                                        }
                                                                                    </>
                                                                                )}
                                                                            </span>
                                                                        </AnimatedWrapper>
                                                                    );
                                                                })}
                                                            </AnimatePresence>
                                                        </ul>
                                                    </AnimatedWrapper>
                                                ))}
                                            </AnimatePresence>
                                        </ul>
                                    </SimpleBar>
                                </AnimatedWrapper>
                            )}
                        </AnimatePresence>
                    </div>
                );
            }}
        />
    );
};

export default FormField;

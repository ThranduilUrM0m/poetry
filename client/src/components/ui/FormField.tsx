import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCombobox, UseComboboxGetInputPropsOptions } from 'downshift';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import SimpleBar from 'simplebar-react';
import { useTransition, useSpring } from '@react-spring/web';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { SearchSuggestion } from '@/types/search';
import { Article } from '@/types/article';
import _ from 'lodash';

interface FormFieldProps<T extends FieldValues, S extends SearchSuggestion> {
    label?: string;
    name: Path<T>;
    type?: 'text' | 'email' | 'password' | 'checkbox' | 'textarea' | 'select';
    options?: Array<{ value: string; label: string }>;
    icon?: React.ReactNode;
    error?: string;
    suggestions?: S[];
    control: Control<T>;
    rules?: object;
    onClear?: () => void;
    onSuggestionSelect?: (suggestion: S) => void;
    onInputChange?: (value: string) => void;
    allArticles?: Array<Article>;
    selectedSuggestions?: S[];
    fuzzyMatchThreshold?: number; // Add threshold for fuzzy matching
}

interface SelectProps {
    onChange: (value: string) => void;
    onBlur: () => void;
    value: string;
    ref: React.Ref<HTMLButtonElement>;
}

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
    allArticles = [],
    selectedSuggestions = [],
    fuzzyMatchThreshold = 0.4,
    options = [],
}: FormFieldProps<T, S>) => {
    // Define the smooth beautiful configuration
    const smoothConfig = {
        mass: 1,
        tension: 170,
        friction: 26,
    };

    const [inputItems, setInputItems] = useState<S[]>(suggestions);
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [autocompleteSuggestion, setAutocompleteSuggestion] = useState('');
    const [isSimpleBarOpen, setIsSimpleBarOpen] = useState(false);
    const formGroupRef = useRef<HTMLDivElement>(null);
    const onChangeRef = useRef<(value: string) => void>(() => {});

    const usingSuggestions = !!suggestions.length && !!onSuggestionSelect;

    // Compute the master suggestion list based on the original suggestions prop,
    // filtering out any suggestions that have already been selected.
    const masterSuggestionList = useMemo(() => {
        return suggestions.filter((item) => !selectedSuggestions?.some((s) => s._id === item._id));
    }, [suggestions, selectedSuggestions]);

    // Enhanced similarity check function
    const getStringSimilarity = (str1: string, str2: string): number => {
        const s1 = _.toLower(str1);
        const s2 = _.toLower(str2);
        // Check for exact substring match first
        if (s1.includes(s2) || s2.includes(s1)) {
            return 1;
        }
        // Calculate a simple similarity based on character differences
        const matrix: number[] = [];
        const chars = s1.split('');
        chars.forEach((char, i) => {
            matrix[i] = s2[i] === char ? 0 : 1;
        });
        const distance = matrix.reduce((sum, n) => sum + n, 0);
        return 1 - distance / Math.max(s1.length, s2.length);
    };

    // Enhanced filter function with proper suggestion handling
    const filterSuggestions = useMemo(
        () =>
            (inputVal: string, items: S[]): S[] => {
                const searchTerm = _.toLower(inputVal).trim();
                if (!searchTerm) return items;

                // First try exact matches
                const exactMatches = items.filter((item) =>
                    _.toLower(item.title).includes(searchTerm)
                );

                if (exactMatches.length > 0) {
                    return _.orderBy(exactMatches, [
                        (item) => ({ title: 0, category: 1, tag: 2, author: 3 }[item.type] || 4),
                        'title',
                    ]);
                }

                // Fallback to fuzzy matching
                return items
                    .map((item) => ({
                        item,
                        similarity: getStringSimilarity(item.title, searchTerm),
                    }))
                    .filter(({ similarity }) => similarity >= fuzzyMatchThreshold)
                    .sort((a, b) => {
                        const typeOrder = { title: 0, category: 1, tag: 2, author: 3 };
                        const typeDiff =
                            (typeOrder[a.item.type as keyof typeof typeOrder] || 4) -
                            (typeOrder[b.item.type as keyof typeof typeOrder] || 4);
                        return typeDiff || b.similarity - a.similarity;
                    })
                    .map(({ item }) => item);
            },
        [fuzzyMatchThreshold]
    );

    // Reset suggestions to master list
    const resetSuggestions = () => {
        setInputItems(masterSuggestionList);
        setAutocompleteSuggestion('');
        setIsSimpleBarOpen(true);
    };

    const { getMenuProps, getInputProps, getItemProps, highlightedIndex } = useCombobox({
        items: inputItems,
        isOpen: usingSuggestions && isSimpleBarOpen && inputItems.length > 0,
        onInputValueChange: ({ inputValue: newValue = '' }) => {
            if (!usingSuggestions) return;
            setInputValue(newValue);
            // Always filter on the master suggestion list
            const filtered = filterSuggestions(newValue, masterSuggestionList);
            setInputItems(filtered);
            if (onInputChange) {
                onInputChange(newValue);
            }
            setIsSimpleBarOpen(true);
        },
        onSelectedItemChange: ({ selectedItem }) => {
            if (!usingSuggestions) return;
            if (selectedItem && onSuggestionSelect) {
                onSuggestionSelect(selectedItem);
                setInputValue('');
                setAutocompleteSuggestion('');
                setIsSimpleBarOpen(false);
                onChangeRef.current?.('');
            }
        },
        itemToString: (item) => (item ? item.title : ''),
    });
    getMenuProps({}, { suppressRefError: true });
    getInputProps({}, { suppressRefError: true });

    // When the suggestions prop or selectedSuggestions change, reset the inputItems state.
    useEffect(() => {
        if (usingSuggestions) {
            setInputItems(masterSuggestionList);
        }
    }, [masterSuggestionList, usingSuggestions]);

    // Group suggestions by type for display
    const groupedSuggestions = useMemo(() => {
        if (!usingSuggestions) return [];
        return _.chain(inputItems)
            .groupBy('type')
            .toPairs()
            .sortBy(([type]) => {
                const order = { tag: 1, category: 2, author: 3, title: 4 };
                return order[type as keyof typeof order] || 5;
            })
            .value();
    }, [inputItems, usingSuggestions]);

    // Update autocomplete suggestion based on master list, not the already filtered inputItems.
    useEffect(() => {
        if (!usingSuggestions) return;
        if (!inputValue) {
            setAutocompleteSuggestion('');
            return;
        }
        const filtered = filterSuggestions(inputValue, masterSuggestionList);
        if (filtered.length > 0) {
            const exactMatch = filtered.find(
                (item) =>
                    item.type === 'title' &&
                    _.startsWith(_.toLower(item.title), _.toLower(inputValue))
            );
            if (exactMatch) {
                setAutocompleteSuggestion(exactMatch.title);
            } else {
                const bestMatch = filtered[0];
                // Already sorted by priority and similarity
                setAutocompleteSuggestion(bestMatch.title);
            }
        } else {
            setAutocompleteSuggestion('');
        }
    }, [inputValue, masterSuggestionList, usingSuggestions, filterSuggestions]);

    useEffect(() => {
        if (!usingSuggestions) return;
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
    }, [usingSuggestions]);

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
        if (matchIndex > 0) {
            parts.push(
                <span key="prefix" className="_suggestion">
                    {autocompleteSuggestion.slice(0, matchIndex)}
                </span>
            );
        }
        parts.push(
            <span key="match" className="_typed">
                {autocompleteSuggestion.slice(matchIndex, matchIndex + inputValue.length)}
            </span>
        );
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

    // Modify handleClear to reset input state and suggestions using the master list
    const handleClear = (onChange: (value: string) => void) => {
        return (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onChange('');
            setInputValue('');
            setAutocompleteSuggestion('');
            resetSuggestions();
            setIsSimpleBarOpen(true);
            onClear?.();
        };
    };

    // Floating label animation
    const floatingLabelSpring = useSpring({
        transform:
            isFocused || inputValue
                ? 'translateY(-100%) translateX(1vh)'
                : 'translateY(-50%) translateX(6vh)',
        scale: isFocused || inputValue ? 0.85 : 1,
        top: isFocused || inputValue ? '0' : '3.5vh',
        opacity: isFocused || inputValue ? 1 : 0.75,
        config: smoothConfig,
    });

    // Clear button animation
    const clearButtonSpring = useSpring({
        opacity: inputValue ? 1 : 0,
        transform: inputValue ? 'translateY(0)' : 'translateY(25%)',
        config: smoothConfig,
    });

    // Error text animation
    const errorTextSpring = useSpring({
        opacity: error ? 1 : 0,
        top: error ? '50%' : '100%',
        transform: error ? 'translateY(-100%)' : 'translateY(0)',
        right: inputValue ? '6vh' : '1.5vh',
        config: smoothConfig,
    });

    // Suggestions animation
    const suggestionsTransition = useTransition(isSimpleBarOpen && inputItems.length > 0, {
        from: { opacity: 0, transform: 'translateY(-10%)' },
        enter: { opacity: 1, transform: 'translateY(0)' },
        leave: { opacity: 0, transform: 'translateY(-10%)' },
        config: smoothConfig,
    });

    /* Gotta check that shit */
    // Function to check if a string contains Arabic characters
    const containsArabic = (text: string) => {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text);
    };

    // Add these to the existing component state at the top of FormField
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    // Add this click outside handler effect with the existing effects
    useEffect(() => {
        if (!usingSuggestions && type === 'select') {
            const handleClickOutside = (e: MouseEvent) => {
                if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
                    setIsSelectOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [type, usingSuggestions]);

    // Add this transition animation with the existing animations
    const selectTransition = useTransition(isSelectOpen, {
        from: { opacity: 0, transform: 'translateY(-10%)' },
        enter: { opacity: 1, transform: 'translateY(0)' },
        leave: { opacity: 0, transform: 'translateY(-10%)' },
        config: smoothConfig,
    });

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, onBlur, value, ref } }) => {
                onChangeRef.current = onChange;

                const baseInputProps = {
                    onChange: (
                        e: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                        >
                    ) => {
                        const newValue = e.target.value;
                        onChange(newValue);
                        setInputValue(newValue);
                        if (!newValue) {
                            resetSuggestions();
                        }
                    },
                    onBlur: () => {
                        setIsFocused(false);
                        onBlur();
                    },
                    ref,
                    value: value || '',
                    onFocus: () => {
                        setIsFocused(true);
                        if (usingSuggestions) {
                            setIsSimpleBarOpen(true);
                        }
                    },
                };

                // Modify the renderSelect function inside the Controller render prop
                const renderSelect = ({ onChange, onBlur, value, ref }: SelectProps) => (
                    <div className="_customSelectWrapper" ref={selectRef}>
                        <button
                            type="button"
                            className={`_input __select ${value ? '_focused' : ''} ${
                                error ? '__error' : ''
                            }`}
                            onClick={() => setIsSelectOpen(!isSelectOpen)}
                            aria-haspopup="listbox"
                            aria-expanded={isSelectOpen}
                            ref={ref}
                            onBlur={onBlur}
                        >
                            {options.find((opt) => opt.value === value)?.label ||
                                'Select an option'}
                        </button>

                        {selectTransition((style, isOpen) => (
                            <AnimatedWrapper as="div" animationStyle={style}>
                                {isOpen && (
                                    <SimpleBar
                                        className="_SimpleBar"
                                        style={{ maxHeight: '40vh' }}
                                        forceVisible="y"
                                        autoHide={false}
                                    >
                                        <ul className="_SimpleBar-Group" role="listbox">
                                            {options.map((option) => (
                                                <AnimatedWrapper
                                                    as="li"
                                                    key={option.value}
                                                    className={`suggestion-item ${
                                                        value === option.value ? 'selected' : ''
                                                    }`}
                                                    onClick={() => {
                                                        onChange(option.value);
                                                        setIsSelectOpen(false);
                                                    }}
                                                    role="option"
                                                    aria-selected={value === option.value}
                                                >
                                                    {option.label}
                                                </AnimatedWrapper>
                                            ))}
                                        </ul>
                                    </SimpleBar>
                                )}
                            </AnimatedWrapper>
                        ))}
                    </div>
                );

                const downshiftInputProps = usingSuggestions
                    ? getInputProps(baseInputProps as UseComboboxGetInputPropsOptions, {
                          suppressRefError: true,
                      })
                    : baseInputProps;

                return (
                    <div
                        ref={formGroupRef}
                        className={`_formGroup ${onClear && value ? '__notEmpty' : ''} ${
                            icon ? 'hasIcon' : ''
                        }`}
                    >
                        {/* Floating label */}
                        {label && (
                            <AnimatedWrapper
                                as="label"
                                htmlFor={name}
                                className="_floatingLabel"
                                animationStyle={floatingLabelSpring}
                            >
                                {label}
                            </AnimatedWrapper>
                        )}

                        {/* _formControl */}
                        <div
                            className={`_formControl ${type === 'select' && '_selectFormControl'}`}
                        >
                            {icon && <div className="_icon">{icon}</div>}

                            {type === 'textarea' ? (
                                <textarea
                                    className={`_input __textarea ${value ? '_focused' : ''} ${
                                        icon ? '__icon' : ''
                                    } ${error ? '__error' : ''}`}
                                    {...downshiftInputProps}
                                    autoComplete="off"
                                    style={{
                                        color: !autocompleteSuggestion ? 'inherit' : 'transparent',
                                    }}
                                />
                            ) : type === 'select' ? (
                                renderSelect({
                                    onChange: (val: string) => onChange(val),
                                    onBlur,
                                    value: value as string,
                                    ref: ref as React.Ref<HTMLButtonElement>,
                                })
                            ) : (
                                <input
                                    type={type}
                                    className={`_input ${value ? '_focused' : ''} ${
                                        icon ? '__icon' : ''
                                    } ${error ? '__error' : ''}`}
                                    {...downshiftInputProps}
                                    autoComplete="off"
                                    style={{
                                        color: !autocompleteSuggestion ? 'inherit' : 'transparent',
                                    }}
                                />
                            )}
                        </div>

                        {/* Autocorrect */}
                        {usingSuggestions && autocompleteSuggestion && (
                            <AnimatedWrapper
                                as="div"
                                className="_autocorrectWrapper"
                                style={{ opacity: 1 }}
                            >
                                {renderAutocomplete()}
                            </AnimatedWrapper>
                        )}

                        {/* Clear button */}
                        {onClear && value && (
                            <AnimatedWrapper
                                as="button"
                                type="button"
                                onClick={handleClear(onChange)}
                                aria-label="Clear Search"
                                className="_clearButton"
                                animationStyle={clearButtonSpring}
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
                            <AnimatedWrapper
                                as="div"
                                className="__errorText"
                                role="alert"
                                animationStyle={errorTextSpring}
                            >
                                <span>{error}</span>
                            </AnimatedWrapper>
                        )}

                        {/* Suggestions */}
                        {usingSuggestions &&
                            suggestionsTransition(
                                (style, item) =>
                                    item && (
                                        <AnimatedWrapper as="div" animationStyle={style}>
                                            <SimpleBar
                                                className="_SimpleBar"
                                                style={{ maxHeight: '40vh' }}
                                                forceVisible="y"
                                                autoHide={false}
                                            >
                                                <ul
                                                    className="_SimpleBar-Group"
                                                    {...getMenuProps(
                                                        {},
                                                        { suppressRefError: true }
                                                    )}
                                                >
                                                    {groupedSuggestions.map(([type, items]) => (
                                                        <AnimatedWrapper
                                                            key={type}
                                                            as="div"
                                                            className="suggestion-group"
                                                        >
                                                            <div className="suggestion-group-header">
                                                                {type === 'tag' && 'Tags'}
                                                                {type === 'category' &&
                                                                    'Categories'}
                                                                {type === 'author' && 'Authors'}
                                                                {type === 'title' && 'Articles'}
                                                            </div>
                                                            <ul
                                                                className={`suggestionList-${type}`}
                                                            >
                                                                {items.map((item, index) => {
                                                                    const typedItem = item as S;
                                                                    const globalIndex =
                                                                        inputItems.indexOf(
                                                                            typedItem
                                                                        );
                                                                    return (
                                                                        <AnimatedWrapper
                                                                            key={`${typedItem._id}${index}`}
                                                                            as="li"
                                                                            className={`suggestion-item ${
                                                                                highlightedIndex ===
                                                                                globalIndex
                                                                                    ? 'highlighted'
                                                                                    : ''
                                                                            }`}
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
                                                                                            <span
                                                                                                lang={
                                                                                                    containsArabic(
                                                                                                        // Safely combine first + last name with proper undefined handling
                                                                                                        [
                                                                                                            typedItem
                                                                                                                .source
                                                                                                                .author
                                                                                                                ?.firstName,
                                                                                                            typedItem
                                                                                                                .source
                                                                                                                .author
                                                                                                                ?.lastName,
                                                                                                        ]
                                                                                                            .filter(
                                                                                                                (
                                                                                                                    name
                                                                                                                ) =>
                                                                                                                    !_.isEmpty(
                                                                                                                        name
                                                                                                                    )
                                                                                                            ) // Remove empty/undefined names
                                                                                                            .join(
                                                                                                                ' '
                                                                                                            )
                                                                                                    )
                                                                                                        ? 'ar'
                                                                                                        : 'en'
                                                                                                }
                                                                                                className="fullname"
                                                                                            >
                                                                                                {
                                                                                                    typedItem
                                                                                                        .source
                                                                                                        .author
                                                                                                        .firstName
                                                                                                }{' '}
                                                                                                {
                                                                                                    typedItem
                                                                                                        .source
                                                                                                        .author
                                                                                                        .lastName
                                                                                                }
                                                                                            </span>
                                                                                            <span
                                                                                                lang={
                                                                                                    containsArabic(
                                                                                                        typedItem.title
                                                                                                    )
                                                                                                        ? 'ar'
                                                                                                        : 'en'
                                                                                                }
                                                                                                className="username"
                                                                                            >
                                                                                                <span className="at-sign">
                                                                                                    {' '}
                                                                                                    @{' '}
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
                                                                                            {typedItem
                                                                                                .source
                                                                                                .author
                                                                                                .country
                                                                                                ? typedItem
                                                                                                      .source
                                                                                                      .author
                                                                                                      .country
                                                                                                      ._country
                                                                                                : ''}
                                                                                        </div>
                                                                                    </div>
                                                                                ) : typedItem.type ===
                                                                                  'category' ? (
                                                                                    <div className="category-suggestion">
                                                                                        <span
                                                                                            lang={
                                                                                                containsArabic(
                                                                                                    typedItem.title
                                                                                                )
                                                                                                    ? 'ar'
                                                                                                    : 'en'
                                                                                            }
                                                                                            className="category-name"
                                                                                        >
                                                                                            {
                                                                                                typedItem.title
                                                                                            }
                                                                                        </span>
                                                                                        <span className="category-count">
                                                                                            {
                                                                                                allArticles.filter(
                                                                                                    (
                                                                                                        article
                                                                                                    ) =>
                                                                                                        article.category ===
                                                                                                        typedItem.title
                                                                                                )
                                                                                                    .length
                                                                                            }
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
                                                            </ul>
                                                        </AnimatedWrapper>
                                                    ))}
                                                </ul>
                                            </SimpleBar>
                                        </AnimatedWrapper>
                                    )
                            )}
                    </div>
                );
            }}
        />
    );
};

export default FormField;

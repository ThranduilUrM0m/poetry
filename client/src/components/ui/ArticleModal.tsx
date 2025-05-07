'use client';
import React, { useRef, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

// Components
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import FormField from '@/components/ui/FormField';
import Overlay from '@/components/ui/Overlay';

// Redux
import { AppDispatch } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTagSuggestions,
    selectTagSuggestions /* , selectTagsLoading */,
} from '@/slices/tagSlice';
import {
    /* createArticle,
    updateArticle, */
    selectCurrentArticle,
    /* clearCurrentArticle, */
} from '@/slices/articleSlice';

// Icons
import { Hash, Type, AlignLeft, X } from 'lucide-react';
import SimpleBar from 'simplebar-react';

// Form validation schema
const validationSchema: Yup.ObjectSchema<ArticleFormValues, Yup.AnyObject> = Yup.object()
    .shape({
        title: Yup.string()
            .required('Title is required')
            .min(3, 'Title must be at least 3 characters'),

        body: Yup.string()
            .required('Content is required')
            .min(10, 'Content must be at least 10 characters'),

        category: Yup.string()
            .required('Category is required')
            .min(2, 'Category must be at least 2 characters'),

        // tags array must exist (non-undefined) and have at least one non-empty string
        tags: Yup.array()
            .of(Yup.string().required('Tag cannot be empty').trim().min(1, 'Tag cannot be empty'))
            .required('Tags are required')
            .min(1, 'At least one tag is required')
            .default([]),

        // tagInput must always be a string (never undefined)
        tagInput: Yup.string()
            .required() // ensures TS knows it’s always a string
            .default(''), // default into an empty string

        // booleans: always defined, never undefined
        isPrivate: Yup.boolean().required().default(false),

        isFeatured: Yup.boolean().required().default(false),
    })
    .defined();

interface ArticleManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    refreshArticles?: () => Promise<void>;
}

interface ArticleFormValues {
    title: string;
    body: string;
    category: string;
    tags: string[]; // final tags array
    tagInput: string; // free-text input
    isPrivate?: boolean;
    isFeatured?: boolean;
}

const smoothConfig = { mass: 1, tension: 170, friction: 26 };

export default function ArticleManagementModal({ isOpen, onClose }: ArticleManagementModalProps) {
    /* Tags */
    const dispatch = useDispatch<AppDispatch>();
    const tagSuggestions = useSelector(selectTagSuggestions);
    /* const isLoadingTags = useSelector(selectTagsLoading); */

    const {
        control,
        /* handleSubmit, */
        watch,
        /* reset, */
        formState: { errors, isSubmitting },
        setValue,
    } = useForm<ArticleFormValues>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            title: '',
            body: '',
            category: '',
            tags: [],
            tagInput: '',
            isPrivate: false,
            isFeatured: false,
        },
    });

    const title = watch('title');
    const body = watch('body');

    // Fetch suggestions whenever title or body changes
    useEffect(() => {
        if (title || body) {
            dispatch(fetchTagSuggestions({ input: title, content: body }));
        }
    }, [title, body, dispatch]);

    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Refs and state management
    const modalRef = useRef<HTMLDivElement>(null);
    const currentArticle = useSelector(selectCurrentArticle);

    const containsArabic = (text: string): boolean => {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text);
    };

    return (
        <>
            <Overlay isVisible={isOpen} onClick={onClose} zIndex={99} />
            <AnimatedWrapper
                className="_modal__article"
                from={{ opacity: 0, transform: 'translateY(-50px) translateX(-50%)' }}
                to={{ opacity: 1, transform: 'translateY(0) translateX(-50%)' }}
                config={smoothConfig}
                ref={modalRef}
            >
                {/* Header */}
                <div className="_header">
                    {/* Close button */}
                    <AnimatedWrapper
                        as="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="__articleClose"
                        hover={{
                            from: { transform: 'translateX(-1%)', opacity: 0.5 },
                            to: { transform: 'translateX(0)', opacity: 1 },
                        }}
                        click={{ from: { scale: 1 }, to: { scale: 0.9 } }}
                        config={smoothConfig}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                            <g>
                                <line className="one" x1="29.5" y1="49.5" x2="70.5" y2="49.5" />
                                <line className="two" x1="29.5" y1="50.5" x2="70.5" y2="50.5" />
                            </g>
                        </svg>
                        Esc
                    </AnimatedWrapper>
                </div>

                {/* Body */}
                <div className="_body">
                    <form className="_form" /* onSubmit={handleSubmit(onSubmit)} */>
                        <div className="_row">
                            <FormField
                                label="Title"
                                name="title"
                                type="text"
                                control={control}
                                error={errors.title?.message}
                                icon={<Type />}
                                rules={{ required: 'Title is required' }}
                            />

                            <FormField
                                label="Category"
                                name="category"
                                type="text"
                                control={control}
                                error={errors.category?.message}
                                icon={<AlignLeft />}
                                rules={{ required: 'Category is required' }}
                            />
                        </div>

                        <div className="_row __textarea">
                            <FormField
                                name="body"
                                type="quill"
                                control={control}
                                error={errors.body?.message}
                                rules={{ required: 'Content is required' }}
                            />
                        </div>

                        <div className="_row">
                            <FormField
                                label="Tags"
                                name="tagInput"
                                type="text"
                                icon={<Hash />}
                                error={
                                    tagSuggestions.length === 0
                                        ? 'No exact matches found, here are some suggestions.'
                                        : errors.tags?.message
                                }
                                suggestions={tagSuggestions.map((tag) => ({
                                    _id: tag,
                                    title: tag,
                                    type: 'tag',
                                    sourceType: 'Article',
                                }))}
                                control={control}
                                onClear={() => setValue('tagInput', '')}
                                onInputChange={(val: string) => {
                                    setValue('tagInput', val);
                                    dispatch(
                                        fetchTagSuggestions({ input: val, content: watch('body') })
                                    );
                                }}
                                onSuggestionSelect={(s) => {
                                    if (!selectedTags.includes(s.title)) {
                                        setSelectedTags((prev) => [...prev, s.title]); // update local state
                                        setValue('tags', [...selectedTags, s.title]); // mirror into form if needed
                                    }
                                    setValue('tagInput', ''); // clear input :contentReference[oaicite:3]{index=3}
                                }}
                                selectedSuggestions={selectedTags.map((t) => ({
                                    _id: t,
                                    title: t,
                                    type: 'tag',
                                    sourceType: 'Article',
                                }))}
                            />

                            <AnimatedWrapper
                                className="__container"
                                from={{ opacity: 0 }}
                                to={{ opacity: 1 }}
                                config={smoothConfig}
                            >
                                <div className="__tagsGrid">
                                    <SimpleBar
                                        className="_SimpleBar"
                                        forceVisible="x"
                                        autoHide={false}
                                    >
                                        <div className="__tagsGrid-content">
                                            {selectedTags.map((tag) => (
                                                <AnimatedWrapper
                                                    key={tag}
                                                    className="__tagCard"
                                                    from={{ opacity: 0 }}
                                                    to={{ opacity: 0.8 }}
                                                    config={smoothConfig}
                                                >
                                                    <Hash />
                                                    <span lang={containsArabic(tag) ? 'ar' : 'en'}>
                                                        {tag}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            const filtered = selectedTags.filter(
                                                                (t) => t !== tag
                                                            );
                                                            setSelectedTags(filtered);
                                                            setValue('tags', filtered);
                                                        }}
                                                        aria-label={`Remove ${tag}`}
                                                        className="remove-tag"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </AnimatedWrapper>
                                            ))}
                                        </div>
                                    </SimpleBar>
                                </div>
                            </AnimatedWrapper>
                        </div>

                        <div className="_row">
                            <FormField
                                label="Private"
                                name="isPrivate"
                                type="checkbox"
                                control={control}
                            />

                            <button
                                type="submit"
                                className="_button"
                                id="_buttonArticle"
                                disabled={isSubmitting}
                            >
                                {/* The sequential effect is still a mystery and the background effect is not reversing with ease */}
                                <AnimatedWrapper
                                    as="span"
                                    className="buttonBackground"
                                    hover={{
                                        from: { clipPath: 'inset(0 100% 0 0)' },
                                        to: { clipPath: 'inset(0 0 0 0)' },
                                    }}
                                    config={{ mass: 1, tension: 170, friction: 26 }}
                                    parentHoverSelector="#_buttonArticle"
                                ></AnimatedWrapper>
                                <div className="buttonBorders">
                                    {/* Top border: animate width */}
                                    <AnimatedWrapper
                                        as="div"
                                        className="borderTop"
                                        hover={{
                                            from: { width: '0%' },
                                            to: { width: '100%' },
                                            delay: 0,
                                        }}
                                        parentHoverSelector="#_buttonArticle" // <-- Updated parent hover selector
                                        onRest={() => {
                                            // Trigger the next animation after this one completes
                                            document
                                                .querySelector('.borderRight')
                                                ?.dispatchEvent(new Event('startAnimation'));
                                        }}
                                    />
                                    {/* Right border: animate height */}
                                    <AnimatedWrapper
                                        as="div"
                                        className="borderRight"
                                        hover={{
                                            from: { height: '0%' },
                                            to: { height: '100%' },
                                            delay: 0, // Start immediately after the previous animation
                                        }}
                                        parentHoverSelector="#_buttonArticle" // <-- Updated parent hover selector
                                        onRest={() => {
                                            // Trigger the next animation after this one completes
                                            document
                                                .querySelector('.borderBottom')
                                                ?.dispatchEvent(new Event('startAnimation'));
                                        }}
                                    />
                                    {/* Bottom border: animate width */}
                                    <AnimatedWrapper
                                        as="div"
                                        className="borderBottom"
                                        hover={{
                                            from: { width: '0%' },
                                            to: { width: '100%' },
                                            delay: 0, // Start immediately after the previous animation
                                        }}
                                        parentHoverSelector="#_buttonArticle" // <-- Updated parent hover selector
                                        onRest={() => {
                                            // Trigger the next animation after this one completes
                                            document
                                                .querySelector('.borderLeft')
                                                ?.dispatchEvent(new Event('startAnimation'));
                                        }}
                                    />
                                    {/* Left border: animate height */}
                                    <AnimatedWrapper
                                        as="div"
                                        className="borderLeft"
                                        hover={{
                                            from: { height: '0%' },
                                            to: { height: '100%' },
                                            delay: 0, // Start immediately after the previous animation
                                        }}
                                        parentHoverSelector="#_buttonArticle" // <-- Updated parent hover selector
                                    />
                                </div>
                                <AnimatedWrapper
                                    as="span"
                                    className="buttonContent"
                                    hover={{
                                        from: {
                                            color: 'rgb(var(--text)/1)',
                                        },
                                        to: {
                                            color: 'rgb(var(--white)/1)',
                                        },
                                    }}
                                    config={{
                                        mass: 1,
                                        tension: 170,
                                        friction: 26,
                                    }}
                                    parentHoverSelector="#_buttonArticle"
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : currentArticle
                                        ? 'Update'
                                        : 'Create'}
                                    <b className="__dot">.</b>
                                </AnimatedWrapper>
                            </button>
                        </div>
                    </form>
                </div>
            </AnimatedWrapper>
        </>
    );
}

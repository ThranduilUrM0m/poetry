'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getFingerprint } from '@/components/fingerprint';
import {
    ThumbsUp,
    ThumbsDown,
    AtSign,
    ChevronRight,
    MessageSquareText,
    User,
    Squircle,
    Eye,
    MessageSquareReply,
    FilePenLine,
    Trash2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import SimpleBar from 'simplebar-react';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import FormField from '@/components/ui/FormField';
import { useLoading } from '@/context/LoadingContext';
import SectionObserver from '@/components/SectionObserver';
import SubmitModal from '@/components/ui/SubmitModal';
import { Article, Comment, Vote } from '@/types/article';
import {
    fetchArticleBySlug,
    selectCurrentArticle,
    selectIsLoading,
    voteArticle,
    trackView,
    fetchUpdatedArticle,
} from '@/slices/articleSlice';
import {
    fetchCommentsByArticle,
    selectComments,
    selectCurrentComment,
    selectError as selectErrorComment,
    createComment,
    updateComment,
    setCurrentComment,
    clearCurrentComment,
    deleteComment,
    voteComment,
    setComments,
    clearCommentState,
} from '@/slices/commentSlice';

interface FormData {
    Parent: string | null;
    _comment_author: string;
    _comment_email: string;
    _comment_body: string;
    _comment_isPrivate: boolean;
    _comment_fingerprint: string;
    article: Article;
}

const validationSchema = Yup.object().shape({
    Parent: Yup.string().nullable().default(null),
    _comment_author: Yup.string()
        .required('Please provide a valid full name.')
        .min(2, 'Must be at least 2 characters.')
        .matches(/^[a-zA-Z\s]*$/i, 'No numbers or symbols.'),
    _comment_email: Yup.string()
        .required('Email is required')
        .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, 'Invalid email format'),
    _comment_body: Yup.string().required('Please provide a message.'),
    _comment_isPrivate: Yup.boolean().default(false),
    _comment_fingerprint: Yup.string().default(''),
    article: Yup.mixed<Article>().test(
        'article-required',
        'Article is required',
        (value) => !!value?._id
    ),
}) as Yup.ObjectSchema<FormData>;

export function extractHTMLContent(htmlContent: string): string {
    if (!htmlContent) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.innerHTML;
}

export interface CommentTree extends Comment {
    children?: CommentTree[];
}

export const buildCommentTree = (comments: Comment[]): CommentTree[] => {
    const commentMap: { [id: string]: CommentTree } = {};
    const roots: CommentTree[] = [];

    // Create a lookup map
    comments.forEach((comment) => {
        if (comment._id) {
            commentMap[comment._id] = { ...comment, children: [] };
        }
    });

    // Build the tree by grouping children with their parent
    comments.forEach((comment) => {
        if (comment.Parent && commentMap[comment.Parent]) {
            commentMap[comment.Parent].children!.push(commentMap[comment._id!]);
        } else if (comment._id) {
            roots.push(commentMap[comment._id]);
        }
    });

    return roots;
};

interface CommentCardProps {
    comment: CommentTree;
    level?: number;
    fingerprint: string;
    currentComment: Comment | null;
    handleReply: (comment: Comment) => void;
    handleEditComment: (comment: Comment) => void;
    handleCommentVote: (commentId: string, type: 'up' | 'down') => void;
    handleDeleteComment: (commentId: string) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({
    comment,
    level = 0,
    fingerprint,
    currentComment,
    handleReply,
    handleEditComment,
    handleCommentVote,
    handleDeleteComment,
}) => {
    // Compute votes from the unified vote model for comments:
    const votes: Vote[] = comment._comment_votes ?? [];
    const upvotes = votes.filter((vote: Vote) => vote.direction === 'up');
    const downvotes = votes.filter((vote: Vote) => vote.direction === 'down');
    const hasUserUpvoted = votes.some(
        (vote) => vote.voter === fingerprint && vote.direction === 'up'
    );
    const hasUserDownvoted = votes.some(
        (vote) => vote.voter === fingerprint && vote.direction === 'down'
    );

    return (
        <div className={`_card ${level > 0 ? `_cardReply-${level}` : ''}`}>
            <div className="_cardBody">
                <div className="_topRow">
                    <p className="author">
                        <b>{_.capitalize(comment._comment_author)}</b> ,{' '}
                        {comment.updatedAt &&
                            formatDistanceToNow(new Date(comment.updatedAt), { addSuffix: true })}
                    </p>
                    {/* If this comment is a reply, you might want to add a "Replied to" indicator.
                You can use comment.Parent (or fetch parent details if needed). */}
                    {comment.Parent && (
                        <div className="__replyingTo">
                            <AtSign />
                            <span> Replied</span>
                        </div>
                    )}
                    {currentComment?._id === comment._id && (
                        <div className="__editing">Editing</div>
                    )}
                </div>
                <div className="_middleRow">
                    <h4>{_.capitalize(comment._comment_body)}</h4>
                </div>
                <div className="_bottomRow">
                    <div className={`upvotes ${!hasUserUpvoted ? '' : 'active'}`}>
                        <button
                            type="button"
                            onClick={() => handleCommentVote(comment._id!, 'up')}
                            className={!hasUserUpvoted ? '' : 'active'}
                        >
                            <ThumbsUp /> {upvotes.length}
                        </button>
                    </div>
                    <div className={`downvotes ${!hasUserDownvoted ? '' : 'active'}`}>
                        <button
                            type="button"
                            onClick={() => handleCommentVote(comment._id!, 'down')}
                            className={!hasUserDownvoted ? '' : 'active'}
                        >
                            <ThumbsDown /> {downvotes.length}
                        </button>
                    </div>

                    <div className="reply">
                        <button type="button" onClick={() => handleReply(comment)}>
                            <MessageSquareReply /> Reply
                        </button>
                    </div>
                    {comment._comment_fingerprint === fingerprint && (
                        <>
                            <div className="edit">
                                <button type="button" onClick={() => handleEditComment(comment)}>
                                    <FilePenLine /> Edit
                                </button>
                            </div>
                            <div className="delete">
                                <button
                                    type="button"
                                    onClick={() => handleDeleteComment(comment._id!)}
                                >
                                    <Trash2 /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {comment.children && comment.children.length > 0 && (
                <div className="_replies">
                    {comment.children.map((child) => (
                        <CommentCard
                            key={child._id}
                            comment={child}
                            level={level + 1}
                            fingerprint={fingerprint}
                            currentComment={currentComment}
                            handleReply={handleReply}
                            handleEditComment={handleEditComment}
                            handleCommentVote={handleCommentVote}
                            handleDeleteComment={handleDeleteComment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function ArticlePage() {
    const params = useParams();
    const category = Array.isArray(params.category) ? params.category[0] : params.category;
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const { isLoaded } = useLoading();
    const dispatch = useDispatch<AppDispatch>();

    // Redux state selectors
    const article = useSelector(selectCurrentArticle);
    const isLoading = useSelector(selectIsLoading);
    const comments = useSelector(selectComments);
    const currentComment = useSelector(selectCurrentComment);
    const errorComment = useSelector(selectErrorComment);

    // Local state
    const [isReady, setIsReady] = useState(false);
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [submitHeader, setSubmitHeader] = useState('');
    const [submitMessage, setSubmitMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [fingerprint, setFingerprint] = useState('');
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
    const [formReset, setFormReset] = useState(false);

    // Form setup
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        clearErrors,
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            Parent: null,
            _comment_author: '',
            _comment_email: '',
            _comment_body: '',
            _comment_isPrivate: false,
            _comment_fingerprint: '',
            article: article || ({} as Article),
        },
    });

    // Initial effects: retrieve fingerprint
    useEffect(() => {
        const initFingerprint = async () => {
            const fp = await getFingerprint();
            setFingerprint(fp);
        };
        initFingerprint();
    }, []);

    // Fetch article by slug when category and slug are available
    useEffect(() => {
        if (category && slug) {
            dispatch(fetchArticleBySlug({ category, slug }));
        }
    }, [category, slug, dispatch]);

    // Fetch comments when the article is loaded
    useEffect(() => {
        if (article?._id) {
            dispatch(fetchCommentsByArticle(article._id));
        }
    }, [article, dispatch]);

    // Enhanced view tracking:
    // Check if the article has been viewed before by this fingerprint.
    // If not, dispatch trackView and then set a flag in localStorage.
    useEffect(() => {
        if (article?._id && fingerprint) {
            const viewKey = `viewed_${article._id}`;
            const alreadyViewed = localStorage.getItem(viewKey);
            if (!alreadyViewed) {
                dispatch(trackView({ articleId: article._id, fingerprint }));
                if (category && slug) {
                    dispatch(fetchArticleBySlug({ category, slug }));
                }
                localStorage.setItem(viewKey, 'true');
            }
        }
    }, [article?._id, fingerprint, category, slug, dispatch]);

    // Ready state after article has loaded
    useEffect(() => {
        if (isLoaded && !isLoading && article) {
            const timer = setTimeout(() => setIsReady(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, isLoading, article]);

    useEffect(() => {
        if (currentComment) {
            reset({
                ...currentComment,
                article: article || currentComment.article,
            });
        } else {
            reset({
                Parent: null,
                _comment_author: '',
                _comment_email: '',
                _comment_body: '',
                _comment_isPrivate: false,
                _comment_fingerprint: fingerprint,
                article: article || ({} as Article),
            });
        }
    }, [currentComment, article, fingerprint, reset]);

    useEffect(() => {
        if (article && !currentComment) {
            setValue('article', article);
        }
    }, [article, currentComment, setValue]);

    useEffect(() => {
        if (article?._id) {
            // Fetch the updated article data after the view is added
            dispatch(fetchUpdatedArticle(article._id));
        }
    }, [article?._id, dispatch]);

    // Comment handlers
    const handleReply = (comment: Comment) => {
        reset({
            Parent: comment._id!, // Set parent ID
            _comment_author: '',
            _comment_email: '',
            _comment_body: `@${comment._comment_author} `,
            _comment_isPrivate: false,
            _comment_fingerprint: fingerprint,
            article: article!,
        });

        // Optional: Automatically focus the message field
        setTimeout(() => {
            const textarea = document.querySelector('textarea[name="_comment_body"]');
            if (textarea) {
                (textarea as HTMLElement).focus();
                // Move cursor to end
                const length = (textarea as HTMLTextAreaElement).value.length;
                (textarea as HTMLTextAreaElement).setSelectionRange(length, length);
            }
        }, 0);
    };

    const handleEditComment = (comment: Comment) => {
        if (comment._comment_fingerprint === fingerprint) {
            dispatch(setCurrentComment(comment as Required<Comment>));
        }
    };

    const handleCommentVote = async (commentId: string, direction: 'up' | 'down') => {
        if (!fingerprint) return;

        // Find the comment in the current state
        const comment = comments.find((c) => c._id === commentId);
        if (!comment) return;

        // Optimistically update the UI
        const previousVotes = comment._comment_votes || [];
        const hasUserVoted = previousVotes.some((vote) => vote.voter === fingerprint);
        const updatedVotes =
            hasUserVoted && previousVotes.some((vote) => vote.direction === direction)
                ? previousVotes.filter((vote) => vote.voter !== fingerprint) // Remove vote if toggled
                : [
                      ...previousVotes.filter((vote) => vote.voter !== fingerprint), // Remove previous vote
                      { voter: fingerprint, direction } as Vote, // Add new vote
                  ];

        // Update the local state
        const updatedComments = comments.map((c) =>
            c._id === commentId ? { ...c, _comment_votes: updatedVotes } : c
        );
        dispatch(setComments(updatedComments));

        try {
            // Dispatch the vote action to the backend
            await dispatch(voteComment({ commentId, direction, fingerprint }));
        } catch (error) {
            console.error(error);
            // Revert the optimistic update in case of an error
            dispatch(setComments(comments));
        }
    };

    // Define the handleDeleteComment function
    const handleDeleteComment = async (commentId: string) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await dispatch(deleteComment({ id: commentId, fingerprint }));
                if (article?._id) {
                    dispatch(fetchCommentsByArticle(article._id)); // Refetch comments
                }
            } catch (error) {
                console.error('Failed to delete comment:', error);
            }
        }
    };

    // Article voting
    const handleArticleVote = async (direction: 'up' | 'down') => {
        if (!article?._id || !fingerprint) return;
        const previousVote = userVote;
        try {
            setUserVote(direction);
            await dispatch(voteArticle({ articleId: article._id, direction, fingerprint }));
        } catch (error) {
            console.error(error);
            setUserVote(previousVote);
        }
    };

    // Form submission
    const onSubmit = async (data: FormData) => {
        try {
            const isEdit = !!currentComment?._id;

            // Add validation check
            if (isEdit && !currentComment?._id) {
                throw new Error('Invalid comment ID for editing');
            }

            // Verify fingerprint matches before allowing edit
            if (isEdit && currentComment._comment_fingerprint !== fingerprint) {
                throw new Error("You can't edit this comment");
            }

            const commentPayload: Partial<Comment> = {
                ...data,
                _comment_fingerprint: fingerprint,
                article: article || data.article, // Send only the article ID
            };

            if (isEdit) {
                // Verify fingerprint matches before allowing edit
                if (currentComment._comment_fingerprint !== fingerprint) {
                    throw new Error("You can't edit this comment");
                }
                await dispatch(
                    updateComment({
                        id: currentComment._id!,
                        data: commentPayload,
                    })
                ).unwrap();
            } else {
                await dispatch(createComment(commentPayload)).unwrap();
            }

            // Reset form and state
            reset({
                Parent: null,
                _comment_author: '',
                _comment_email: '',
                _comment_body: '', // This clears the @ mention
                _comment_isPrivate: false,
                _comment_fingerprint: fingerprint,
                article: article!,
            });
            setFormReset(true); // Trigger FormField reset
            setTimeout(() => setFormReset(false), 100); // Reset trigger
            dispatch(clearCurrentComment());
            dispatch(clearCommentState());
            if (article?._id) {
                dispatch(fetchCommentsByArticle(article._id));
            }
            setSubmitHeader('Success!');
            setSubmitMessage(
                currentComment?._id
                    ? 'Comment updated successfully!'
                    : 'Comment submitted successfully!'
            );
            setIsSuccess(true);
            setIsSubmitOpen(true);
        } catch (error) {
            console.log(error);
            setSubmitHeader("We're sorry!");
            setSubmitMessage('Something went wrong while submitting your comment');
            setIsSuccess(false);
            setIsSubmitOpen(true);
        }
    };

    // Error handling
    useEffect(() => {
        if (errorComment) {
            setSubmitMessage(errorComment);
            setIsSuccess(false);
            setIsSubmitOpen(true);
        }
    }, [errorComment]);

    const handleClearField = (fieldName: keyof FormData) => {
        setValue(fieldName, '');
        clearErrors(fieldName);
    };

    // UI helpers
    const containsArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

    // Build the nested comment tree
    const nestedComments = buildCommentTree(comments.filter((c) => !c._comment_isPrivate));

    return (
        <main className="post">
            <SectionObserver theme="dark">
                <section className="post__section-1 !h-full">
                    <AnimatedWrapper
                        as="div"
                        className="post__section-1-wrapper"
                        from={{ transform: 'translateY(-100%)', opacity: 0 }}
                        to={isReady ? { transform: 'translateY(0)', opacity: 1 } : undefined}
                        config={{ mass: 1, tension: 170, friction: 26 }}
                        delay={1000}
                    >
                        {!_.isEmpty(article) && (
                            <>
                                {/* Article Header */}
                                <nav className="__breadcrumb">
                                    <ul>
                                        <li>
                                            <Link href="/">Home</Link>
                                            <ChevronRight />
                                        </li>
                                        <li>
                                            <Link href="/blog">Blog</Link>
                                            <ChevronRight />
                                        </li>
                                        <li>
                                            <Link href={`/blog/${article.category.toLowerCase()}`}>
                                                {article.category}
                                            </Link>
                                            <ChevronRight />
                                        </li>
                                        <li aria-current="page">
                                            <span>{article.title}</span>
                                        </li>
                                    </ul>
                                </nav>

                                {/* Main Article Content */}
                                <div className="__postBox">
                                    <div className="_card">
                                        <div className="_cardBody">
                                            <form className="_form">
                                                <span
                                                    lang={
                                                        containsArabic(article.category)
                                                            ? 'ar'
                                                            : 'en'
                                                    }
                                                    className="articleCategory"
                                                >
                                                    {article.category}
                                                </span>

                                                <h2
                                                    lang={
                                                        containsArabic(article.title) ? 'ar' : 'en'
                                                    }
                                                    className="articleTitle"
                                                >
                                                    {article.title}
                                                </h2>

                                                <h2 className="articleAuthorCreation">
                                                    <span
                                                        lang={
                                                            containsArabic(
                                                                _.isEmpty(
                                                                    article.author.lastName
                                                                ) &&
                                                                    _.isEmpty(
                                                                        article.author.firstName
                                                                    )
                                                                    ? article.author.username
                                                                    : !_.isEmpty(
                                                                          article.author.lastName
                                                                      )
                                                                    ? `${article.author.lastName} ${
                                                                          article.author
                                                                              .firstName ?? ''
                                                                      }`.trim()
                                                                    : article.author.firstName ?? ''
                                                            )
                                                                ? 'ar'
                                                                : 'en'
                                                        }
                                                    >
                                                        {_.isEmpty(article.author.lastName) &&
                                                        _.isEmpty(article.author.firstName)
                                                            ? article.author.username
                                                            : !_.isEmpty(article.author.lastName)
                                                            ? `${article.author.lastName} ${
                                                                  article.author.firstName ?? ''
                                                              }`.trim()
                                                            : article.author.firstName ?? ''}
                                                    </span>
                                                    <Squircle />
                                                    <span>
                                                        {formatDistanceToNow(
                                                            new Date(article.updatedAt!),
                                                            {
                                                                addSuffix: true,
                                                            }
                                                        )}
                                                    </span>
                                                </h2>

                                                <div
                                                    lang={
                                                        containsArabic(article.body) ? 'ar' : 'en'
                                                    }
                                                    className="articleBody"
                                                    dangerouslySetInnerHTML={{
                                                        __html: extractHTMLContent(article.body),
                                                    }}
                                                />
                                            </form>
                                        </div>
                                    </div>

                                    {/* Voting Section */}
                                    <div className="articleControl">
                                        <button
                                            onClick={() => handleArticleVote('up')}
                                            className={userVote === 'up' ? 'active' : ''}
                                        >
                                            <ThumbsUp />{' '}
                                            {_.size(
                                                article?.votes?.filter(
                                                    (vote: Vote) => vote.direction === 'up'
                                                ) || []
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleArticleVote('down')}
                                            className={userVote === 'down' ? 'active' : ''}
                                        >
                                            <ThumbsDown />{' '}
                                            {_.size(
                                                article?.votes?.filter(
                                                    (vote: Vote) => vote.direction === 'down'
                                                ) || []
                                            )}
                                        </button>
                                        <div>
                                            {/* It won't show anything correct as long as the article isn't in the database */}
                                            <Eye /> {article?.views?.length || 0}
                                        </div>
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div className="__comments">
                                    <div className="__comments-left">
                                        <div className="_card">
                                            <div className="_cardBody">
                                                <form
                                                    className="_form"
                                                    onSubmit={handleSubmit(onSubmit)}
                                                >
                                                    <div className="_row">
                                                        <FormField
                                                            label="Email"
                                                            name="_comment_email"
                                                            value={
                                                                currentComment?._comment_email || ''
                                                            }
                                                            type="text"
                                                            control={control}
                                                            error={errors._comment_email?.message}
                                                            rules={{
                                                                required: 'Email is required',
                                                            }}
                                                            onClear={() =>
                                                                handleClearField('_comment_email')
                                                            }
                                                            icon={<AtSign />}
                                                            forceReset={formReset}
                                                        />
                                                        <FormField
                                                            label="Full name"
                                                            name="_comment_author"
                                                            value={
                                                                currentComment?._comment_author ||
                                                                ''
                                                            }
                                                            type="text"
                                                            control={control}
                                                            error={errors._comment_author?.message}
                                                            rules={{
                                                                required: 'Full Name is required',
                                                            }}
                                                            onClear={() =>
                                                                handleClearField('_comment_author')
                                                            }
                                                            icon={<User />}
                                                            forceReset={formReset}
                                                        />
                                                    </div>
                                                    <div className="_row __textarea">
                                                        <FormField
                                                            label="Add comment..."
                                                            name="_comment_body"
                                                            value={
                                                                currentComment?._comment_body || ''
                                                            }
                                                            type="textarea"
                                                            control={control}
                                                            error={errors._comment_body?.message}
                                                            rules={{
                                                                required: 'Message is required',
                                                            }}
                                                            onClear={() =>
                                                                handleClearField('_comment_body')
                                                            }
                                                            icon={<MessageSquareText />}
                                                            forceReset={formReset}
                                                        />
                                                    </div>
                                                    <div className="_row">
                                                        <FormField
                                                            label="Only for Poet"
                                                            name="_comment_isPrivate"
                                                            value={
                                                                currentComment?._comment_isPrivate ||
                                                                false
                                                            }
                                                            type="checkbox"
                                                            control={control}
                                                            error={
                                                                errors._comment_isPrivate?.message
                                                            }
                                                            onClear={() =>
                                                                handleClearField(
                                                                    '_comment_isPrivate'
                                                                )
                                                            }
                                                        />

                                                        {currentComment ||
                                                        watch('_comment_body').startsWith('@') ? (
                                                            <button
                                                                type="button"
                                                                className="_button __cancelButton"
                                                                id="_buttonCancel"
                                                                onClick={() => {
                                                                    dispatch(clearCurrentComment());
                                                                    reset({
                                                                        Parent: null,
                                                                        _comment_author: '',
                                                                        _comment_email: '',
                                                                        _comment_body: '',
                                                                        _comment_isPrivate: false,
                                                                        _comment_fingerprint:
                                                                            fingerprint,
                                                                        article:
                                                                            article ||
                                                                            ({} as Article),
                                                                    });
                                                                }}
                                                            >
                                                                <AnimatedWrapper
                                                                    as="div"
                                                                    className="buttonContent"
                                                                    hover={{
                                                                        from: {
                                                                            color: 'rgb(var(--text)/1)',
                                                                        },
                                                                        to: {
                                                                            color: 'rgb(var(--redNo)/1)',
                                                                        },
                                                                    }}
                                                                    config={{
                                                                        mass: 1,
                                                                        tension: 170,
                                                                        friction: 26,
                                                                    }}
                                                                    parentHoverSelector="#_buttonCancel"
                                                                >
                                                                    Cancel<b className="__dot">.</b>
                                                                </AnimatedWrapper>
                                                            </button>
                                                        ) : null}

                                                        <button
                                                            type="submit"
                                                            className="_button __flex1"
                                                            id="_buttonComment"
                                                            disabled={isLoading}
                                                        >
                                                            {/* The sequential effect is still a mystery and the background effect is not reversing with ease */}
                                                            <AnimatedWrapper
                                                                as="span"
                                                                className="buttonBackground"
                                                                hover={{
                                                                    from: {
                                                                        clipPath:
                                                                            'inset(0 100% 0 0)',
                                                                    },
                                                                    to: {
                                                                        clipPath: 'inset(0 0 0 0)',
                                                                    },
                                                                }}
                                                                config={{
                                                                    mass: 1,
                                                                    tension: 170,
                                                                    friction: 26,
                                                                }}
                                                                parentHoverSelector="#_buttonComment"
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
                                                                    parentHoverSelector="#_buttonComment" // <-- Updated parent hover selector
                                                                    onRest={() => {
                                                                        // Trigger the next animation after this one completes
                                                                        document
                                                                            .querySelector(
                                                                                '.borderRight'
                                                                            )
                                                                            ?.dispatchEvent(
                                                                                new Event(
                                                                                    'startAnimation'
                                                                                )
                                                                            );
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
                                                                    parentHoverSelector="#_buttonComment" // <-- Updated parent hover selector
                                                                    onRest={() => {
                                                                        // Trigger the next animation after this one completes
                                                                        document
                                                                            .querySelector(
                                                                                '.borderBottom'
                                                                            )
                                                                            ?.dispatchEvent(
                                                                                new Event(
                                                                                    'startAnimation'
                                                                                )
                                                                            );
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
                                                                    parentHoverSelector="#_buttonComment" // <-- Updated parent hover selector
                                                                    onRest={() => {
                                                                        // Trigger the next animation after this one completes
                                                                        document
                                                                            .querySelector(
                                                                                '.borderLeft'
                                                                            )
                                                                            ?.dispatchEvent(
                                                                                new Event(
                                                                                    'startAnimation'
                                                                                )
                                                                            );
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
                                                                    parentHoverSelector="#_buttonComment" // <-- Updated parent hover selector
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
                                                                parentHoverSelector="#_buttonComment"
                                                            >
                                                                {isLoading
                                                                    ? 'Submitting...'
                                                                    : 'Submit'}
                                                                <b className="__dot">.</b>
                                                            </AnimatedWrapper>
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="__comments-right">
                                        <div className="__title">
                                            Comments
                                            <p>
                                                {_.size(
                                                    _.filter(comments, (c) => !c._comment_isPrivate)
                                                )}
                                            </p>
                                        </div>
                                        <SimpleBar
                                            style={{ maxHeight: '40vh' }}
                                            forceVisible="y"
                                            autoHide={false}
                                        >
                                            {nestedComments.map((comment) => (
                                                <CommentCard
                                                    key={comment._id}
                                                    comment={comment}
                                                    fingerprint={fingerprint}
                                                    currentComment={currentComment}
                                                    handleReply={handleReply}
                                                    handleEditComment={handleEditComment}
                                                    handleCommentVote={handleCommentVote}
                                                    handleDeleteComment={handleDeleteComment}
                                                />
                                            ))}
                                        </SimpleBar>
                                    </div>
                                </div>
                            </>
                        )}
                    </AnimatedWrapper>
                </section>
            </SectionObserver>

            <SectionObserver theme="light">
                <section className="post__section-4"></section>
            </SectionObserver>

            <SubmitModal
                isSubmitOpen={isSubmitOpen}
                onSubmitClose={() => {
                    setIsSubmitOpen(false);
                    dispatch(clearCurrentComment());
                    dispatch(clearCommentState());
                    reset({
                        Parent: null,
                        _comment_author: '',
                        _comment_email: '',
                        _comment_body: '',
                        _comment_isPrivate: false,
                        _comment_fingerprint: fingerprint,
                        article: article!,
                    });
                }}
                header={submitHeader}
                message={submitMessage}
                isSuccess={isSuccess}
            />
        </main>
    );
}

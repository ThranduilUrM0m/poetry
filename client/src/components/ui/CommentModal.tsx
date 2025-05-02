'use client';

// Core React and third-party imports
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { /* format,  */ sub } from 'date-fns';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import _ from 'lodash';
/* import { config } from '@react-spring/web'; */

// Table-related imports
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getFilteredRowModel,
    /* getSortedRowModel, */
    FilterFn,
    SortingState,
    RowSelectionState,
    Row,
} from '@tanstack/react-table';

// Component imports
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import Overlay from '@/components/ui/Overlay';
import FormField from '@/components/ui/FormField';

// Type and interface imports
import type { Comment, Vote } from '@/types/article';

// Icon imports
import {
    Search,
    Timer,
    Trash2,
    /* CheckCircle,
    XCircle, */
    ThumbsUp,
    ThumbsDown,
    ChevronUp,
    ChevronDown,
    FileX2,
    /* MessageSquare, */
} from 'lucide-react';

// API and services
import {
    selectCommentAnalysis,
    analyzeComments,
    deleteComment,
    updateComment,
} from '@/slices/commentSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import SimpleBar from 'simplebar-react';

// Type declarations
type SortableValue = string | number | boolean | null | undefined;
type CommentWithDepth = Comment & { depth: number };
type TimeFrameOption = '24h' | '7d' | '30d' | '6m' | 'all';
const smoothConfig = { tension: 300, friction: 30 };

interface CommentManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    comments: Comment[];
    refreshComments: () => Promise<void>;
}

// Validation schema
const validationSchema = Yup.object().shape({
    globalFilter: Yup.string().default(''),
    timeFrameOption: Yup.mixed<TimeFrameOption>()
        .required()
        .oneOf(['24h', '7d', '30d', '6m', 'all'])
        .default('all'),
});

// Custom filter function
const commentFuzzyFilter: FilterFn<Comment> = (row, columnId, value) => {
    const itemValue = row.getValue(columnId) as string;
    return itemValue.toLowerCase().includes(value.toLowerCase());
};

// Cells
/* _comment_isOK */
const StatusCell: React.FC<{ row: Row<Comment>; onUpdate: () => void }> = ({ row, onUpdate }) => {
    const [isApproved, setIsApproved] = useState(row.original._comment_isOK);
    const dispatch = useDispatch<AppDispatch>();

    const toggleApproval = async () => {
        try {
            await dispatch(
                updateComment({
                    id: row.original._id!,
                    data: { _comment_isOK: !isApproved },
                })
            ).unwrap();
            setIsApproved(!isApproved);
            onUpdate();
        } catch (error) {
            console.error('Failed to update comment status:', error);
        }
    };

    return (
        <button
            className={`__status-toggle ${isApproved ? '__approved' : '__pending'}`}
            onClick={toggleApproval}
        >
            {isApproved ? 'Approved' : 'Pending'}
        </button>
    );
};

const CommentBodyCell: React.FC<{ row: Row<Comment> }> = ({ row }) => {
    const analysis = useSelector(selectCommentAnalysis(row.original._id!));
    const isFlagged = analysis?.reasons?.length > 0;

    return (
        <span className={`__body ${isFlagged ? '__flagged-content' : ''}`}>
            {_.capitalize(row.original._comment_body)}
        </span>
    );
};

const FlaggedCell: React.FC<{ id: string }> = ({ id }) => {
    const analysis = useSelector(selectCommentAnalysis(id));
    return (
        <div className="__flag-indicator">
            {analysis?.reasons?.length > 0 && (
                <div className="__analysis-tooltip">
                    {analysis.reasons.map((r) => _.capitalize(r)).join(', ')}
                </div>
            )}
        </div>
    );
};

/* isFeatured */
const FeaturedCell: React.FC<{ row: Row<Comment>; onUpdate: () => void }> = ({ row, onUpdate }) => {
    const [isFeatured, setIsFeatured] = useState(row.original.isFeatured);
    const dispatch = useDispatch<AppDispatch>();

    const toggleFeatured = async () => {
        try {
            await dispatch(
                updateComment({
                    id: row.original._id!,
                    data: { isFeatured: !isFeatured },
                })
            ).unwrap();
            setIsFeatured(!isFeatured);
            onUpdate();
        } catch (error) {
            console.error('Failed to update featured status:', error);
        }
    };

    return (
        <button
            className={`__featured-toggle ${isFeatured ? '__featured' : '__not-featured'}`}
            onClick={toggleFeatured}
        >
            {isFeatured ? 'Featured' : 'Not Featured'}
        </button>
    );
};

const VotesCell: React.FC<{ votes: Vote[] }> = ({ votes }) => {
    const upvotes = votes?.filter((v) => v.direction === 'up').length || 0;
    const downvotes = votes?.filter((v) => v.direction === 'down').length || 0;

    return (
        <div className="__votes-container">
            <span className="__upvotes">
                <ThumbsUp size={14} /> {upvotes}
            </span>
            <span className="__downvotes">
                <ThumbsDown size={14} /> {downvotes}
            </span>
        </div>
    );
};

/* Sorting Functions */
const SortByFlagged = (rowA: Row<Comment>, rowB: Row<Comment>): number => {
    const analysisA = useSelector(selectCommentAnalysis(rowA.original._id!));
    const analysisB = useSelector(selectCommentAnalysis(rowB.original._id!));

    const isFlaggedA = analysisA?.reasons?.length > 0;
    const isFlaggedB = analysisB?.reasons?.length > 0;

    return isFlaggedA === isFlaggedB ? 0 : isFlaggedA ? 1 : -1;
};

const SortByVotes = (rowA: Row<Comment>, rowB: Row<Comment>): number => {
    const votesA = rowA.original._comment_votes || [];
    const votesB = rowB.original._comment_votes || [];

    const scoreA =
        votesA.filter((v) => v.direction === 'up').length -
        votesA.filter((v) => v.direction === 'down').length;
    const scoreB =
        votesB.filter((v) => v.direction === 'up').length -
        votesB.filter((v) => v.direction === 'down').length;

    return scoreB - scoreA; // Descending order
};

export default function CommentManagementModal({
    isOpen,
    onClose,
    comments,
    refreshComments,
}: CommentManagementModalProps) {
    // Refs and state management
    const modalRef = useRef<HTMLDivElement>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    // Analysis declarations
    const dispatch = useDispatch<AppDispatch>();
    /* const commentAnalyses = useSelector(selectCommentAnalysis);
    const flaggedComments = useSelector(selectFlaggedComments); */

    // Form handling
    const { control, watch } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            globalFilter: '',
            timeFrameOption: 'all' as TimeFrameOption,
        },
    });

    // Derived values and effects
    const timeFrameOption = watch('timeFrameOption');

    // Function for Filter
    const filterByTimeFrame = (comments: Comment[], timeFrame: TimeFrameOption) => {
        if (timeFrame === 'all') return comments;

        const now = new Date();
        const timeFrames = {
            '24h': sub(now, { hours: 24 }),
            '7d': sub(now, { days: 7 }),
            '30d': sub(now, { days: 30 }),
            '6m': sub(now, { months: 6 }),
        };

        const cutoffDate = timeFrames[timeFrame];

        // First, identify all comments within the time frame
        const withinTimeFrame = new Set(
            comments
                .filter((comment) => {
                    if (!comment.createdAt) return false;
                    const commentDate = new Date(comment.createdAt);
                    return commentDate >= cutoffDate;
                })
                .map((comment) => comment._id)
        );

        // Then, include all parent comments of the filtered comments
        const includeWithParents = new Set(withinTimeFrame);

        // Check children and include their parents
        comments.forEach((comment) => {
            if (withinTimeFrame.has(comment._id!)) {
                let currentParent = comment.Parent;
                while (currentParent) {
                    const parentId =
                        typeof currentParent === 'string' ? currentParent : currentParent._id;
                    includeWithParents.add(parentId!);
                    const parentComment = comments.find((c) => c._id === parentId);
                    currentParent = parentComment?.Parent || null;
                }
            }
        });

        // Return filtered comments with proper hierarchy
        const filteredComments = comments.filter((comment) => {
            // Include if the comment is within timeframe or is a parent of such comment
            return withinTimeFrame.has(comment._id!) || includeWithParents.has(comment._id!);
        });

        return filteredComments;
    };

    // Sorting Helper Fn
    const getSortingValue = (row: CommentWithDepth, columnId: string): SortableValue => {
        switch (columnId) {
            case '_comment_author':
                return row._comment_author;
            case '_comment_body':
                return row._comment_body;
            case '_comment_email':
                return row._comment_email;
            case 'isFeatured':
                return row.isFeatured;
            case '_comment_votes':
                return row._comment_votes?.length || 0;
            case '_comment_isOK':
                return row._comment_isOK;
            default:
                return row[columnId as keyof CommentWithDepth] as SortableValue;
        }
    };

    const compareValues = (a: SortableValue, b: SortableValue): number => {
        if (typeof a === 'string' && typeof b === 'string') {
            return a.localeCompare(b);
        }
        if (typeof a === 'boolean' && typeof b === 'boolean') {
            return a === b ? 0 : a ? -1 : 1;
        }
        if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
        }
        // Handle null/undefined cases
        if (a === null || a === undefined) return 1;
        if (b === null || b === undefined) return -1;
        return 0;
    };

    // processing
    const processCommentsHierarchy = (
        comments: Comment[],
        sorting: SortingState
    ): CommentWithDepth[] => {
        const commentMap = new Map<string, Comment>();
        const childrenMap = new Map<string, Comment[]>();
        const result: CommentWithDepth[] = [];
        const visited = new Set<string>();

        // Populate comment map and build parent-child relationships
        comments.forEach((comment) => {
            if (comment._id) {
                commentMap.set(comment._id, comment);
                const parentId = comment.Parent
                    ? typeof comment.Parent === 'string'
                        ? comment.Parent
                        : comment.Parent._id
                    : null;

                if (parentId) {
                    if (!childrenMap.has(parentId)) {
                        childrenMap.set(parentId, []);
                    }
                    childrenMap.get(parentId)!.push(comment);
                }
            }
        });

        // Sort function for comments at each level
        const sortComments = (items: Comment[]): Comment[] => {
            if (sorting.length === 0) return items;

            const { id: columnId, desc } = sorting[0];
            return [...items].sort((a, b) => {
                const aValue = getSortingValue(a as CommentWithDepth, columnId);
                const bValue = getSortingValue(b as CommentWithDepth, columnId);
                const comparison = compareValues(aValue, bValue);
                return desc ? -comparison : comparison;
            });
        };

        // Modified recursive traversal function
        const traverse = (comment: Comment, depth: number) => {
            if (visited.has(comment._id!)) return;
            visited.add(comment._id!);
            result.push({ ...comment, depth });

            // Get all children and sort them at this level before traversing
            const children = childrenMap.get(comment._id!) || [];
            const sortedChildren = sortComments(children);

            // Process each child maintaining hierarchy
            sortedChildren.forEach((child) => traverse(child, depth + 1));
        };

        // Get and sort only root comments
        const rootComments = comments.filter((comment) => {
            const parentId = comment.Parent
                ? typeof comment.Parent === 'string'
                    ? comment.Parent
                    : comment.Parent._id
                : null;
            return !parentId || !commentMap.has(parentId);
        });

        // Sort root comments and process their hierarchies
        const sortedRootComments = sortComments(rootComments);
        sortedRootComments.forEach((comment) => {
            if (!visited.has(comment._id!)) {
                traverse(comment, 0);
            }
        });

        return result;
    };

    const tableData = useMemo(() => {
        const filteredComments = filterByTimeFrame(comments, timeFrameOption);
        return processCommentsHierarchy(filteredComments, sorting);
    }, [comments, timeFrameOption, sorting]);

    // Table configuration
    const columns: ColumnDef<Comment>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={table.getToggleAllPageRowsSelectedHandler()}
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            ),
            enableSorting: false,
        },
        {
            id: 'author',
            accessorKey: '_comment_author',
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    Author {column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />}
                </button>
            ),
            sortingFn: 'alphanumeric',
            cell: (info) => <span className="__author">{_.capitalize(info.getValue() as string)}</span>,
        },
        {
            id: 'email',
            accessorKey: '_comment_email',
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    Email {column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />}
                </button>
            ),
            sortingFn: 'alphanumeric',
            cell: (info) => <span className="__email">{_.capitalize(info.getValue() as string)}</span>,
        },
        {
            id: 'body',
            accessorKey: '_comment_body',
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    Comment {column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />}
                </button>
            ),
            sortingFn: 'alphanumeric',
            cell: ({ row }) => <CommentBodyCell row={row} />,
        },
        {
            id: 'article',
            accessorFn: (row) => {
                const article = row.article;
                // If article is a string (reference), return undefined to show 'No article'
                if (typeof article === 'string') return undefined;
                // If article is an object with title, return the title
                if (article && typeof article === 'object' && 'title' in article) {
                    return article.title;
                }
                return undefined;
            },
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    Article {column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />}
                </button>
            ),
            sortingFn: 'alphanumeric',
            cell: (info) => {
                const value = info.getValue() as string;
                return (
                    <span className="__article" title={value}>
                        {value || 'No article'}
                    </span>
                );
            },
        },
        {
            id: 'flagged',
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    Flagged {column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />}
                </button>
            ),
            sortingFn: SortByFlagged,
            cell: ({ row }) => <FlaggedCell id={row.original._id!} />,
        },
        {
            id: 'featured',
            accessorKey: 'isFeatured',
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    Featured {column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />}
                </button>
            ),
            sortingFn: 'basic',
            cell: ({ row }) => <FeaturedCell row={row} onUpdate={refreshComments} />,
        },
        {
            id: 'votes',
            accessorKey: '_comment_votes',
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    Votes {column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />}
                </button>
            ),
            sortingFn: SortByVotes,
            cell: ({ row }) => <VotesCell votes={row.original._comment_votes || []} />,
        },
        {
            id: 'status',
            accessorKey: '_comment_isOK',
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    Status {column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />}
                </button>
            ),
            sortingFn: 'basic',
            cell: ({ row }) => <StatusCell row={row} onUpdate={refreshComments} />,
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="__action-buttons">
                    <button
                        className="__delete-button"
                        onClick={async () => {
                            if (confirm('Are you sure you want to delete this comment?')) {
                                try {
                                    await handleDeleteComment(row.original._id!);
                                    await refreshComments();
                                } catch (error) {
                                    console.error('Failed to delete comment:', error);
                                }
                            }
                        }}
                    >
                        <FileX2 />
                    </button>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: tableData,
        columns,
        state: {
            globalFilter,
            sorting,
            rowSelection,
        },
        filterFns: {
            fuzzy: () => true,
            commentFuzzy: commentFuzzyFilter as FilterFn<unknown>,
        },
        /* getSortedRowModel: getSortedRowModel(), */
        onSortingChange: setSorting,
        manualSorting: true,
        globalFilterFn: (row, columnId, filterValue) => {
            const commentData = row.original as CommentWithDepth;
            const value = row.getValue(columnId);
            if (!value) return false;

            const strValue = String(value).toLowerCase();
            const searchValue = String(filterValue).toLowerCase();
            const matches = strValue.includes(searchValue);

            // If this row matches the search, show it and its parent chain
            if (matches) {
                return true;
            }

            // Check if any child comment matches the search
            const hasMatchingChild = tableData.some((comment) => {
                const parent =
                    typeof comment.Parent === 'string' ? comment.Parent : comment.Parent?._id;
                return (
                    parent === commentData._id &&
                    (comment._comment_body.toLowerCase().includes(searchValue) ||
                        comment._comment_author.toLowerCase().includes(searchValue) ||
                        comment._comment_email.toLowerCase().includes(searchValue))
                );
            });

            if (hasMatchingChild) {
                return true;
            }

            // If this is a reply, check if its parent matches
            if (commentData.Parent) {
                const parentId =
                    typeof commentData.Parent === 'string'
                        ? commentData.Parent
                        : commentData.Parent._id;
                const parentComment = tableData.find((c) => c._id === parentId);
                if (parentComment) {
                    const parentMatches =
                        parentComment._comment_body.toLowerCase().includes(searchValue) ||
                        parentComment._comment_author.toLowerCase().includes(searchValue) ||
                        parentComment._comment_email.toLowerCase().includes(searchValue);
                    return parentMatches;
                }
            }

            return false;
        },
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 10, pageIndex: 0 },
        },
        enableRowSelection: true,
        enableSorting: true,
    });

    // Effect hooks
    useEffect(() => {
        if (isOpen) {
            dispatch(analyzeComments());
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        table.setPageIndex(0);
    }, [timeFrameOption, table]);

    // Event handlers
    const handleSearch = (value: string) => {
        setGlobalFilter(value);
    };

    // Add these functions inside the component
    const handleBatchDelete = async () => {
        const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original._id);
        if (selectedIds.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedIds.length} comments?`)) {
            try {
                await Promise.all(selectedIds.map((id) => handleDeleteComment(id!)));
                await refreshComments();
                setRowSelection({});
            } catch (error) {
                console.error('Batch delete failed:', error);
            }
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            // Check if comment has replies
            const hasReplies = comments.some((c) => c.Parent?.toString() === commentId);

            if (hasReplies) {
                const confirmAction = confirm(
                    'This comment has replies. Delete anyway and remove parent reference?'
                );

                if (confirmAction) {
                    const childComments = comments.filter(
                        (c) => c.Parent?.toString() === commentId
                    );

                    await Promise.all(
                        childComments.map((c) =>
                            dispatch(
                                updateComment({
                                    id: c._id!,
                                    data: { Parent: null },
                                })
                            ).unwrap()
                        )
                    );
                } else {
                    return;
                }
            }

            await dispatch(
                deleteComment({
                    id: commentId,
                    isAdmin: true, // This indicates we're deleting as admin
                })
            ).unwrap();

            await refreshComments();
        } catch (error) {
            console.error('Delete comment failed:', error);
            throw error;
        }
    };

    return (
        <>
            <Overlay isVisible={isOpen} onClick={onClose} zIndex={99} />
            <AnimatedWrapper
                className="_modal__comments"
                from={{ opacity: 0, transform: 'translateY(-50px) translateX(-50%)' }}
                to={{ opacity: 1, transform: 'translateY(0) translateX(-50%)' }}
                config={smoothConfig}
                ref={modalRef}
            >
                {/* Header */}
                <div className="_header">
                    <div className="_formContainer">
                        <form className="__header _form">
                            <div className="_row">
                                <FormField
                                    name="globalFilter"
                                    type="text"
                                    label="Search"
                                    icon={<Search />}
                                    control={control}
                                    onInputChange={handleSearch}
                                />
                                <FormField
                                    control={control}
                                    icon={<Timer />}
                                    name="timeFrameOption"
                                    type="select"
                                    options={[
                                        { value: '24h', label: 'Last 24 hours' },
                                        { value: '7d', label: 'Last 7 days' },
                                        { value: '30d', label: 'Last 30 days' },
                                        { value: '6m', label: 'Last 6 months' },
                                        { value: 'all', label: 'All time' },
                                    ]}
                                    rules={{ required: true }}
                                />
                                <button
                                    className={`button __batch-delete ${
                                        table.getSelectedRowModel().rows.length === 0
                                            ? '__disabled'
                                            : ''
                                    }`}
                                    onClick={handleBatchDelete}
                                    disabled={table.getSelectedRowModel().rows.length === 0}
                                >
                                    <Trash2 />
                                    <span>
                                        {table.getSelectedRowModel().rows.length !== 0 &&
                                            `${table.getSelectedRowModel().rows.length} articles`}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Close button */}
                    <AnimatedWrapper
                        as="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="__commentClose"
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
                    <div className="__table">
                        <table>
                            <thead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th key={header.id}>
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                        </table>
                        <SimpleBar
                            className="_SimpleBar"
                            forceVisible="y"
                            autoHide={false}
                            style={{ maxHeight: '55.5vh' }}
                        >
                            <table>
                                <tbody>
                                    {table.getRowModel().rows.map((row) => {
                                        const depth = (row.original as CommentWithDepth).depth || 0;
                                        const isReply = depth > 0;

                                        return (
                                            <tr
                                                key={row.id}
                                                className={isReply ? '__reply-row' : '__parent-row'}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <td
                                                        key={cell.id}
                                                        className={isReply ? '__reply-cell' : ''}
                                                    >
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </SimpleBar>
                    </div>
                </div>

                {/* Footer */}
                <div className="_footer">
                    {/* Pagination */}
                    <div className="__pagination">
                        <span className="__pagination-info">
                            {(() => {
                                const pageIndex = table.getState().pagination.pageIndex;
                                const pageSize = table.getState().pagination.pageSize;
                                // Change this line to use getFilteredRowModel instead of getCoreRowModel
                                const totalItems = table.getFilteredRowModel().rows.length;
                                const startIndex = pageIndex * pageSize + 1;
                                const endIndex = Math.min((pageIndex + 1) * pageSize, totalItems);

                                return totalItems === 0 ? (
                                    'No comments to display'
                                ) : (
                                    <>
                                        {`Showing `}
                                        <strong>{startIndex}</strong>
                                        {` to `}
                                        <strong>{endIndex}</strong>
                                        {` of `}
                                        <strong>{totalItems}</strong>
                                        {` comments`}
                                    </>
                                );
                            })()}
                        </span>
                        <ul className="__pagination-controls">
                            {_.map(_.range(1, table.getPageCount() + 1), (number) => (
                                <li
                                    key={number}
                                    onClick={() => table.setPageIndex(number - 1)}
                                    className={
                                        table.getState().pagination.pageIndex + 1 === number
                                            ? 'current'
                                            : ''
                                    }
                                />
                            ))}
                        </ul>
                    </div>
                </div>
            </AnimatedWrapper>
        </>
    );
}

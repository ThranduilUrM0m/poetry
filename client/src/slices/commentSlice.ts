import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Comment } from '@/types/article';
import axios from 'axios';

interface CommentState {
    comments: Comment[];
    currentComment: Comment | null;
    successMessage?: string | null;
    cachedComments: Record<string, Comment>;
    isLoading: boolean;
    error: string | null;
    commentAnalyses: Record<string, CommentAnalysis>;
    flaggedComments: string[];
}

interface CommentAnalysis {
    toxic: boolean;
    spam: boolean;
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
    reasons: string[];
    severity: 'low' | 'medium' | 'high';
}

const initialState: CommentState = {
    comments: [],
    currentComment: null,
    successMessage: null,
    cachedComments: {},
    isLoading: false,
    error: null,
    commentAnalyses: {},
    flaggedComments: [],
};

// Utility function to extract error message
const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || 'An error occurred while fetching data';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
};

export const analyzeComment = createAsyncThunk(
    'comments/analyze',
    async (commentId: string, { getState, dispatch, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const comment = state.comment.comments.find((c) => c._id === commentId);

            if (!comment) {
                throw new Error('Comment not found');
            }

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/analyze-comment`,
                {
                    text: comment._comment_body,
                }
            );

            const analysis = response.data;
            const isFlagged = analysis.toxic || analysis.spam || analysis.sentiment === 'negative';

            // If severity is high, delete the comment
            if (analysis.severity === 'high') {
                await dispatch(
                    deleteComment({ id: commentId, fingerprint: comment._comment_fingerprint })
                );
                return {
                    commentId,
                    analysis,
                    deleted: true,
                };
            }

            // Determine approval status based on analysis
            const updateData: Partial<Comment> = !isFlagged
                ? { _comment_isOK: true, isFeatured: true }
                : analysis.severity === 'low'
                ? { _comment_isOK: true, isFeatured: false }
                : { _comment_isOK: false, isFeatured: false };

            // Extract typed keys from updateData
            const keys = Object.keys(updateData) as Array<keyof typeof updateData>;

            // Check if any value actually differs
            const needsUpdate = keys.some((key) => comment[key] !== updateData[key]);

            if (needsUpdate) {
                await dispatch(updateComment({ id: commentId, data: updateData })).unwrap();
            }

            return {
                commentId,
                analysis,
                deleted: false,
            };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Add batch analysis thunk
export const analyzeComments = createAsyncThunk(
    'comments/analyzeBatch',
    async (_, { getState, dispatch }) => {
        // Remove unused commentIds parameter
        const state = getState() as RootState;
        const { comments, commentAnalyses } = state.comment;

        // Find comments that need analysis
        const commentsToAnalyze = comments.filter(
            (comment) => comment._id && !commentAnalyses[comment._id]
        );

        // Batch analyze only the needed comments
        const analyses = await Promise.all(
            commentsToAnalyze.map((comment) => dispatch(analyzeComment(comment._id!)).unwrap())
        );

        return analyses;
    }
);

export const createComment = createAsyncThunk(
    'comments/create',
    async (commentData: Partial<Comment>, { dispatch, rejectWithValue }) => {
        try {
            // Set default values for new comments
            const backendPayload = {
                ...commentData,
                article: commentData.article?._id,
                _comment_isOK: true, // Default to true
                isFeatured: true, // Default to true
            };

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/comments`,
                backendPayload
            );
            const newComment = response.data;

            // --- Analyze directly using the new comment body ---
            const analysisResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/analyze-comment`,
                { text: newComment._comment_body }
            );
            const analysis = analysisResponse.data;

            // Optionally, update the comment if needed based on analysis
            // (e.g., set _comment_isOK or isFeatured)
            // You can dispatch updateComment here if you want

            // Optionally, store analysis in Redux
            dispatch({
                type: 'comments/analyze/fulfilled',
                payload: { commentId: newComment._id, analysis },
            });

            return newComment;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateComment = createAsyncThunk(
    'comments/update',
    async ({ id, data }: { id: string; data: Partial<Comment> }, { rejectWithValue }) => {
        try {
            // Add ID validation
            if (!id || typeof id !== 'string') {
                throw new Error('Invalid comment ID');
            }

            const response = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${id}`,
                data
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const voteComment = createAsyncThunk(
    'comments/vote',
    async (
        {
            commentId,
            direction,
            fingerprint,
        }: { commentId: string; direction: 'up' | 'down'; fingerprint: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}/vote`,
                {
                    direction,
                    fingerprint,
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const fetchComments = createAsyncThunk(
    'comment/fetchComments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get<Comment[]>(
                `${process.env.NEXT_PUBLIC_API_URL}/api/comments`
            );
            if (!response.data) {
                throw new Error('No data received from server');
            }
            return response.data;
        } catch (error: unknown) {
            console.error('Error fetching comments:', error);
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
            }
            return rejectWithValue('An error occurred while fetching comments');
        }
    }
);

export const fetchCommentsByArticle = createAsyncThunk(
    'comment/fetchCommentsByArticle',
    async (articleId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get<Comment[]>(
                `${process.env.NEXT_PUBLIC_API_URL}/api/comments/article/${articleId}`
            );
            // If response is successful but empty, return empty array
            return response.data || [];
        } catch (error: unknown) {
            let message = 'An unknown error occurred';
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            return rejectWithValue(message);
        }
    }
);

export const fetchUpdatedComment = createAsyncThunk(
    'comment/fetchUpdatedArticle',
    async (commentId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get<Comment>(
                `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const deleteComment = createAsyncThunk(
    'comments/delete',
    async (
        {
            id,
            fingerprint,
            isAdmin = false,
        }: {
            id: string;
            fingerprint?: string;
            isAdmin?: boolean;
        },
        { rejectWithValue }
    ) => {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            // Add admin authorization header if deleting as admin
            if (isAdmin) {
                const adminToken = localStorage.getItem('token'); // Or however you store admin auth
                if (!adminToken) {
                    throw new Error('Admin authorization required');
                }
                headers['Authorization'] = `Bearer ${adminToken}`;
            } else if (fingerprint) {
                // For regular users, include fingerprint
                headers['X-Comment-Fingerprint'] = fingerprint;
            } else {
                throw new Error('Either admin rights or fingerprint required');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${id}`, {
                method: 'DELETE',
                headers,
            });

            if (!response.ok) {
                throw new Error('Failed to delete comment');
            }

            return id;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const commentSlice = createSlice({
    name: 'comment',
    initialState,
    reducers: {
        setComments(state, action: PayloadAction<Comment[]>) {
            state.comments = action.payload;
        },
        setCurrentComment(state, action: PayloadAction<Comment>) {
            if (action.payload._id) {
                state.currentComment = action.payload;
                if (!state.cachedComments[action.payload._id]) {
                    state.cachedComments[action.payload._id] = action.payload;
                }
            }
        },
        clearCurrentComment(state) {
            state.currentComment = null;
        },
        setCachedComment(state, action: PayloadAction<Comment>) {
            if (action.payload._id) {
                state.cachedComments[action.payload._id] = action.payload;
            }
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        clearCommentState: (state) => {
            state.isLoading = false;
            state.error = null;
            state.currentComment = null;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(analyzeComment.fulfilled, (state, action) => {
                const { commentId, analysis } = action.payload;
                state.commentAnalyses[commentId] = analysis;

                if (analysis.toxic || analysis.spam || analysis.sentiment === 'negative') {
                    if (!state.flaggedComments.includes(commentId)) {
                        state.flaggedComments.push(commentId);
                    }
                }
            })
            .addCase(analyzeComments.fulfilled, (state, action) => {
                action.payload.forEach(({ commentId, analysis }) => {
                    state.commentAnalyses[commentId] = analysis;
                    if (
                        (analysis.toxic || analysis.spam || analysis.sentiment === 'negative') &&
                        !state.flaggedComments.includes(commentId)
                    ) {
                        state.flaggedComments.push(commentId);
                    }
                });
            })
            .addCase(fetchComments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.comments = action.payload || [];
                state.error = null;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) || 'Failed to fetch comments';
                state.comments = []; // Reset comments on error
            })
            .addCase(fetchCommentsByArticle.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCommentsByArticle.fulfilled, (state, action) => {
                state.comments = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchCommentsByArticle.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch comments';
            })
            .addCase(fetchUpdatedComment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUpdatedComment.fulfilled, (state, action) => {
                if (state.currentComment?._id === action.payload._id) {
                    state.currentComment = action.payload;
                }
                state.isLoading = false;
            })
            .addCase(fetchUpdatedComment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(voteComment.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(voteComment.fulfilled, (state, action) => {
                const updatedComment = action.payload;
                state.comments = state.comments.map((comment) =>
                    comment._id === updatedComment._id ? updatedComment : comment
                );
            })
            .addCase(voteComment.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to vote on comment';
            })
            .addCase(deleteComment.fulfilled, (state, action: PayloadAction<string>) => {
                // Remove the deleted comment from the state using the ID directly
                state.comments = state.comments.filter((comment) => comment._id !== action.payload);
                state.isLoading = false;
                state.error = null;
            })
            .addCase(deleteComment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete comment';
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.successMessage = 'Comment posted successfully';
                if (action.payload._id) {
                    state.comments.push(action.payload);
                }
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.successMessage = 'Comment updated successfully';
                state.currentComment = null;
                const index = state.comments.findIndex((c) => c._id === action.payload._id);
                if (index !== -1) {
                    state.comments[index] = action.payload;
                }
            });
    },
});

// Export actions and reducer
export const {
    setComments,
    setCurrentComment,
    clearCurrentComment,
    setCachedComment,
    setLoading,
    setError,
    clearCommentState,
} = commentSlice.actions;

export default commentSlice.reducer;

// Selectors
const selectAllComments = (state: RootState) => state.comment.comments;

export const selectApprovedComments = createSelector([selectAllComments], (comments) =>
    comments.filter((c) => c._comment_isOK)
);
export const selectFeaturedComments = createSelector([selectAllComments], (comments) =>
    comments.filter((c) => c.isFeatured && c._comment_isOK)
);
export const selectCommentAnalysis = (commentId: string) => (state: RootState) =>
    state.comment.commentAnalyses[commentId];
export const selectFlaggedComments = (state: RootState) => state.comment.flaggedComments;
export const selectComments = (state: RootState) => state.comment.comments;
export const selectCurrentComment = (state: RootState) => state.comment.currentComment;
export const selectCachedComment = (_id: string) => (state: RootState) =>
    state.comment.cachedComments[_id];
export const selectIsLoading = (state: RootState) => state.comment.isLoading;
export const selectError = (state: RootState) => state.comment.error;

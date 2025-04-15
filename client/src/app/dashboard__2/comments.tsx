'use client';
import { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchComments, updateComment, deleteComment, selectComments, selectIsLoading } from '@/slices/commentSlice';
import { useLoading } from '@/context/LoadingContext';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { formatDistanceToNow } from 'date-fns';

export default function CommentsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const comments = useSelector(selectComments);
    const isLoading = useSelector(selectIsLoading);
    const { isLoaded } = useLoading();

    useEffect(() => {
        dispatch(fetchComments());
    }, [dispatch]);

    const handleApprove = async (id: string) => {
        await dispatch(updateComment({ 
            id, 
            data: { _comment_isOK: true }
        }));
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            await dispatch(deleteComment({ 
                id, 
                fingerprint: 'dashboard-admin' // Add a fixed fingerprint for admin operations
            }));
        }
    };

    return (
        <AnimatedWrapper
            as="div"
            from={{ transform: 'translateY(-10%)', opacity: 0 }}
            to={isLoaded && !isLoading ? { transform: 'translateY(0)', opacity: 1 } : undefined}
            config={{ mass: 1, tension: 170, friction: 26 }}
        >
            <h1 className="text-2xl font-bold mb-6">Comments Management</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="px-6 py-3 text-left">Author</th>
                            <th className="px-6 py-3 text-left">Comment</th>
                            <th className="px-6 py-3 text-left">Article</th>
                            <th className="px-6 py-3 text-left">Date</th>
                            <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.map((comment) => (
                            <tr key={comment._id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{comment._comment_author}</td>
                                <td className="px-6 py-4">{comment._comment_body}</td>
                                <td className="px-6 py-4">{comment.article?.title}</td>
                                <td className="px-6 py-4">
                                    {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </td>
                                <td className="px-6 py-4 space-x-2">
                                    <button 
                                        className="p-1 text-green-600 hover:text-green-800"
                                        onClick={() => comment._id && handleApprove(comment._id)}
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button 
                                        className="p-1 text-red-600 hover:text-red-800"
                                        onClick={() => comment._id && handleDelete(comment._id)}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AnimatedWrapper>
    );
}

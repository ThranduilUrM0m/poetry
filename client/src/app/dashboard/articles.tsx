'use client';
import { useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchArticles, deleteArticle, selectArticles, selectIsLoading } from '@/slices/articleSlice';
import { useLoading } from '@/context/LoadingContext';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';

export default function ArticlesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const articles = useSelector(selectArticles);
    const isLoading = useSelector(selectIsLoading);
    const { isLoaded } = useLoading();
    
    useEffect(() => {
        dispatch(fetchArticles());
    }, [dispatch]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            await dispatch(deleteArticle(id));
        }
    };

    return (
        <AnimatedWrapper
            as="div"
            from={{ transform: 'translateY(-10%)', opacity: 0 }}
            to={isLoaded && !isLoading ? { transform: 'translateY(0)', opacity: 1 } : undefined}
            config={{ mass: 1, tension: 170, friction: 26 }}
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Articles Management</h1>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Article
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="px-6 py-3 text-left">Title</th>
                            <th className="px-6 py-3 text-left">Category</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-left">Views</th>
                            <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((article) => (
                            <tr key={article._id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{article.title}</td>
                                <td className="px-6 py-4">{article.category}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-sm ${
                                        article.status === 'approved' 
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {article.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{article.views?.length || 0}</td>
                                <td className="px-6 py-4 space-x-2">
                                    <button className="p-1 text-blue-600 hover:text-blue-800">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        className="p-1 text-red-600 hover:text-red-800"
                                        onClick={() => article._id && handleDelete(article._id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
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

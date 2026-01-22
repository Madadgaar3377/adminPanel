import React, { useState, useEffect, useCallback } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';

const BlogView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBlog = useCallback(async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getBlog/${id}`, {
                headers: {
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                }
            });
            const data = await res.json();
            if (data.success) {
                setBlog(data.data);
            }
        } catch (err) {
            console.error('Error fetching blog:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchBlog();
    }, [fetchBlog]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-white space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-red-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                </div>
                <p className="text-sm font-medium text-gray-600">Loading blog details...</p>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center max-w-md">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Blog Not Found</h2>
                    <p className="text-gray-600 mb-6 font-medium">The blog you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/blog/all')}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 font-bold shadow-lg shadow-red-200 active:scale-95"
                    >
                        Back to Blog List
                    </button>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status, isPublished) => {
        if (status === 'published' && isPublished) {
            return <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg border border-green-400">Published</span>;
        } else if (status === 'draft') {
            return <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl text-xs font-bold shadow-lg border border-yellow-400">Draft</span>;
        } else if (status === 'archived') {
            return <span className="px-3 py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl text-xs font-bold shadow-lg border border-gray-400">Archived</span>;
        }
        return <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">{status}</span>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                {/* Modern Header - v2.0.5 */}
                <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl shadow-2xl p-8">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    
                    <div className="relative">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    {getStatusBadge(blog.status, blog.isPublished)}
                                    {blog.isFeatured && (
                                        <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-xl text-xs font-bold border-2 border-white/20 shadow-lg">
                                            ⭐ Featured
                                        </span>
                                    )}
                                    {blog.isPinned && (
                                        <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-xl text-xs font-bold border-2 border-white/20 shadow-lg">
                                            📌 Pinned
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tight mb-2">{blog.title}</h1>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <p className="text-red-100 text-sm font-medium">ID: {blog.blogId || blog._id}</p>
                                    <p className="text-red-100 text-sm font-medium">•</p>
                                    <p className="text-red-100 text-sm font-medium">Slug: {blog.slug}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate(`/blog/edit/${blog._id}`)}
                                    className="px-6 py-3 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300 flex items-center gap-2 font-bold shadow-lg active:scale-95"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                </button>
                                <button
                                    onClick={() => navigate('/blog/all')}
                                    className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-bold active:scale-95"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Featured Image */}
                {blog.featuredImage && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <img 
                            src={blog.featuredImage} 
                            alt={blog.title}
                            className="w-full h-96 object-cover"
                        />
                    </div>
                )}

                {/* Basic Information */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm text-gray-500 mb-1">Category</label>
                            <p className="text-base font-semibold text-gray-900">{blog.category || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm text-gray-500 mb-1">Author</label>
                            <p className="text-base font-semibold text-gray-900">{blog.authorName || 'Admin'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm text-gray-500 mb-1">Reading Time</label>
                            <p className="text-base font-semibold text-gray-900">{blog.readingTime || 0} minutes</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm text-gray-500 mb-1">Views</label>
                            <p className="text-base font-semibold text-gray-900">{blog.viewCount || 0}</p>
                        </div>
                        {blog.excerpt && (
                            <div className="p-4 bg-blue-50 rounded-lg md:col-span-2 border border-blue-100">
                                <label className="block text-sm text-blue-700 mb-1">Excerpt</label>
                                <p className="text-base font-semibold text-blue-900">{blog.excerpt}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                {blog.content && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Content
                        </h2>
                        <div 
                            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </div>
                )}

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Tags
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {blog.tags.map((tag, index) => (
                                <span key={index} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Images */}
                {blog.images && blog.images.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Additional Images
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {blog.images.map((img, index) => (
                                <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <img 
                                        src={img} 
                                        alt={`Blog image ${index + 1}`} 
                                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                        onClick={() => window.open(img, '_blank')}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SEO Information */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        SEO Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {blog.metaTitle && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm text-gray-500 mb-1">Meta Title</label>
                                <p className="text-base font-semibold text-gray-900">{blog.metaTitle}</p>
                            </div>
                        )}
                        {blog.metaDescription && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm text-gray-500 mb-1">Meta Description</label>
                                <p className="text-base font-semibold text-gray-900">{blog.metaDescription}</p>
                            </div>
                        )}
                        {blog.seoKeywords && blog.seoKeywords.length > 0 && (
                            <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                                <label className="block text-sm text-gray-500 mb-2">SEO Keywords</label>
                                <div className="flex flex-wrap gap-2">
                                    {blog.seoKeywords.map((keyword, index) => (
                                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Admin Notes */}
                {blog.adminNotes && (
                    <div className="bg-yellow-50 rounded-2xl shadow-sm p-6 border border-yellow-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Admin Notes
                        </h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{blog.adminNotes}</p>
                    </div>
                )}

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {blog.createdAt && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Created: {new Date(blog.createdAt).toLocaleString()}</span>
                            </div>
                        )}
                        {blog.updatedAt && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Updated: {new Date(blog.updatedAt).toLocaleString()}</span>
                            </div>
                        )}
                        {blog.publishedAt && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Published: {new Date(blog.publishedAt).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogView;

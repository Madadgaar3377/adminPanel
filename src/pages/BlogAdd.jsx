import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from '../compontents/RichTextEditor';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = type === 'success' 
        ? 'bg-gradient-to-r from-emerald-500 to-green-600 border-emerald-400' 
        : 'bg-gradient-to-r from-red-500 to-rose-600 border-red-400';

    return (
        <div className={`fixed top-20 right-6 ${styles} text-white px-6 py-4 rounded-2xl shadow-2xl z-[9999] flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 border-2 min-w-[320px] max-w-md`}>
            <div className="flex-shrink-0">
                {type === 'success' ? (
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                ) : (
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                )}
            </div>
            <div className="flex-1">
                <p className="font-bold text-sm leading-relaxed">{message}</p>
            </div>
            <button 
                onClick={onClose} 
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-all active:scale-95"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

const BlogAdd = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);
    const [localImages, setLocalImages] = useState([]);

    const [form, setForm] = useState({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        category: '',
        tags: [],
        featuredImage: '',
        images: [],
        metaTitle: '',
        metaDescription: '',
        status: 'draft',
        isFeatured: false,
        isPinned: false,
        seoKeywords: [],
        adminNotes: '',
    });

    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchBlog();
        }
    }, [id]);

    const fetchBlog = async () => {
        setFetching(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getBlog/${id}`, {
                headers: {
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                }
            });
            const data = await res.json();
            if (data.success && data.data) {
                const blog = data.data;
                setForm({
                    title: blog.title || '',
                    slug: blog.slug || '',
                    content: blog.content || '',
                    excerpt: blog.excerpt || '',
                    category: blog.category || '',
                    tags: blog.tags || [],
                    featuredImage: blog.featuredImage || '',
                    images: blog.images || [],
                    metaTitle: blog.metaTitle || '',
                    metaDescription: blog.metaDescription || '',
                    status: blog.status || 'draft',
                    isFeatured: blog.isFeatured || false,
                    isPinned: blog.isPinned || false,
                    seoKeywords: blog.seoKeywords || [],
                    adminNotes: blog.adminNotes || '',
                });
            } else {
                showToast(data.message || 'Failed to fetch blog', 'error');
            }
        } catch (err) {
            showToast('Error fetching blog', 'error');
        } finally {
            setFetching(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
    };

    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // Auto-generate slug from title
    useEffect(() => {
        if (!isEditMode && form.title && !form.slug) {
            const slug = form.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setForm(prev => ({ ...prev, slug }));
        }
    }, [form.title, isEditMode]);

    // Auto-generate excerpt from content
    useEffect(() => {
        if (form.content && !form.excerpt) {
            const excerpt = form.content.replace(/<[^>]*>/g, '').substring(0, 500).trim();
            setForm(prev => ({ ...prev, excerpt }));
        }
    }, [form.content]);

    const handleAddTag = () => {
        if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
            setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const handleAddKeyword = () => {
        const keyword = prompt('Enter SEO keyword:');
        if (keyword && !form.seoKeywords.includes(keyword)) {
            setForm(prev => ({ ...prev, seoKeywords: [...prev.seoKeywords, keyword] }));
        }
    };

    const handleRemoveKeyword = (keyword) => {
        setForm(prev => ({ ...prev, seoKeywords: prev.seoKeywords.filter(k => k !== keyword) }));
    };

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files || []);
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                showToast('⚠️ Please select only valid image files', 'error');
                e.target.value = null;
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast(`⚠️ Image "${file.name}" exceeds 5MB limit`, 'error');
                e.target.value = null;
                return;
            }
        }
        setLocalImages(prev => [...prev, ...files]);
        showToast(`${files.length} image(s) selected. Click "Upload Images" to proceed.`, 'success');
    };

    const uploadSingleFile = async (file) => {
        const authData = JSON.parse(localStorage.getItem('adminAuth'));
        const fd = new FormData();
        fd.append('image', file);
        const res = await fetch(`${ApiBaseUrl}/upload-image`, {
            method: 'POST',
            headers: authData?.token ? { Authorization: `Bearer ${authData.token}` } : {},
            body: fd,
        });
        const body = await res.json();
        return body.imageUrl || body.url || body.data?.url || body.data;
    };

    const handleUploadAll = async () => {
        if (!localImages.length) {
            showToast('⚠️ Please select images first', 'error');
            return;
        }
        setUploading(true);
        showToast(`Uploading ${localImages.length} image(s)...`, 'success');
        try {
            const urls = [];
            for (const file of localImages) {
                const u = await uploadSingleFile(file);
                urls.push(u);
            }
            setForm(f => ({ ...f, images: [...f.images, ...urls] }));
            setLocalImages([]);
            showToast(`✓ Successfully uploaded ${urls.length} image(s)!`, 'success');
        } catch (err) {
            showToast('Upload failed. Please try again.', 'error');
        } finally {
            setUploading(false);
        }
    };

    // Helper function to check if content has actual text (not just HTML tags)
    const hasActualContent = (htmlContent) => {
        if (!htmlContent || htmlContent.trim() === '') return false;
        // Strip HTML tags and check if there's actual text
        const textContent = htmlContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        return textContent.length > 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation with better content checking
        if (!form.title || !form.title.trim()) {
            showToast('Title is required', 'error');
            setLoading(false);
            return;
        }

        if (!hasActualContent(form.content)) {
            showToast('Content is required. Please add some text to your blog post.', 'error');
            setLoading(false);
            return;
        }

        if (!form.category || !form.category.trim()) {
            showToast('Category is required', 'error');
            setLoading(false);
            return;
        }

        // Ensure slug is generated if missing
        let finalSlug = form.slug;
        if (!finalSlug || !finalSlug.trim()) {
            finalSlug = form.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const url = isEditMode ? `${ApiBaseUrl}/updateBlog/${id}` : `${ApiBaseUrl}/createBlog`;
            const method = isEditMode ? 'PUT' : 'POST';

            // Prepare form data with cleaned values
            const formData = {
                ...form,
                title: form.title.trim(),
                slug: finalSlug,
                category: form.category.trim(),
                content: form.content.trim(),
                excerpt: form.excerpt?.trim() || '',
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                showToast(`✓ Blog ${isEditMode ? 'updated' : 'created'} successfully!`, 'success');
                setTimeout(() => navigate('/blog/all'), 1500);
            } else {
                // Show detailed error message
                let errorMessage = data.message || `Failed to ${isEditMode ? 'update' : 'create'} blog`;
                if (data.errors && Array.isArray(data.errors)) {
                    errorMessage += ': ' + data.errors.join(', ');
                }
                console.error('Blog creation error:', data);
                showToast(errorMessage, 'error');
            }
        } catch (err) {
            console.error('Blog submission error:', err);
            showToast('Server error. Please check your connection and try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Loading Blog Data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20">
            <div className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Modern Header - v2.0.5 */}
                <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl shadow-2xl p-8">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    
                    <div className="relative">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                                    {isEditMode ? 'Edit Blog Post' : 'Create Blog Post'}
                                </h1>
                                <p className="text-red-100 text-sm font-medium">
                                    {isEditMode ? 'Update blog content and settings' : 'Add new blog to your site'}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/blog/all')}
                                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-bold active:scale-95"
                            >
                                Back to List
                            </button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden">
                    <div className="p-10 space-y-8">
                        {/* Basic Information */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">
                                Basic Information
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => updateForm('title', e.target.value)}
                                        placeholder="Enter blog title..."
                                        required
                                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none focus:border-red-600 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Slug <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.slug}
                                        onChange={(e) => updateForm('slug', e.target.value)}
                                        placeholder="blog-post-slug"
                                        required
                                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none focus:border-red-600 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.category}
                                        onChange={(e) => updateForm('category', e.target.value.trim())}
                                        placeholder="e.g., Technology, Finance..."
                                        required
                                        className={`w-full px-5 py-3.5 border-2 rounded-2xl text-sm font-bold transition-all outline-none focus:bg-white ${
                                            !form.category || !form.category.trim() 
                                                ? 'border-red-300 focus:border-red-600' 
                                                : 'border-gray-200 focus:border-red-600'
                                        }`}
                                    />
                                    {(!form.category || !form.category.trim()) && (
                                        <p className="text-xs text-red-500 mt-1">Category is required</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Excerpt</label>
                                    <textarea
                                        value={form.excerpt}
                                        onChange={(e) => updateForm('excerpt', e.target.value)}
                                        placeholder="Short description of the blog..."
                                        rows={3}
                                        maxLength={500}
                                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none resize-none focus:border-red-600 focus:bg-white"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{form.excerpt.length}/500 characters</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">
                                Content <span className="text-red-500">*</span>
                            </h2>
                            <div className={!hasActualContent(form.content) ? 'ring-2 ring-red-300 rounded-2xl' : ''}>
                                <RichTextEditor
                                    value={form.content}
                                    onChange={(value) => updateForm('content', value)}
                                    placeholder="Write your blog content here..."
                                />
                            </div>
                            {!hasActualContent(form.content) && (
                                <p className="text-xs text-red-500 mt-1">Content is required. Please add some text to your blog post.</p>
                            )}
                        </div>

                        {/* Featured Image */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">
                                Featured Image
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                                    <input
                                        type="url"
                                        value={form.featuredImage}
                                        onChange={(e) => updateForm('featuredImage', e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none focus:border-red-600 focus:bg-white"
                                    />
                                </div>
                                {form.featuredImage && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Preview</label>
                                        <img src={form.featuredImage} alt="Featured" className="w-full h-48 object-cover rounded-2xl border-2 border-gray-200" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Images */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">
                                Additional Images
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Image Pipeline</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {form.images.map((url, i) => (
                                            <div key={i} className="group relative aspect-square rounded-3xl overflow-hidden border-2 border-gray-100 shadow-sm">
                                                <img src={url} className="w-full h-full object-cover" alt="" />
                                                <button
                                                    type="button"
                                                    onClick={() => updateForm('images', form.images.filter((_, idx) => idx !== i))}
                                                    className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-all font-black text-[10px]"
                                                >
                                                    REMOVE
                                                </button>
                                            </div>
                                        ))}
                                        {localImages.map((file, i) => (
                                            <div key={i} className="relative aspect-square rounded-3xl overflow-hidden border-2 border-dashed border-gray-300 opacity-50 bg-gray-50 flex items-center justify-center p-2">
                                                <img src={URL.createObjectURL(file)} className="w-full h-full object-contain opacity-30" alt="" />
                                            </div>
                                        ))}
                                        <label className="aspect-square rounded-3xl border-4 border-dashed border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all flex flex-col items-center justify-center cursor-pointer group">
                                            <input type="file" multiple className="hidden" onChange={handleFilesChange} />
                                            <span className="text-3xl text-gray-200 group-hover:text-red-600 font-light">+</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="bg-gray-900 rounded-[3rem] p-10 flex flex-col justify-center items-center text-center space-y-6 shadow-2xl">
                                    <button
                                        type="button"
                                        disabled={!localImages.length || uploading}
                                        onClick={handleUploadAll}
                                        className="w-full py-5 bg-white text-gray-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all disabled:opacity-20"
                                    >
                                        {uploading ? 'Uploading...' : `Upload ${localImages.length} New Assets`}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">
                                Tags
                            </h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {form.tags.map((tag, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="text-blue-700 hover:text-blue-900"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    placeholder="Add a tag..."
                                    className="flex-1 px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none focus:border-red-600 focus:bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-6 py-3.5 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition"
                                >
                                    Add Tag
                                </button>
                            </div>
                        </div>

                        {/* SEO & Settings */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">
                                SEO & Settings
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
                                    <input
                                        type="text"
                                        value={form.metaTitle}
                                        onChange={(e) => updateForm('metaTitle', e.target.value)}
                                        placeholder="SEO meta title..."
                                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none focus:border-red-600 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => updateForm('status', e.target.value)}
                                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none focus:border-red-600 focus:bg-white"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
                                    <textarea
                                        value={form.metaDescription}
                                        onChange={(e) => updateForm('metaDescription', e.target.value)}
                                        placeholder="SEO meta description..."
                                        rows={3}
                                        maxLength={160}
                                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none resize-none focus:border-red-600 focus:bg-white"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{form.metaDescription.length}/160 characters</p>
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.isFeatured}
                                            onChange={(e) => updateForm('isFeatured', e.target.checked)}
                                            className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                        />
                                        <span className="text-sm font-bold text-gray-700">Featured Blog</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.isPinned}
                                            onChange={(e) => updateForm('isPinned', e.target.checked)}
                                            className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                        />
                                        <span className="text-sm font-bold text-gray-700">Pinned Blog</span>
                                    </label>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">SEO Keywords</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {form.seoKeywords.map((keyword, idx) => (
                                            <span key={idx} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium flex items-center gap-2">
                                                {keyword}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveKeyword(keyword)}
                                                    className="text-purple-700 hover:text-purple-900"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddKeyword}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition"
                                    >
                                        Add Keyword
                                    </button>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Admin Notes</label>
                                    <textarea
                                        value={form.adminNotes}
                                        onChange={(e) => updateForm('adminNotes', e.target.value)}
                                        placeholder="Internal notes (not visible to public)..."
                                        rows={3}
                                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none resize-none focus:border-red-600 focus:bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => navigate('/blog/all')}
                            className="px-10 py-4 font-black uppercase text-[10px] tracking-widest text-gray-400 hover:text-gray-900 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-12 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (isEditMode ? 'Update Blog' : 'Publish Blog')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Toast Notification */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
        </div>
    );
};

export default BlogAdd;

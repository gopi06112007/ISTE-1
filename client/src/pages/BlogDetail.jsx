import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import PageTransition from '../components/ui/PageTransition';
import SafeImage from '../components/SafeImage';
import { sanitizeBlogContent } from '../utils/html';

const BlogDetail = ({ blogId }) => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blogIds, setBlogIds] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [reactions, setReactions] = useState({
    '👍': 0, '❤️': 0, '😂': 0, '😮': 0, '😢': 0,
    '😡': 0, '👏': 0, '🔥': 0, '🎉': 0, '💡': 0
  });
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const navigate = useNavigate();

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const reactionsRef = useRef(null);

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blogs/${blogId}`);
      if (response.data.success) {
        const blogData = response.data.data;
        setBlog(blogData);
        // Initialize likes and reactions from database
        const savedLiked = localStorage.getItem(`iste_blog_liked_${blogId}`) === 'true';
        setIsLiked(savedLiked);
        setLikesCount(blogData.likes || 0);
        if (blogData.reactions) {
          // If reactions is a Map/Object
          setReactions(blogData.reactions);
        }
      }

      const listResponse = await api.get('/blogs');
      if (listResponse.data.success) {
        setBlogIds(listResponse.data.data.map(b => b._id));
      }
    } catch (err) {
      setError('Failed to load blog post.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  useEffect(() => {
    if (window.location.hash === '#comments' && reactionsRef.current) {
      setTimeout(() => {
        reactionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [blog]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatFullDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const categoryConfig = {
    Announcement: { color: '#EF4444', bg: '#FEF2F2', icon: '📢' },
    Achievement: { color: '#F59E0B', bg: '#FFFBEB', icon: '🏅' },
    Technical: { color: '#06B6D4', bg: '#ECFEFF', icon: '💡' },
    'ISTE News': { color: '#1A56DB', bg: '#EFF6FF', icon: '📰' },
  };

  const handleLikeClick = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    localStorage.setItem(`iste_blog_liked_${blogId}`, nextLiked ? 'true' : 'false');
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await api.post(`/blogs/${blogId}/like`, { action: nextLiked ? 'like' : 'unlike' });
    } catch (error) {
      console.error('Failed to sync like with backend:', error);
    }
  };

  const fallbackCopyText = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
  };

  const handleShare = async () => {
    try {
      await api.post(`/blogs/${blogId}/share`);
    } catch (error) {
      console.error('Failed to sync share with backend:', error);
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href);
      } else {
        fallbackCopyText(window.location.href);
      }
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  const handleReactClick = async (emoji) => {
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));

    try {
      const response = await api.post(`/blogs/${blogId}/react`, { emoji });
      if (response.data.success) {
        setReactions(response.data.reactions);
      }
    } catch (error) {
      console.error('Failed to send reaction to backend:', error);
    }
  };

  if (loading) {
    return (
      <PageTransition className="pt-2 lg:pt-20 min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
          <p className="text-gray-500 ">Loading post...</p>
        </div>
      </PageTransition>
    );
  }

  if (error || !blog) {
    return (
      <PageTransition className="pt-2 lg:pt-20 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Post not found.'}</p>
          <Link to="/blog" className="btn-secondary">
            Back to Blog
          </Link>
        </div>
      </PageTransition>
    );
  }

  const authorName = blog.author?.profileId?.name || blog.author?.email || 'ISTE GMRIT';
  const authorPhoto = blog.author?.profileId?.photoUrl;
  const sanitizedContent = sanitizeBlogContent(blog.content);
  const catConfig = categoryConfig[blog.category] || categoryConfig['ISTE News'];

  const handleSwipeLeft = () => {
    if (blogIds.length <= 1) return;
    const currentIndex = blogIds.indexOf(blogId);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % blogIds.length;
    navigate(`/blog/${blogIds[nextIndex]}`);
  };

  const handleSwipeRight = () => {
    if (blogIds.length <= 1) return;
    const currentIndex = blogIds.indexOf(blogId);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + blogIds.length) % blogIds.length;
    navigate(`/blog/${blogIds[prevIndex]}`);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = window.innerWidth * 0.5;

    if (diff > minSwipeDistance) {
      handleSwipeLeft();
    } else if (diff < -minSwipeDistance) {
      handleSwipeRight();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Get reading time
  const getReadTime = () => {
    const text = (blog.content || '').replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };
  // Get active reaction emojis sorted by their counts
  const totalReactionsCount = likesCount + Object.values(reactions).reduce((sum, val) => sum + val, 0);
  const activeEmojis = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([emoji]) => emoji);

  if (likesCount > 0 && !activeEmojis.includes('👍')) {
    activeEmojis.unshift('👍');
  }
  const emojisToShow = activeEmojis.slice(0, 3);

  return (
    <PageTransition>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="pt-2 lg:pt-20 touch-pan-y bg-[#F0F2F5] min-h-screen"
      >
        {/* Navigation arrows (desktop only) */}
        {blogIds.length > 1 && (
          <>
            <button
              onClick={handleSwipeRight}
              className="fixed left-4 xl:left-8 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full hidden lg:flex items-center justify-center bg-white text-slate-600 shadow-md hover:shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
              aria-label="Previous blog"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleSwipeLeft}
              className="fixed right-4 xl:right-8 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full hidden lg:flex items-center justify-center bg-white text-slate-600 shadow-md hover:shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
              aria-label="Next blog"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        <article className="pt-3 pb-12 lg:pt-4 lg:pb-16">
          <div className="max-w-[680px] mx-auto px-4 sm:px-0">

            {/* Back link */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-white/80 transition-all mb-3"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>

            {/* Animation wrapper keyed by blogId */}
            <AnimatePresence mode="wait">
              <motion.div
                key={blogId}
                initial={{ opacity: 0, x: '50vw' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '-50vw' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {/* ── Facebook-style Post Card ── */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">

                  {/* ── Post Header: Author info ── */}
                  <div className="px-4 pt-4 pb-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-iste-blue to-sky-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                        {authorPhoto ? (
                          <SafeImage
                            src={authorPhoto}
                            alt={authorName}
                            className="w-full h-full object-cover rounded-full"
                            fallbackType="profile"
                            name={authorName}
                          />
                        ) : (
                          authorName.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Author name & metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-[15px] font-bold text-slate-900 leading-tight">
                            {authorName}
                          </h3>
                          {/* Category badge */}
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: catConfig.bg, color: catConfig.color }}
                          >
                            <span>{catConfig.icon}</span>
                            {blog.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="text-[13px] text-slate-500 hover:underline cursor-pointer"
                            title={formatFullDate(blog.publishedAt)}
                          >
                            {formatDate(blog.publishedAt)}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-[12px] text-slate-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {getReadTime()} min read
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ── Post Title ── */}
                  <div className="px-4 pb-3">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                      {blog.title}
                    </h1>
                  </div>

                  {/* ── Featured Image ── */}
                  {blog.featuredImageUrl && (
                    <div className="w-full bg-slate-100">
                      <SafeImage
                        src={blog.featuredImageUrl}
                        alt={`${blog.title} - featured image`}
                        className="w-full max-h-[500px] object-cover object-center"
                        fallbackType="blog"
                        eager
                      />
                    </div>
                  )}

                  {/* ── Blog Content ── */}
                  <div className="px-4 sm:px-6 pt-4 pb-6">
                    <div
                      className="prose prose-sm sm:prose-base max-w-none
                        prose-headings:font-extrabold prose-headings:text-slate-800 prose-headings:mt-6 prose-headings:mb-3
                        prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                        prose-p:text-[15px] prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-3
                        prose-a:text-iste-blue prose-a:no-underline hover:prose-a:underline
                        prose-blockquote:border-l-iste-blue prose-blockquote:bg-slate-50 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic
                        prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                        prose-pre:bg-slate-900 prose-pre:rounded-lg
                        prose-img:rounded-lg prose-img:shadow-md prose-img:w-full
                        prose-strong:text-slate-800
                        prose-ul:text-[15px] prose-ol:text-[15px]
                        prose-li:text-slate-700 prose-li:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    />
                  </div>

                  {/* ── Reactions Summary Bar ── */}
                  <div className="px-4 py-2.5 flex items-center justify-between border-t border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      {totalReactionsCount > 0 ? (
                        <>
                          {/* Reaction emoji cluster */}
                          <div className="flex -space-x-1 text-xs">
                            {emojisToShow.map((emoji, idx) => (
                              <span 
                                key={emoji} 
                                className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-white border border-slate-200 shadow-sm z-10"
                                style={{ zIndex: 10 - idx }}
                              >
                                {emoji}
                              </span>
                            ))}
                          </div>
                          <span className="text-[13px] text-slate-500 ml-1.5">
                            {totalReactionsCount}
                          </span>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 select-none">
                          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-[12px] font-semibold">Be the first to react</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[13px] text-slate-500">
                      {getReadTime()} min read
                    </span>
                  </div>

                  {/* ── Action Buttons Bar (Like, Share) ── */}
                  <div className="px-4 py-1 flex items-center border-b border-slate-100 gap-1.5">
                    {/* Like Button */}
                    <motion.button
                      onClick={handleLikeClick}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(26, 86, 219, 0.05)' }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[14px] font-semibold transition-colors ${
                        isLiked ? 'text-iste-blue bg-iste-blue/5' : 'text-slate-500'
                      }`}
                    >
                      <motion.svg
                        className="w-5 h-5"
                        fill={isLiked ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        animate={isLiked ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </motion.svg>
                      <span>{isLiked ? 'Liked' : 'Like'}</span>
                    </motion.button>

                    {/* Share Button (Glitch fixed: Direct flex child with no nested relative wrappers) */}
                    <motion.button
                      onClick={handleShare}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(100, 116, 139, 0.05)' }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[14px] font-semibold text-slate-500 transition-colors"
                    >
                      <motion.svg 
                        className="w-5 h-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        whileHover={{ rotate: 15 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </motion.svg>
                      <span>Share</span>
                    </motion.button>
                  </div>

                  {/* ── Emoji Reactions Picker (RTL Horizontal Scroll) ── */}
                  <div 
                    id="comments" 
                    ref={reactionsRef}
                    className="px-4 py-3 bg-slate-50/60 flex flex-col gap-1.5 scroll-mt-20"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider select-none">
                      <span>REACTION EMOJIS</span>
                      <span>← SCROLL TO DISCOVER</span>
                    </div>
                    <div className="flex overflow-x-auto gap-3 py-1 no-scrollbar scroll-smooth" style={{ direction: 'rtl' }}>
                      {['😡', '😢', '😮', '😂', '💡', '🎉', '👏', '🔥', '❤️', '👍'].map((emoji) => {
                        const count = reactions[emoji] || 0;
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReactClick(emoji)}
                            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 active:scale-95 transition-all px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm flex-shrink-0 text-sm select-none"
                          >
                            <span>{emoji}</span>
                            {count > 0 && <span className="text-[11px] font-bold text-slate-500">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </article>

        {/* Copied tooltip (floating toast) */}
        <AnimatePresence>
          {showShareTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              className="fixed bottom-6 right-6 bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg z-50 flex items-center gap-2"
            >
              <span>🔗 Link copied to clipboard!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default BlogDetail;

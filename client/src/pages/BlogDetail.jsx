import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import PageTransition from '../components/ui/PageTransition';
import SafeImage from '../components/SafeImage';
import ClayCard from '../components/ui/ClayCard';
import { sanitizeBlogContent } from '../utils/html';

const BlogDetail = ({ blogId }) => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blogIds, setBlogIds] = useState([]);
  const navigate = useNavigate();

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blogs/${blogId}`);
      if (response.data.success) {
        setBlog(response.data.data);
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const categoryColors = {
    Announcement: 'bg-red-100 text-red-700  ',
    Achievement: 'bg-amber-100 text-amber-700  ',
    Technical: 'bg-cyan-100 text-cyan-700  ',
    'ISTE News': 'bg-iste-blue/10 text-iste-blue  ',
  };

  if (loading) {
    return (
      <PageTransition className="pt-16 lg:pt-20 min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
          <p className="text-gray-500 ">Loading post...</p>
        </div>
      </PageTransition>
    );
  }

  if (error || !blog) {
    return (
      <PageTransition className="pt-16 lg:pt-20 min-h-[60vh] flex items-center justify-center">
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
    const minSwipeDistance = 50;

    if (diff > minSwipeDistance) {
      handleSwipeLeft();
    } else if (diff < -minSwipeDistance) {
      handleSwipeRight();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <PageTransition>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="pt-16 lg:pt-20 touch-pan-y"
      >
        <article className="pt-4 pb-12 lg:pt-6 lg:pb-16 relative">
          {/* Navigation arrows (desktop only) */}
          {blogIds.length > 1 && (
            <>
              <button
                onClick={handleSwipeRight}
                className="fixed left-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full hidden lg:flex items-center justify-center bg-[#EEF1F5] text-slate-700 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all"
                aria-label="Previous blog"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleSwipeLeft}
                className="fixed right-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full hidden lg:flex items-center justify-center bg-[#EEF1F5] text-slate-700 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all"
                aria-label="Next blog"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="section-container max-w-4xl">
            {/* Back link - clay button */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-slate-600 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all mb-5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>

            {/* Animation Wrapper keyed by blogId */}
            <motion.div
              key={blogId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {/* Main content wrapped in a raised ClayCard, min-h-[50vh] pushed footer down */}
              <ClayCard variant="raised" size="lg" className="p-5 md:p-8 min-h-[50vh] flex flex-col justify-start">
                {/* Category */}
                <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full mb-4 w-fit ${categoryColors[blog.category] || ''}`}>
                  {blog.category}
                </span>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800 mb-4 leading-tight select-none">
                  {blog.title}
                </h1>

                {/* Author & Date */}
                <div className="flex items-center gap-4 mb-6 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#EEF1F5] flex items-center justify-center text-iste-blue font-extrabold text-base flex-shrink-0 shadow-clay-sm">
                    {authorPhoto ? (
                      <SafeImage src={authorPhoto} alt={authorName} className="w-full h-full object-cover rounded-full" fallbackType="profile" name={authorName} />
                    ) : (
                      authorName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">{authorName}</p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {formatDate(blog.publishedAt)}
                    </p>
                  </div>
                </div>

                {/* Featured Image — cinematic banner inside clay-inset frame */}
                {blog.featuredImageUrl && (
                  <div className="mb-6 w-full bg-[#EEF1F5] rounded-clay-md shadow-clay-inset p-1.5 aspect-[16/9] md:aspect-[21/9] flex-shrink-0">
                    <div className="w-full h-full rounded-clay-sm overflow-hidden shadow-clay-inset">
                      <SafeImage
                        src={blog.featuredImageUrl}
                        alt={`${blog.title} - featured image`}
                        className="w-full h-full object-cover object-center"
                        fallbackType="blog"
                        eager
                      />
                    </div>
                  </div>
                )}

                {/* Content — rendered TipTap HTML */}
                <div
                  className="prose prose-lg max-w-none font-medium flex-grow text-justify
                    prose-headings:font-extrabold prose-headings:text-slate-800
                    prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-justify
                    prose-a:text-iste-blue prose-a:no-underline hover:prose-a:underline
                    prose-blockquote:border-l-iste-blue prose-blockquote:bg-[#EEF1F5] prose-blockquote:shadow-clay-inset prose-blockquote:rounded-r-xl prose-blockquote:py-2 prose-blockquote:px-4
                    prose-code:bg-[#EEF1F5] prose-code:shadow-clay-inset prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-slate-900 prose-pre:rounded-xl
                    prose-img:rounded-xl prose-img:shadow-lg prose-img:w-full
                    prose-strong:text-slate-800"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              </ClayCard>
            </motion.div>
          </div>
        </article>
      </div>
    </PageTransition>
  );
};

export default BlogDetail;

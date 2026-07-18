import { useState } from 'react';
import { Link } from 'react-router-dom';
import SafeImage from './SafeImage';
import api from '../api/axios';

const getMockLikes = (id) => {
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 140) + 12;
};

const BlogCard = ({ blog, featured = false }) => {
  const mockLikesBase = getMockLikes(blog._id);
  const [isLiked, setIsLiked] = useState(() => {
    return localStorage.getItem(`iste_blog_liked_${blog._id}`) === 'true';
  });
  const [likesCount, setLikesCount] = useState(blog.likes || 0);

  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    localStorage.setItem(`iste_blog_liked_${blog._id}`, nextLiked ? 'true' : 'false');
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    
    try {
      await api.post(`/blogs/${blog._id}/like`, { action: nextLiked ? 'like' : 'unlike' });
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

  const handleShareClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/blog/${blog._id}`;
    
    try {
      await api.post(`/blogs/${blog._id}/share`);
    } catch (error) {
      console.error('Failed to sync share with backend:', error);
    }

    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: getExcerpt(blog.content, 120),
        url: shareUrl,
      }).catch(console.error);
    } else {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl);
      } else {
        fallbackCopyText(shareUrl);
      }
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getExcerpt = (html, maxLen = 120) => {
    const text = html?.replace(/<[^>]*>/g, '') || '';
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
  };

  /* ─────────── Redesigned Frameless Card Layout ─────────── */
  return (
    <div className="flex flex-col h-full bg-transparent group">
      {/* Image at the top with rounded corners */}
      <Link to={`/blog/${blog._id}`} className="relative block aspect-[16/10] overflow-hidden rounded-[1.25rem] mb-4 overflow-hidden select-none">
        <SafeImage
          src={blog.featuredImageUrl}
          alt={`${blog.title} featured image`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          fallbackType="blog"
          objectPosition="center center"
        />
      </Link>

      {/* Title */}
      <Link to={`/blog/${blog._id}`} className="block mb-2 group-hover:opacity-90 transition-opacity">
        <h3 className="font-condensed text-xl sm:text-[22px] font-bold leading-tight text-slate-900 tracking-tight">
          {blog.title}
        </h3>
      </Link>

      {/* Description */}
      <p className="text-[13px] sm:text-[14px] text-slate-500 leading-relaxed line-clamp-3 mb-3">
        {getExcerpt(blog.content, 180)}
      </p>

      {/* Date */}
      <span className="text-[12px] sm:text-[13px] text-slate-400 mb-4 block select-none">
        {formatDate(blog.publishedAt)}
      </span>

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100/50">
        <Link 
          to={`/blog/${blog._id}`} 
          className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#E25B3C] hover:text-[#c4492e] transition-colors duration-200"
        >
          <span>Read More</span>
          <svg className="w-3.5 h-3.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>

        {/* Action icons */}
        <div className="flex items-center gap-4 text-slate-700">
          {/* Like */}
          <button 
            onClick={handleLikeClick} 
            className="hover:scale-105 active:scale-95 transition-transform duration-200 flex items-center gap-1.5"
            title="Like"
          >
            <svg 
              className={`w-4 h-4 transition-colors duration-200 ${isLiked ? 'text-[#E25B3C]' : 'text-slate-400'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 00-.8 2.4L6.8 9.2a1 1 0 00-.8 1.133z" />
            </svg>
            <span className="text-[11.5px] font-bold text-slate-600">{likesCount}</span>
          </button>

          {/* Comment */}
          <Link 
            to={`/blog/${blog._id}#comments`} 
            className="hover:text-[#E25B3C] transition-colors duration-200"
            title="Comment"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .806-.332 48.242 48.242 0 0 0 3.413-.387c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </Link>

          {/* Share */}
          <button 
            onClick={handleShareClick} 
            className="hover:text-[#E25B3C] transition-colors duration-200"
            title="Share"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186l5.57 3.285m-5.57-3.285a2.25 2.25 0 1 1 0-2.186m0 2.186l5.57-3.285m0 0a2.25 2.25 0 1 1 3.58 1.838M12 16.5a2.25 2.25 0 1 0 3.58-1.838" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;

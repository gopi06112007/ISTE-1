import { useState } from 'react';
import { Link } from 'react-router-dom';
import SafeImage from './SafeImage';
import ClayCard from './ui/ClayCard';

const getMockLikes = (id) => {
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 140) + 12; // stable count between 12 and 151
};

const BlogCard = ({ blog, featured = false }) => {
  const mockLikesBase = getMockLikes(blog._id);
  const [isLiked, setIsLiked] = useState(() => {
    return localStorage.getItem(`iste_blog_liked_${blog._id}`) === 'true';
  });
  const [likesCount, setLikesCount] = useState(() => {
    const saved = localStorage.getItem(`iste_blog_liked_${blog._id}`) === 'true';
    return saved ? mockLikesBase + 1 : mockLikesBase;
  });

  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    localStorage.setItem(`iste_blog_liked_${blog._id}`, nextLiked ? 'true' : 'false');
    setLikesCount((prev) => (nextLiked ? prev + 1 : prev - 1));
  };
  // Soft clay badges
  const categoryChipColors = {
    Announcement: 'text-red-600 bg-[#EEF1F5] shadow-clay-inset',
    Achievement: 'text-amber-600 bg-[#EEF1F5] shadow-clay-inset',
    Technical: 'text-cyan-600 bg-[#EEF1F5] shadow-clay-inset',
    'ISTE News': 'text-blue-600 bg-[#EEF1F5] shadow-clay-inset',
  };

  const categoryIcons = {
    Announcement: '📢',
    Achievement: '🏅',
    Technical: '💡',
    'ISTE News': '📰',
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Strip HTML tags for excerpt
  const getExcerpt = (html, maxLen = 120) => {
    const text = html?.replace(/<[^>]*>/g, '') || '';
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
  };

  const authorName =
    blog.author?.profileId?.name ||
    blog.author?.email ||
    'ISTE GMRIT';

  const chipClass = categoryChipColors[blog.category] || 'text-slate-600 bg-[#EEF1F5] shadow-clay-inset';

  if (featured) {
    return (
      <ClayCard
        as={Link}
        to={`/blog/${blog._id}`}
        interactive={true}
        className="overflow-hidden lg:flex p-4 gap-4"
      >
        {/* Featured Image sits in a clay-inset frame with padding */}
        <div className="relative lg:w-[45%] aspect-video lg:aspect-auto bg-[#EEF1F5] rounded-clay-sm shadow-clay-inset p-2 flex-shrink-0">
          <div className="w-full h-full rounded-clay-sm overflow-hidden shadow-clay-inset">
            <SafeImage
              src={blog.featuredImageUrl}
              alt={`${blog.title} featured image`}
              className="w-full h-full object-cover"
              fallbackType="blog"
              objectPosition="center center"
            />
          </div>

          {/* Category chip — overlaps image corner */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${chipClass}`}>
              {categoryIcons[blog.category]} {blog.category}
            </span>
          </div>
        </div>

        {/* Content — ~55% */}
        <div className="lg:w-[55%] p-4 flex flex-col justify-center">
          {/* Category chip (mobile — hidden on desktop since it's on image) */}
          <span className={`lg:hidden inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-3 ${chipClass}`}>
            {categoryIcons[blog.category]} {blog.category}
          </span>

          <h2 className="text-xl lg:text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
            {blog.title}
          </h2>

          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-5 font-medium">
            {getExcerpt(blog.content, 200)}
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-500 pt-4 border-t border-slate-200/40 font-bold">
            <div className="w-7 h-7 rounded-full bg-[#EEF1F5] flex items-center justify-center text-iste-blue text-[10px] font-extrabold shadow-clay-sm flex-shrink-0">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-700">{authorName}</span>
            <span className="text-gray-300">•</span>
            <span>{formatDate(blog.publishedAt)}</span>
          </div>
        </div>
      </ClayCard>
    );
  }

  return (
    <ClayCard
      as={Link}
      to={`/blog/${blog._id}`}
      interactive={true}
      className="group overflow-hidden flex flex-col h-full"
    >
      {/* Image sits flush at the top */}
      <div className="relative w-full aspect-[16/10] overflow-hidden flex-shrink-0">
        <div className="w-full h-full">
          <SafeImage
            src={blog.featuredImageUrl}
            alt={`${blog.title} featured image`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            fallbackType="blog"
            objectPosition="center center"
          />
        </div>

        {/* Category chip — top-left overlapping image */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-sm ${chipClass}`}>
            {categoryIcons[blog.category]} {blog.category}
          </span>
        </div>

        {/* Like button & count badge — top-right overlapping image */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-center">
          <span className="text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded mb-1 select-none backdrop-blur-sm">
            {likesCount}
          </span>
          <button
            onClick={handleLikeClick}
            className={`w-7 h-7 rounded-full flex items-center justify-center bg-[#EEF1F5] shadow-clay-sm hover:shadow-clay-md active:scale-90 transition-all ${
              isLiked ? 'text-red-500' : 'text-slate-400'
            }`}
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
          >
            <svg className="w-3.5 h-3.5" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow justify-between bg-white">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 mb-2 line-clamp-2 group-hover:text-iste-blue transition-colors duration-300">
            {blog.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed font-medium">
            {getExcerpt(blog.content, 110)}
          </p>
        </div>

        {/* Author / date footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-auto font-bold">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#EEF1F5] flex items-center justify-center text-iste-blue text-[9px] font-extrabold shadow-clay-sm flex-shrink-0">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-700">{authorName}</span>
          </div>
          <span>{formatDate(blog.publishedAt)}</span>
        </div>
      </div>
    </ClayCard>
  );
};

export default BlogCard;

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import BlogCard from '../components/BlogCard';
import BlogDetail from './BlogDetail';
import PageTransition from '../components/ui/PageTransition';
import ClayCard from '../components/ui/ClayCard';

const CATEGORIES = ['All', 'Announcement', 'Achievement', 'Technical', 'ISTE News'];

const Blog = () => {
  const { id } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    if (!id) {
      fetchBlogs();
    }
  }, [id]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/blogs');
      if (response.data.success) {
        setBlogs(response.data.data);
      }
    } catch (err) {
      setError('Failed to load blog posts. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // If we have an ID param, show the detail view
  if (id) {
    return <BlogDetail blogId={id} />;
  }

  const filteredBlogs = blogs.filter((blog) => {
    if (activeCategory !== 'All' && blog.category !== activeCategory) return false;
    return true;
  });

  return (
    <PageTransition className="pt-16 lg:pt-20">
      <section className="bg-transparent pt-6 pb-16 lg:pt-8 lg:pb-24">
        <div className="section-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 animate-fade-in select-none">
              Blog & <span className="text-transparent bg-clip-text bg-gradient-to-r from-iste-blue to-sky-500">Announcements</span>
            </h1>
            <p className="text-slate-600 font-bold max-w-xl mx-auto text-sm sm:text-base animate-fade-in select-none">
              News, achievements, technical articles, and announcements from ISTE GMRIT.
            </p>
          </div>

          {/* Category filter - Clay Toggle Buttons */}
          <div className="filter-scroll flex flex-nowrap md:flex-wrap md:justify-center gap-3 overflow-x-auto py-2 px-4 md:px-0 mb-6 select-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-clay-sm text-sm font-extrabold transition-all duration-300 active:scale-95 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-pressed'
                      : 'bg-[#EEF1F5] text-slate-600 shadow-clay-sm hover:shadow-clay-md'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
                <p className="text-slate-600 font-bold">Loading posts...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20 flex justify-center px-4">
              <ClayCard variant="raised" className="max-w-md w-full p-8 text-center flex flex-col items-center">
                <p className="text-red-600 font-bold mb-4">{error}</p>
                <button
                  onClick={fetchBlogs}
                  className="px-5 py-2.5 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all duration-300"
                >
                  Try Again
                </button>
              </ClayCard>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20 flex justify-center px-4">
              <ClayCard variant="raised" className="max-w-md w-full px-6 py-12 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#EEF1F5] shadow-clay-inset flex items-center justify-center">
                  <svg className="w-8 h-8 text-iste-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-extrabold text-slate-800">No Posts Found</h3>
                <p className="text-slate-500 font-bold text-sm">
                  No posts found{activeCategory !== 'All' ? ` in ${activeCategory}` : ''}. Posts will appear here once published.
                </p>
              </ClayCard>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <div key={blog._id}>
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
};

export default Blog;

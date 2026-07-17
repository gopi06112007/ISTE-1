import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import ClayCard from '../components/ui/ClayCard';
import BentoGrid from '../components/ui/BentoGrid';
import Footer from '../components/Footer';
import PageTransition from '../components/ui/PageTransition';
import HeroBackdrop from '../components/home/HeroBackdrop';
import {
  BranchCard,
  CountUp,
  GalleryHighlightsSection,
  LatestBlogSection,
  UpcomingEventsSection,
} from '../components/home/HomeSections';

const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [blogsError, setBlogsError] = useState('');
  const [galleryError, setGalleryError] = useState('');

  const branches = [
    {
      code: 'CSE',
      fullName: 'Computer Science & Engineering',
      tagline: 'Building the digital future through code, algorithms, and innovation.',
      color: '#1A56DB',
      bgImage: 'https://source.unsplash.com/featured/800x600/?circuit+board,technology',
    },
    {
      code: 'ECE',
      fullName: 'Electronics & Communication Engineering',
      tagline: 'Connecting the world through signals, systems, and smart devices.',
      color: '#7C3AED',
      bgImage: 'https://source.unsplash.com/featured/800x600/?electronics,circuit,communication',
    },
    {
      code: 'EEE',
      fullName: 'Electrical & Electronics Engineering',
      tagline: 'Powering industries with sustainable electrical solutions.',
      color: '#F59E0B',
      bgImage: 'https://source.unsplash.com/featured/800x600/?electrical,power,energy',
    },
    {
      code: 'MECH',
      fullName: 'Mechanical Engineering',
      tagline: 'Designing the machines that move the modern world.',
      color: '#6366F1',
      bgImage: 'https://source.unsplash.com/featured/800x600/?mechanical,gears,engineering',
    },
    {
      code: 'CIVIL',
      fullName: 'Civil Engineering',
      tagline: 'Shaping skylines and building the infrastructure of tomorrow.',
      color: '#0D9488',
      bgImage: 'https://source.unsplash.com/featured/800x600/?architecture,construction,bridge',
    },
    {
      code: 'IT',
      fullName: 'Information Technology',
      tagline: 'Transforming data into decisions through smart IT systems.',
      color: '#DB2777',
      bgImage: 'https://source.unsplash.com/featured/800x600/?server,network,data,technology',
    },
  ];

  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      setEventsError('');
      const response = await api.get('/events', { params: { status: 'upcoming' } });
      if (response.data.success) {
        // Sort by date ascending (nearest first)
        const sorted = [...response.data.data].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setUpcomingEvents(sorted.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setEventsError('Events could not be loaded right now. Please try again.');
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const fetchLatestBlogs = useCallback(async () => {
    try {
      setLoadingBlogs(true);
      setBlogsError('');
      const response = await api.get('/blogs');
      if (response.data.success) {
        // Sort by publishedAt descending (newest first), keep max 6
        const sorted = [...response.data.data].sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        setLatestBlogs(sorted.slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
      setBlogsError('Blog posts could not be loaded right now. Please try again.');
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

  const fetchGalleryPreview = useCallback(async () => {
    try {
      setLoadingGallery(true);
      setGalleryError('');
      const response = await api.get('/gallery');
      if (response.data.success) {
        // Sort albums by createdAt descending
        const sorted = [...response.data.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        // Store top 3 albums
        setGalleryPreview(sorted.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
      setGalleryError('Gallery highlights could not be loaded right now. Please try again.');
    } finally {
      setLoadingGallery(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingEvents();
    fetchLatestBlogs();
    fetchGalleryPreview();
  }, [fetchUpcomingEvents, fetchLatestBlogs, fetchGalleryPreview]);

  const navigate = useNavigate();

  return (
    <PageTransition className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth relative z-10 w-full">
      {/* ══════════════════════════════════════ */}
      {/* Hero Section                           */}
      {/* ══════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center justify-center snap-start snap-always overflow-hidden colorful-gradient-bg"
      >
        {/* 3D Animated Background — fills entire section behind text */}
        <HeroBackdrop />

        {/* Content layer — sits above the 3D canvas, centered with safe margins for floating mobile logo (top) & bottom bar */}
        <div className="relative z-10 pt-24 pb-32 lg:py-16 flex flex-col items-center justify-center max-w-4xl mx-auto px-5 md:px-6 w-full">

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white/80 backdrop-blur-sm rounded-full text-iste-blue text-xs font-black mb-8 shadow-clay-sm select-none border border-slate-200/60"
          >
            <span className="w-2 h-2 bg-iste-blue rounded-full animate-pulse" />
            ISTE Student Chapter, GMRIT
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-4xl xs:text-[36px] sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight max-w-4xl leading-[1.15] select-none mx-auto text-center"
          >
            Empowering{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-iste-blue to-iste-violet">
              Technical Excellence
            </span>{' '}
            Through Innovation
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg text-slate-500 font-semibold leading-relaxed mb-10 max-w-2xl select-none text-center"
          >
            The Indian Society for Technical Education (ISTE) Student Chapter at GMRIT - a platform for engineers to connect, build, and lead. We spark curiosity and accelerate growth across all engineering disciplines.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 select-none w-full px-4 sm:px-0 z-20 relative"
          >
            {/* Primary Button: Explore Events */}
            <Link
              to="/events"
              className="group relative w-full sm:w-auto overflow-hidden rounded-full p-[2px] transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 shadow-lg hover:shadow-indigo-500/25"
            >
              {/* Outer neon gradient border wrapper */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-500 rounded-full" />
              {/* Inner body mask - fades out on hover */}
              <span className="absolute inset-[1.5px] bg-white rounded-full transition-all duration-300 group-hover:bg-transparent" />
              {/* Content layer */}
              <span className="relative z-10 flex items-center justify-center gap-3 px-9 py-4 font-bold text-base bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:text-white transition-all duration-300 whitespace-nowrap">
                <svg 
                  className="w-5 h-5 text-indigo-600 group-hover:text-white transition-all duration-300 group-hover:rotate-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Explore Events</span>
                <svg 
                  className="w-4 h-4 text-indigo-500 group-hover:text-white transition-all duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            {/* Secondary Button: Meet the Team */}
            <Link
              to="/coordinators"
              className="group relative w-full sm:w-auto overflow-hidden rounded-full p-[2px] transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 shadow-md hover:shadow-teal-500/20"
            >
              {/* Outer neon gradient border wrapper */}
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-500 rounded-full" />
              {/* Inner body mask - dark frosted slate */}
              <span className="absolute inset-[1.5px] bg-slate-900/90 rounded-full transition-all duration-300 group-hover:bg-slate-900/70" />
              {/* Content layer */}
              <span className="relative z-10 flex items-center justify-center gap-3 px-9 py-4 font-bold text-base text-white transition-all duration-300 whitespace-nowrap">
                <svg 
                  className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-all duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Meet the Team</span>
                <svg 
                  className="w-4 h-4 text-teal-300 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* About ISTE + Stats                     */}
      {/* ══════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col justify-center pt-24 pb-32 lg:py-28 snap-start snap-always bg-transparent">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="section-heading text-slate-800 mb-4 select-none">
              About <span className="gradient-text">ISTE</span>
            </h2>
            <p className="text-slate-600 font-bold leading-relaxed select-none" >
              The Indian Society for Technical Education (ISTE) is a national professional
              non-profit making society registered under the Societies Registration Act of 1860.
              Our GMRIT Student Chapter is dedicated to conducting workshops, seminars, competitions,
              and cultural events that enhance technical skills and promote all-round development
              of engineering students.
            </p>
          </div>

          <BentoGrid className="gap-6 justify-center">
            {[
              { 
                value: '6', 
                label: 'Active Branches', 
                size: 'bento-square', 
                accent: 'blue',
                colorClass: 'text-blue-600',
                innerHoverBg: 'group-hover:from-blue-600 group-hover:to-indigo-600',
                glowClass: 'hover:shadow-[0_12px_36px_rgba(37,99,235,0.18)] hover:-translate-y-1.5',
                icon: (
                  <svg className="w-7 h-7 text-blue-500 mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )
              },
              { 
                value: '50+', 
                label: 'Coordinators', 
                size: 'bento-square',
                accent: 'violet',
                colorClass: 'text-purple-600',
                innerHoverBg: 'group-hover:from-purple-600 group-hover:to-fuchsia-600',
                glowClass: 'hover:shadow-[0_12px_36px_rgba(147,51,234,0.18)] hover:-translate-y-1.5',
                icon: (
                  <svg className="w-7 h-7 text-purple-500 mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )
              },
              { 
                value: '30+', 
                label: 'Events/Year', 
                size: 'bento-square',
                accent: 'teal',
                colorClass: 'text-teal-600',
                innerHoverBg: 'group-hover:from-teal-600 group-hover:to-emerald-600',
                glowClass: 'hover:shadow-[0_12px_36px_rgba(13,148,136,0.18)] hover:-translate-y-1.5',
                icon: (
                  <svg className="w-7 h-7 text-teal-500 mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              { 
                value: '1000+', 
                label: 'Students Impacted', 
                size: 'bento-square',
                accent: 'rose',
                colorClass: 'text-rose-600',
                innerHoverBg: 'group-hover:from-rose-600 group-hover:to-pink-600',
                glowClass: 'hover:shadow-[0_12px_36px_rgba(225,29,72,0.18)] hover:-translate-y-1.5',
                icon: (
                  <svg className="w-7 h-7 text-rose-500 mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
            ].map((stat) => (
              <ClayCard
                key={stat.label}
                variant="raised"
                accent={stat.accent}
                interactive={true}
                className={`p-6 flex flex-col items-center justify-center text-center group ${stat.size} transition-all duration-500 ${stat.glowClass}`}
              >
                {stat.icon}
                <div className={`w-full max-w-[150px] mx-auto px-3 py-2.5 rounded-clay-sm bg-[#EEF1F5] shadow-clay-inset mb-4 text-2xl lg:text-3xl font-black font-jetbrains text-slate-700 select-none whitespace-nowrap transition-all duration-550 ease-out group-hover:bg-gradient-to-r ${stat.innerHoverBg} group-hover:text-white group-hover:shadow-none`}>
                  <CountUp value={stat.value} />
                </div>
                <div className={`text-xs font-black tracking-wider uppercase select-none transition-colors duration-300 text-slate-500 group-hover:${stat.colorClass}`}>{stat.label}</div>
              </ClayCard>
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* Branch Cards                           */}
      {/* ══════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col justify-center pt-24 pb-32 md:pt-32 relative snap-start snap-always">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          {/* Section header */}
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1 rounded-full bg-[#EEF1F5] text-iste-blue text-xs sm:text-sm font-black shadow-clay-sm mb-2.5">
              Our Branches
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800 mb-2 select-none">
              Six Branches. <span className="text-transparent bg-clip-text bg-gradient-to-r from-iste-blue to-sky-500">One Vision.</span>
            </h2>
            <p className="text-slate-600 font-bold max-w-xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed select-none">
              Each branch has its own dedicated ISTE team driving technical excellence,
              events, and innovation across GMRIT.
            </p>
          </div>

          {/* Staggered branch card grid - BentoGrid + BranchCard */}
          <BentoGrid className="gap-4 sm:gap-6 max-w-6xl mx-auto">
            {branches.map((branch, index) => {
              const bentoClass = 'col-span-6 sm:col-span-4';
              return (
                <motion.div
                  key={branch.code}
                  className={bentoClass}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <BranchCard
                    branch={branch}
                    onNavigate={() => navigate(`/coordinators?branch=${branch.code}`)}
                  />
                </motion.div>
              );
            })}
          </BentoGrid>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* Upcoming Events — Horizontal Scroll   */}
      {/* ══════════════════════════════════════ */}
      <UpcomingEventsSection
        events={upcomingEvents}
        loading={loadingEvents}
        error={eventsError}
        onRetry={fetchUpcomingEvents}
      />

      {/* ══════════════════════════════════════ */}
      {/* Latest Blog Posts                      */}
      {/* ══════════════════════════════════════ */}
      <LatestBlogSection
        posts={latestBlogs}
        loading={loadingBlogs}
        error={blogsError}
        onRetry={fetchLatestBlogs}
      />

      <GalleryHighlightsSection
        albums={galleryPreview}
        loading={loadingGallery}
        error={galleryError}
        onRetry={fetchGalleryPreview}
      />

      {/* ══════════════════════════════════════ */}
      {/* CTA Section                            */}
      {/* ══════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col justify-center py-20 lg:py-28 snap-start snap-always">
        <div className="section-container">
          <ClayCard
            variant="raised"
            size="lg"
            className="relative p-10 lg:p-16 text-center bg-gradient-to-br from-[#A8C5F0] to-[#C9B8F0] shadow-clay-lg"
          >
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-800 mb-4 select-none">
                Stay Connected with ISTE GMRIT
              </h2>
              <p className="text-slate-700 font-bold text-lg mb-8 max-w-xl mx-auto select-none">
                Follow our events, read our blog, and explore the gallery to see what our chapter is all about.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-iste-blue text-white font-extrabold rounded-full shadow-md shadow-blue-500/20 hover:bg-blue-600 hover:shadow-lg hover:scale-102 active:scale-98 transition-all duration-300"
                  id="cta-blog"
                >
                  Read the Blog
                </Link>
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-iste-violet text-white font-extrabold rounded-full shadow-md shadow-purple-500/20 hover:bg-purple-700 hover:shadow-lg hover:scale-102 active:scale-98 transition-all duration-300"
                  id="cta-gallery"
                >
                  View Gallery
                </Link>
              </div>
            </div>
          </ClayCard>
        </div>
      </section>

      {/* Snap Footer */}
      <div className="snap-start snap-always">
        <Footer forceRender={true} />
      </div>
    </PageTransition>
  );
};

export default Home;

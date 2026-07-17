import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import PageTransition from '../components/ui/PageTransition';
import ClayCard from '../components/ui/ClayCard';
import { motion, AnimatePresence } from 'framer-motion';

const BRANCHES = ['All', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'CENTRAL'];
const CATEGORIES = ['All', 'Workshop', 'Seminar', 'Competition', 'Cultural', 'Other'];

const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('upcoming');
  const [activeBranch, setActiveBranch] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/events', {
        params: { status: activeTab },
      });
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (err) {
      setError('Failed to load events. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleBranchClick = (branch) => {
    if (activeBranch === branch) {
      setIsPanelOpen(!isPanelOpen);
    } else {
      setActiveBranch(branch);
      setActiveCategory('All');
      setIsPanelOpen(true);
    }
  };


  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setIsPanelOpen(false);
  };

  // Client-side filtering for branch and category
  const filteredEvents = events.filter((event) => {
    if (activeBranch !== 'All' && event.branch !== activeBranch) return false;
    if (activeCategory !== 'All' && event.category !== activeCategory) return false;
    return true;
  });

  return (
    <PageTransition className="pt-16 lg:pt-20">
      <section className="bg-transparent pt-4 pb-12 lg:pt-6 lg:pb-16">
        <div className="section-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-3 animate-fade-in select-none">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-iste-blue to-sky-500">Events</span>
            </h1>
            <p className="text-slate-600 font-bold max-w-xl mx-auto text-sm sm:text-base animate-fade-in select-none">
              Workshops, seminars, competitions, and cultural events organized by ISTE GMRIT.
            </p>
          </div>

          {/* Tabs: Upcoming / Past using Clay Tab layout */}
          <div className="flex justify-center mb-6 px-4 sm:px-0 select-none">
            <div className="inline-flex bg-[#EEF1F5] rounded-clay-sm p-1.5 gap-1.5 shadow-clay-inset">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-2.5 rounded-clay-sm text-sm font-extrabold transition-all duration-300 active:scale-95 ${
                  activeTab === 'upcoming'
                    ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="tab-upcoming"
              >
                🟢 Upcoming
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-6 py-2.5 rounded-clay-sm text-sm font-extrabold transition-all duration-300 active:scale-95 ${
                  activeTab === 'past'
                    ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="tab-past"
              >
                Past Events
              </button>
            </div>
          </div>

          {/* Filters - Accordion Dropdown Panel with hover triggers and auto-minimize */}
          <div 
            className="mb-10 max-w-3xl mx-auto relative"
            onMouseLeave={() => setIsPanelOpen(false)}
          >
            {/* Branch selector buttons */}
            <div className="filter-scroll flex flex-nowrap md:flex-wrap md:justify-center gap-3 overflow-x-auto py-2 px-4 md:px-0 select-none">
              {BRANCHES.map((branch) => {
                const isActive = activeBranch === branch;
                return (
                  <button
                    key={branch}
                    onClick={() => handleBranchClick(branch)}
                    className={`px-5 py-2.5 rounded-clay-sm text-sm font-extrabold transition-all duration-300 active:scale-95 whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-pressed'
                        : 'bg-[#EEF1F5] text-slate-600 shadow-clay-sm hover:shadow-clay-md'
                    }`}
                  >
                    <span>{branch}</span>
                    {isActive && (
                      <span className="text-[10px] opacity-80">
                        {isPanelOpen ? '▲' : '▼'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Collapsible Category (Event Type) Panel */}
            <AnimatePresence>
              {isPanelOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="absolute z-20 w-full left-0 right-0 overflow-hidden mt-2 shadow-clay-md rounded-clay-md"
                >
                  <ClayCard
                    variant="inset"
                    className="p-4 flex flex-col gap-3 bg-[#EEF1F5]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        Event Category for {activeBranch === 'All' ? 'All Branches' : `${activeBranch} Branch`}
                      </span>
                      {activeCategory !== 'All' && (
                        <button
                          onClick={() => handleCategoryClick('All')}
                          className="text-xs font-bold text-iste-blue hover:underline"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 max-w-sm">
                      {CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            className={`px-5 py-2.5 rounded-clay-sm text-left text-xs font-extrabold transition-all duration-300 active:scale-95 w-full flex items-center justify-between ${
                              isActive
                                ? 'bg-iste-blue text-white shadow-clay-pressed'
                                : 'bg-[#EEF1F5] text-slate-600 shadow-clay-sm hover:shadow-clay-md'
                            }`}
                          >
                            <span>{cat}</span>
                            {isActive && (
                              <span className="text-xs font-black text-white">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </ClayCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results count */}
          <div className="mb-6 text-sm text-slate-500 font-bold px-4 sm:px-0 select-none">
            {filteredEvents.length} {activeTab} event{filteredEvents.length !== 1 ? 's' : ''}
            {activeBranch !== 'All' && ` in ${activeBranch}`}
            {activeCategory !== 'All' && ` • ${activeCategory}`}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
                <p className="text-slate-600 font-bold">Loading events...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20 flex justify-center px-4">
              <ClayCard variant="raised" className="max-w-md w-full p-8 text-center flex flex-col items-center">
                <p className="text-red-600 font-bold mb-4">{error}</p>
                <button
                  onClick={fetchEvents}
                  className="px-5 py-2.5 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all duration-300"
                >
                  Try Again
                </button>
              </ClayCard>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20 flex justify-center px-4">
              <ClayCard variant="raised" className="max-w-md w-full px-6 py-12 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#EEF1F5] shadow-clay-inset flex items-center justify-center">
                  <svg className="w-8 h-8 text-iste-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-extrabold text-slate-800">No Events Found</h3>
                <p className="text-slate-500 font-bold text-sm">
                  No {activeTab} events found for the selected filters.
                </p>
              </ClayCard>
            </div>
          ) : (
            <div className="space-y-10">
              {chunkArray(filteredEvents, 3).map((rowEvents, rowIndex, allRows) => (
                <div key={`row-${rowIndex}`} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rowEvents.map((event, colIndex) => {
                      const absIndex = rowIndex * 3 + colIndex;
                      return (
                        <div key={event._id} className="w-full">
                          <EventCard event={event} index={absIndex} />
                        </div>
                      );
                    })}
                  </div>
                  {rowIndex < allRows.length - 1 && (
                    <div className="relative flex items-center justify-center py-4 select-none">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-dashed border-slate-300" />
                      </div>
                      <div className="relative flex justify-center w-full">
                        <span className="bg-[#EEF1F5] px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          ✦ Next Batch ✦
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
};

export default Events;

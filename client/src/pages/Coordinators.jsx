import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import CoordinatorCard from '../components/CoordinatorCard';
import PageTransition from '../components/ui/PageTransition';
import ClayCard from '../components/ui/ClayCard';
import { CoordinatorCardSkeleton } from '../components/ui/SkeletonLoaders';
import { motion, AnimatePresence } from 'framer-motion';

const BRANCHES = ['All', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'CENTRAL'];
const roleMap = {
  Student: 'student_coordinator',
  'Branch Faculty': 'branch_faculty',
  'Central Faculty': 'central_faculty',
};



const Coordinators = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const activeBranch = searchParams.get('branch') || 'All';
  const activeRole = searchParams.get('role') || 'All';
  const [searchQuery, setSearchQuery] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const branchesWithPanel = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
  const hasPanel = branchesWithPanel.includes(activeBranch);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (!hasPanel) {
      setIsPanelOpen(false);
    }
  }, [activeBranch, hasPanel]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profiles');
      if (response.data.success) {
        setProfiles(response.data.data);
      }
    } catch (err) {
      setError('Failed to load coordinators. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchFilter = (branch) => {
    const params = new URLSearchParams(searchParams);
    if (branch === 'All') {
      params.delete('branch');
      params.delete('role');
      setIsPanelOpen(false);
    } else if (branch === 'CENTRAL') {
      params.set('branch', branch);
      params.delete('role');
      setIsPanelOpen(false);
    } else {
      params.set('branch', branch);
      params.delete('role'); // reset role on branch change
      if (activeBranch === branch) {
        setIsPanelOpen(!isPanelOpen);
      } else {
        setIsPanelOpen(true);
      }
    }
    setSearchParams(params);
  };


  const handleRoleSelect = (role) => {
    const params = new URLSearchParams(searchParams);
    if (role === 'All') {
      params.delete('role');
    } else {
      params.set('role', role);
    }
    setSearchParams(params);
    setIsPanelOpen(false); // auto minimize selection
  };

  // Filter profiles
  const filteredProfiles = profiles.filter((profile) => {
    const user = profile.userId || {};

    // Branch filter
    if (activeBranch !== 'All' && profile.branch !== activeBranch) return false;

    // Role filter
    if (activeRole !== 'All') {
      const mappedRole = roleMap[activeRole];
      if (mappedRole && user.role !== mappedRole) return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = profile.name?.toLowerCase().includes(query);
      const matchJntu = user.jntuNo?.toLowerCase().includes(query);
      const matchEmail = user.email?.toLowerCase().includes(query);
      const matchRole = profile.role?.toLowerCase().includes(query);
      if (!matchName && !matchJntu && !matchEmail && !matchRole) return false;
    }

    return true;
  });

  // Group: Central faculty first, then branch faculty, then students
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    const roleOrder = { central_faculty: 0, branch_faculty: 1, student_coordinator: 2 };
    const aOrder = roleOrder[a.userId?.role] ?? 3;
    const bOrder = roleOrder[b.userId?.role] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <PageTransition className="pt-2 lg:pt-20">
      <section className="bg-transparent pt-4 pb-12 lg:pt-6 lg:pb-16">
        <div className="section-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-3 animate-fade-in select-none">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-iste-blue to-sky-500">Coordinators</span>
            </h1>
            <p className="text-slate-600 font-bold max-w-xl mx-auto text-sm sm:text-base animate-fade-in select-none">
              Meet the dedicated team driving ISTE activities across all branches at GMRIT.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="max-w-2xl mx-auto px-4 sm:px-0">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A56DB] z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, JNTU No, role..."
                  className="w-full pl-12 pr-12 py-3.5 rounded-clay-sm bg-[#EEF1F5] text-slate-800 font-bold placeholder-slate-400 shadow-clay-inset focus:outline-none transition-all duration-300"
                  id="coordinator-search"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
                    aria-label="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Branch selector with hover triggers & accordion panel */}
            <div 
              className="max-w-3xl mx-auto relative"
              onMouseLeave={() => setIsPanelOpen(false)}
            >
              {/* Branch Buttons */}
              <div className="filter-scroll flex flex-nowrap md:flex-wrap md:justify-center gap-3 overflow-x-auto py-2 px-4 md:px-0 select-none">
                {BRANCHES.map((branch) => {
                  const isActive = activeBranch === branch;
                  const canShowPanel = branchesWithPanel.includes(branch);
                  return (
                    <button
                      key={branch}
                      onClick={() => handleBranchFilter(branch)}
                      className={`px-5 py-2.5 rounded-clay-sm text-sm font-extrabold transition-all duration-300 active:scale-95 whitespace-nowrap flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-pressed'
                          : 'bg-[#EEF1F5] text-slate-600 shadow-clay-sm hover:shadow-clay-md'
                      }`}
                      id={`filter-branch-${branch.toLowerCase()}`}
                    >
                      <span>{branch}</span>
                      {isActive && canShowPanel && (
                        <span className="text-[10px] opacity-80">
                          {isPanelOpen ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Collapsible Role filter inside branch dropdown */}
              <AnimatePresence>
                {isPanelOpen && hasPanel && (
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
                          Coordinator Type for {activeBranch} Branch
                        </span>
                        {activeRole !== 'All' && (
                          <button
                            onClick={() => handleRoleSelect('All')}
                            className="text-xs font-bold text-iste-blue hover:underline"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 max-w-sm">
                        {['All', 'Student', 'Branch Faculty'].map((role) => {
                          const isActive = activeRole === role;
                          return (
                            <button
                              key={role}
                              onClick={() => handleRoleSelect(role)}
                              className={`px-5 py-2.5 rounded-clay-sm text-left text-xs font-extrabold transition-all duration-300 active:scale-95 w-full flex items-center justify-between ${
                                isActive
                                  ? 'bg-iste-blue text-white shadow-clay-pressed'
                                  : 'bg-[#EEF1F5] text-slate-600 shadow-clay-sm hover:shadow-clay-md'
                              }`}
                            >
                              <span>{role}</span>
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
          </div>

          {/* Results count */}
          <div className="mb-4 text-sm text-slate-500 font-bold px-4 sm:px-0 select-none">
            Showing {sortedProfiles.length} coordinator{sortedProfiles.length !== 1 ? 's' : ''}
            {activeBranch !== 'All' && ` in ${activeBranch}`}
            {activeRole !== 'All' && ` • ${activeRole}`}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-wrap gap-5 justify-center w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <CoordinatorCardSkeleton key={i} delay={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 flex justify-center px-4">
              <ClayCard variant="raised" className="max-w-md w-full p-8 text-center flex flex-col items-center">
                <p className="text-red-600 font-bold mb-4">{error}</p>
                <button
                  onClick={fetchProfiles}
                  className="px-5 py-2.5 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all duration-300"
                >
                  Try Again
                </button>
              </ClayCard>
            </div>
          ) : sortedProfiles.length === 0 ? (
            <div className="text-center py-20 flex justify-center px-4">
              <ClayCard variant="raised" className="max-w-md w-full px-6 py-12 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#EEF1F5] shadow-clay-inset flex items-center justify-center">
                  <svg className="w-8 h-8 text-iste-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-extrabold text-slate-800">No Results Found</h3>
                <p className="text-slate-500 font-bold text-sm">
                  {searchQuery ? 'No coordinators match your search query.' : 'No coordinators found for the selected filters.'}
                </p>
                {(searchQuery || activeBranch !== 'All' || activeRole !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      handleBranchFilter('All');
                    }}
                    className="mt-2 px-5 py-2 rounded-clay-sm text-xs font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all duration-300"
                  >
                    Reset Filters
                  </button>
                )}
              </ClayCard>
            </div>
          ) : (
            <div className="flex flex-wrap gap-5 justify-center w-full">
              {sortedProfiles.map((profile, i) => (
                <CoordinatorCard key={profile._id} profile={profile} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
};

export default Coordinators;

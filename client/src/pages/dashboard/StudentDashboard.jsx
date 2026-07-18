import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import EventCard from '../../components/EventCard';
import ClayCard from '../../components/ui/ClayCard';
import BentoGrid from '../../components/ui/BentoGrid';

const StudentDashboard = () => {
  const { user, profile, userName, userBranch, setProfile, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Edit State
  const [name, setName] = useState(profile?.name || '');
  const [branch, setBranch] = useState(profile?.branch || 'CSE');
  const [role, setRole] = useState(profile?.role || '');
  const [year, setYear] = useState(profile?.year || '3rd Year');
  const [bio, setBio] = useState(profile?.bio || '');
  const [linkedin, setLinkedin] = useState(profile?.socialLinks?.linkedin || '');
  const [github, setGithub] = useState(profile?.socialLinks?.github || '');
  const [instagram, setInstagram] = useState(profile?.socialLinks?.instagram || '');
  const [previewUrl, setPreviewUrl] = useState(profile?.photoUrl || '');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

  // Branch Events State
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Hidden file input ref for instant photo change
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBranch(profile.branch || 'CSE');
      setRole(profile.role || '');
      setYear(profile.year || '3rd Year');
      setBio(profile.bio || '');
      setLinkedin(profile.socialLinks?.linkedin || '');
      setGithub(profile.socialLinks?.github || '');
      setInstagram(profile.socialLinks?.instagram || '');
      setPreviewUrl(profile.photoUrl || '');
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'events' && userBranch) {
      fetchBranchEvents();
    }
  }, [activeTab, userBranch]);

  const fetchBranchEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await api.get(`/events?branch=${userBranch}`);
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching branch events:', err);
      toast.error('Failed to load events.');
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Instant photo change handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile photo must be under 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    const loadingToast = toast.loading('Uploading profile picture...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.patch(`/profiles/${profile._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setProfile(response.data.data);
        setPreviewUrl(response.data.data.photoUrl);
        await checkAuth(); // Refresh Zustand store session info
        toast.success('Profile photo updated instantly!', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload photo.', { id: loadingToast });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage({ type: '', text: '' });
    const savingToast = toast.loading('Saving profile changes...');

    try {
      const updatePayload = {
        name: name.trim(),
        branch: branch,
        role: role.trim(),
        year: year,
        bio: bio.trim(),
        socialLinks: {
          linkedin: linkedin.trim(),
          github: github.trim(),
          instagram: instagram.trim(),
        }
      };

      const response = await api.patch(`/profiles/${profile._id}`, updatePayload);

      if (response.data.success) {
        setProfile(response.data.data);
        await checkAuth(); // Refresh session data to sync user branches
        setUpdateMessage({ type: 'success', text: 'Profile details saved successfully!' });
        toast.success('Profile details saved!', { id: savingToast });
        setTimeout(() => setActiveTab('profile'), 1500);
      }
    } catch (err) {
      console.error(err);
      const errorText = err.response?.data?.message || 'Failed to update profile.';
      setUpdateMessage({ type: 'error', text: errorText });
      toast.error(errorText, { id: savingToast });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="pt-2 lg:pt-20 pb-28 lg:pb-0 min-h-screen bg-[#EEF1F5] text-slate-800 transition-colors duration-300">
      <section className="py-10 lg:py-16">
        <div className="section-container max-w-5xl px-4 mx-auto">
          
          {/* Cover Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-[#132242] to-slate-900 text-white rounded-clay-md p-8 md:p-10 shadow-clay-md mb-10 select-none">
            {/* Drifting blur decorations inside banner */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute w-72 h-72 rounded-full bg-iste-blue blur-3xl -top-20 -left-20" />
              <div className="absolute w-72 h-72 rounded-full bg-iste-teal blur-3xl -bottom-20 -right-20" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-iste-teal text-xs font-black mb-3 border border-white/10">
                  <span className="w-2 h-2 bg-iste-teal rounded-full animate-pulse" />
                  ISTE Coordinator Hub
                </span>
                <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-white leading-none">
                  Student Dashboard
                </h1>
                <p className="text-slate-400 font-bold mt-2 text-sm max-w-md">
                  Keep your profile details up to date, write interactive blogs, and view events inside your branch.
                </p>
              </div>

              {/* Quick Profile Overview on Banner */}
              <div className="flex items-center gap-4 bg-white/[0.04] backdrop-blur-md rounded-clay-sm p-4 border border-white/5">
                <div className="w-14 h-14 rounded-clay-sm overflow-hidden bg-white/10 flex items-center justify-center p-1 border border-white/10 shadow-md">
                  {profile?.photoUrl ? (
                    <img src={profile.photoUrl} alt={userName} className="w-full h-full object-cover rounded-clay-sm" />
                  ) : (
                    <span className="text-lg font-black">{userName?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100 truncate max-w-[150px]">{userName}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{profile?.role || 'Coordinator'}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    <span className="px-1.5 py-0.5 text-[8px] font-black rounded bg-iste-blue/20 text-blue-300 uppercase tracking-widest">{userBranch}</span>
                    <span className="px-1.5 py-0.5 text-[8px] font-black rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-widest">{profile?.year || 'Coordinator'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs bar */}
          <div className="flex items-center justify-between gap-4 mb-8 w-full overflow-hidden">
            <div className="flex w-full bg-[#EEF1F5] rounded-clay-sm p-1.5 gap-1.5 shadow-clay-inset flex-nowrap overflow-x-auto scrollbar-hide select-none">
              <button
                onClick={() => { setActiveTab('profile'); setUpdateMessage({ type: '', text: '' }); }}
                className={`flex-grow md:flex-grow-0 px-5 py-2.5 rounded-clay-sm text-sm font-extrabold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                <span>👤</span> Profile Overview
              </button>
              <button
                onClick={() => { setActiveTab('edit'); setUpdateMessage({ type: '', text: '' }); }}
                className={`flex-grow md:flex-grow-0 px-5 py-2.5 rounded-clay-sm text-sm font-extrabold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === 'edit'
                    ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                <span>⚙️</span> Edit Details
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`flex-grow md:flex-grow-0 px-5 py-2.5 rounded-clay-sm text-sm font-extrabold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === 'events'
                    ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md'
                    : 'text-slate-550 hover:text-slate-850'
                }`}
              >
                <span>📅</span> Branch Events
              </button>
            </div>
          </div>

          {/* Hidden input for instant Avatar uploader */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Left side details card */}
                <ClayCard variant="raised" className="p-6 lg:col-span-1 flex flex-col items-center text-center">
                  
                  {/* Interactive Avatar Container with Hover Overlay */}
                  <div
                    onClick={handleAvatarClick}
                    className="group relative w-36 h-36 rounded-clay-md bg-[#EEF1F5] flex items-center justify-center text-iste-blue text-4xl font-black shadow-clay-inset overflow-hidden mb-4 p-2 cursor-pointer select-none"
                    title="Click to instantly change photo"
                  >
                    <div className="w-full h-full rounded-clay-sm overflow-hidden shadow-clay-inset bg-white flex items-center justify-center relative">
                      {profile?.photoUrl ? (
                        <img src={profile.photoUrl} alt={userName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <span className="group-hover:scale-105 transition-transform duration-500">
                          {userName?.charAt(0)?.toUpperCase() || 'S'}
                        </span>
                      )}

                      {/* Camera icon overlay */}
                      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-300">
                        <svg className="w-6 h-6 text-white mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-wider">Change Photo</span>
                      </div>

                      {/* circular loader */}
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center text-iste-blue">
                          <div className="w-8 h-8 border-3 border-iste-blue/30 border-t-iste-blue rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl font-display font-black text-slate-800 leading-tight">
                    {userName}
                  </h2>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1 select-none">
                    {profile?.role || 'Student Coordinator'}
                  </p>

                  <div className="flex gap-2.5 mt-4 select-none">
                    <span className="px-3 py-1 text-xs font-black rounded-clay-sm bg-[#EEF1F5] text-iste-blue shadow-clay-sm uppercase tracking-wide">
                      {userBranch} Branch
                    </span>
                    <span className="px-3 py-1 text-xs font-black rounded-clay-sm bg-[#EEF1F5] text-emerald-600 shadow-clay-sm uppercase tracking-wide">
                      {profile?.year || 'Coordinator'}
                    </span>
                  </div>

                  {/* Profile Metadata */}
                  <div className="w-full mt-8 space-y-4 text-xs font-extrabold text-slate-600 border-t border-slate-200/50 pt-6 select-none">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-slate-450 tracking-wider uppercase">JNTU Number</span>
                      <span className="font-mono text-slate-800 text-sm font-black bg-white/50 px-2 py-0.5 rounded shadow-sm border border-slate-200/20">{user?.jntuNo || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-slate-450 tracking-wider uppercase">User Status</span>
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-0.5 rounded-full border border-emerald-100">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Active Coordinator
                      </span>
                    </div>
                  </div>
                </ClayCard>

                {/* Right side Bio & Social Links detail card */}
                <ClayCard variant="raised" className="p-6 lg:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-lg font-display font-black text-slate-800 mb-3 select-none flex items-center gap-2">
                      <span>📄</span> About Me
                    </h3>
                    <p className="text-slate-650 leading-relaxed bg-[#EEF1F5] p-5 rounded-clay-sm shadow-clay-inset font-semibold min-h-[140px] text-sm whitespace-pre-line border border-slate-200/10">
                      {profile?.bio || "No bio written yet! Head over to the 'Edit Details' tab to introduce yourself, mention your tech interests, and showcase your skills."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-display font-black text-slate-800 mb-4 select-none flex items-center gap-2">
                      <span>🔗</span> Social Connect
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {profile?.socialLinks?.linkedin ? (
                        <a
                          href={profile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3.5 p-4 rounded-clay-sm bg-[#EEF1F5] text-blue-700 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all font-extrabold hover:text-blue-800"
                        >
                          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" /></svg>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-black">LinkedIn</span>
                            <span className="text-xs truncate">Connect</span>
                          </div>
                        </a>
                      ) : (
                        <div className="p-4 rounded-clay-sm bg-[#EEF1F5] text-slate-400 font-extrabold text-xs shadow-clay-inset select-none flex items-center gap-3">
                          <svg className="w-5 h-5 flex-shrink-0 opacity-40" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" /></svg>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest text-slate-400">LinkedIn</span>
                            <span className="text-xs">Not Configured</span>
                          </div>
                        </div>
                      )}

                      {profile?.socialLinks?.github ? (
                        <a
                          href={profile.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3.5 p-4 rounded-clay-sm bg-[#EEF1F5] text-slate-800 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all font-extrabold hover:text-slate-900"
                        >
                          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-black">GitHub</span>
                            <span className="text-xs truncate">View Code</span>
                          </div>
                        </a>
                      ) : (
                        <div className="p-4 rounded-clay-sm bg-[#EEF1F5] text-slate-400 font-extrabold text-xs shadow-clay-inset select-none flex items-center gap-3">
                          <svg className="w-5 h-5 flex-shrink-0 opacity-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest text-slate-400">GitHub</span>
                            <span className="text-xs">Not Configured</span>
                          </div>
                        </div>
                      )}

                      {profile?.socialLinks?.instagram ? (
                        <a
                          href={profile.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3.5 p-4 rounded-clay-sm bg-[#EEF1F5] text-pink-700 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all font-extrabold hover:text-pink-800"
                        >
                          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-black">Instagram</span>
                            <span className="text-xs truncate">Follow</span>
                          </div>
                        </a>
                      ) : (
                        <div className="p-4 rounded-clay-sm bg-[#EEF1F5] text-slate-400 font-extrabold text-xs shadow-clay-inset select-none flex items-center gap-3">
                          <svg className="w-5 h-5 flex-shrink-0 opacity-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest text-slate-400">Instagram</span>
                            <span className="text-xs">Not Configured</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ClayCard>
              </motion.div>
            )}

            {activeTab === 'edit' && (
              <motion.div
                key="edit-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto"
              >
                <ClayCard variant="raised" className="p-6 md:p-8">
                  <h2 className="text-2xl font-display font-black text-slate-800 mb-2 select-none">
                    Update Profile Info
                  </h2>
                  <p className="text-xs font-extrabold text-slate-400 mb-6">
                    Customize your coordinator card. Fill in details to show on the public coordinator portal.
                  </p>

                  {updateMessage.text && (
                    <div
                      className={`p-4 rounded-clay-sm mb-6 text-sm font-bold flex items-center gap-2.5 animate-slide-down ${
                        updateMessage.type === 'success'
                          ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100'
                          : 'bg-red-50 text-red-700 shadow-sm border border-red-100'
                      }`}
                    >
                      <span>{updateMessage.type === 'success' ? '✅' : '⚠️'}</span>
                      <span>{updateMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    
                    {/* Visual Photo Upload Banner Helper */}
                    <div className="bg-[#EEF1F5] p-4 rounded-clay-sm shadow-clay-inset flex items-center justify-between border border-slate-200/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-clay-sm overflow-hidden bg-white shadow-clay-sm flex items-center justify-center p-0.5 border border-slate-200/20">
                          {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-clay-sm" />
                          ) : (
                            <span className="text-lg font-black">{name?.charAt(0) || 'S'}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-700">Instant Avatar Updates</h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">Change your image anytime on the Overview tab.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="py-1.5 px-3 rounded bg-white text-iste-blue text-[10px] font-black uppercase tracking-wider shadow-clay-sm hover:shadow-clay-md transition-shadow active:shadow-clay-pressed border border-slate-200/10"
                      >
                        Upload Photo
                      </button>
                    </div>

                    {/* Side-by-Side: Name & Role Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="space-y-2 group">
                        <label htmlFor="name" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 group-focus-within:text-iste-blue transition-colors duration-300">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-iste-blue transition-colors duration-300 pointer-events-none select-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-12 pr-4 h-[50px] bg-[#EEF1F5] rounded-clay-sm text-slate-900 placeholder-slate-400/80 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 border-transparent focus:border-iste-blue/20"
                            placeholder="e.g. SAI GOPI GUTHA"
                            required
                            disabled={isUpdating}
                          />
                        </div>
                      </div>

                      {/* Role Title */}
                      <div className="space-y-2 group">
                        <label htmlFor="role" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 group-focus-within:text-iste-blue transition-colors duration-300">
                          ISTE Role Title
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-iste-blue transition-colors duration-300 pointer-events-none select-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full pl-12 pr-4 h-[50px] bg-[#EEF1F5] rounded-clay-sm text-slate-900 placeholder-slate-400/80 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 border-transparent focus:border-iste-blue/20"
                            placeholder="e.g. Technical Lead"
                            required
                            disabled={isUpdating}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Side-by-Side: Branch Dropdown & Year Dropdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Branch Dropdown */}
                      <div className="space-y-2 group">
                        <label htmlFor="branch" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 group-focus-within:text-iste-blue transition-colors duration-300">
                          Branch Department
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-iste-blue transition-colors duration-300 pointer-events-none select-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <select
                            id="branch"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            className="w-full pl-12 pr-10 h-[50px] bg-[#EEF1F5] rounded-clay-sm text-slate-900 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 border-transparent focus:border-iste-blue/20 appearance-none cursor-pointer"
                          >
                            <option value="CSE">CSE (Computer Science & Eng)</option>
                            <option value="ECE">ECE (Electronics & Comm Eng)</option>
                            <option value="EEE">EEE (Electrical & Elect Eng)</option>
                            <option value="MECH">MECH (Mechanical Eng)</option>
                            <option value="CIVIL">CIVIL (Civil Eng)</option>
                            <option value="IT">IT (Information Technology)</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Year of study Dropdown */}
                      <div className="space-y-2 group">
                        <label htmlFor="year" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 group-focus-within:text-iste-blue transition-colors duration-300">
                          Year of Study
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-iste-blue transition-colors duration-300 pointer-events-none select-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <select
                            id="year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full pl-12 pr-10 h-[50px] bg-[#EEF1F5] rounded-clay-sm text-slate-900 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 border-transparent focus:border-iste-blue/20 appearance-none cursor-pointer"
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2 group">
                      <label htmlFor="bio" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 group-focus-within:text-iste-blue transition-colors duration-300">
                        Short Bio
                      </label>
                      <div className="relative">
                        <textarea
                          id="bio"
                          rows={4}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Write a brief bio about yourself, interests, tech stack, etc..."
                          className="w-full p-4 bg-[#EEF1F5] rounded-clay-sm text-slate-900 placeholder-slate-400/80 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 border-transparent focus:border-iste-blue/20 h-32 resize-none"
                          maxLength={500}
                        />
                        <div className="text-[10px] text-slate-400 font-extrabold text-right mt-1 select-none">
                          {bio.length}/500 characters
                        </div>
                      </div>
                    </div>

                    {/* Social URLs */}
                    <div className="space-y-4 pt-4 border-t border-slate-200/50">
                      <h3 className="text-base font-display font-black text-slate-800 mb-3 select-none flex items-center gap-2">
                        <span>🔗</span> Social Link Settings
                      </h3>
                      
                      <div className="grid grid-cols-1 gap-5">
                        {/* LinkedIn */}
                        <div className="space-y-2 group">
                          <label htmlFor="linkedin" className="block text-xs font-extrabold uppercase tracking-wider text-slate-450 group-focus-within:text-iste-blue transition-colors duration-300">
                            LinkedIn Profile URL
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-iste-blue transition-colors duration-300 pointer-events-none select-none">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" /></svg>
                            </div>
                            <input
                              type="url"
                              id="linkedin"
                              value={linkedin}
                              onChange={(e) => setLinkedin(e.target.value)}
                              placeholder="https://linkedin.com/in/yourusername"
                              className="w-full pl-12 pr-4 h-[50px] bg-[#EEF1F5] rounded-clay-sm text-slate-900 placeholder-slate-400/80 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 border-transparent focus:border-iste-blue/20"
                              disabled={isUpdating}
                            />
                          </div>
                        </div>

                        {/* GitHub */}
                        <div className="space-y-2 group">
                          <label htmlFor="github" className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 group-focus-within:text-iste-blue transition-colors duration-300">
                            GitHub Profile URL
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-iste-blue transition-colors duration-300 pointer-events-none select-none">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            </div>
                            <input
                              type="url"
                              id="github"
                              value={github}
                              onChange={(e) => setGithub(e.target.value)}
                              placeholder="https://github.com/yourusername"
                              className="w-full pl-12 pr-4 h-[50px] bg-[#EEF1F5] rounded-clay-sm text-slate-900 placeholder-slate-400/80 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 border-transparent focus:border-iste-blue/20"
                              disabled={isUpdating}
                            />
                          </div>
                        </div>

                        {/* Instagram */}
                        <div className="space-y-2 group">
                          <label htmlFor="instagram" className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 group-focus-within:text-iste-blue transition-colors duration-300">
                            Instagram Profile URL
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-iste-blue transition-colors duration-300 pointer-events-none select-none">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                            </div>
                            <input
                              type="url"
                              id="instagram"
                              value={instagram}
                              onChange={(e) => setInstagram(e.target.value)}
                              placeholder="https://instagram.com/yourusername"
                              className="w-full pl-12 pr-4 h-[50px] bg-[#EEF1F5] rounded-clay-sm text-slate-900 placeholder-slate-400/80 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 border-transparent focus:border-iste-blue/20"
                              disabled={isUpdating}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-4 pt-6 border-t border-slate-200/50">
                      <motion.button
                        type="submit"
                        disabled={isUpdating}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        className="flex-grow py-3 h-[50px] rounded-clay-sm text-sm font-extrabold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isUpdating ? (
                          <>
                            <div className="w-5 h-5 border-2.5 border-iste-blue/30 border-t-iste-blue rounded-full animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </motion.button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('profile');
                          setUpdateMessage({ type: '', text: '' });
                        }}
                        className="px-6 py-3 h-[50px] rounded-clay-sm text-sm font-extrabold bg-[#EEF1F5] text-slate-500 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-[0.97] transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </ClayCard>
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div
                key="events-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-display font-black text-slate-800 select-none px-1">
                  Events in {userBranch} Branch
                </h2>

                {loadingEvents ? (
                  <div className="flex justify-center py-20 animate-fade-in">
                    <div className="w-12 h-12 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
                  </div>
                ) : events.length === 0 ? (
                  <ClayCard variant="raised" className="p-10 text-center text-slate-500 font-bold select-none animate-fade-in">
                    No events have been posted for your branch yet.
                  </ClayCard>
                ) : (
                  <BentoGrid className="gap-6">
                    {events.map((event) => (
                      <div key={event._id} className="col-span-12 sm:col-span-6 lg:col-span-4">
                        <EventCard event={event} />
                      </div>
                    ))}
                  </BentoGrid>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;

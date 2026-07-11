import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import EventCard from '../../components/EventCard';
import Modal from '../../components/ui/Modal';
import FileUpload from '../../components/ui/FileUpload';
import ClayCard from '../../components/ui/ClayCard';
import BentoGrid from '../../components/ui/BentoGrid';

const BranchFacultyDashboard = () => {
  const { user, profile, userName, userBranch, setProfile, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Faculty Profile Edit State
  const [name, setName] = useState(profile?.name || '');
  const [designation, setDesignation] = useState(profile?.designation || '');
  const [branch, setBranch] = useState(profile?.branch || 'CSE');
  const [role, setRole] = useState(profile?.role || 'Faculty Coordinator');
  const [bio, setBio] = useState(profile?.bio || '');
  const [linkedin, setLinkedin] = useState(profile?.socialLinks?.linkedin || '');
  const [github, setGithub] = useState(profile?.socialLinks?.github || '');
  const [instagram, setInstagram] = useState(profile?.socialLinks?.instagram || '');
  const [previewUrl, setPreviewUrl] = useState(profile?.photoUrl || '');
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Stats
  const [stats, setStats] = useState({ coordinators: 0, upcomingEvents: 0, albums: 0 });

  // Coordinators List
  const [coordinators, setCoordinators] = useState([]);
  const [loadingCoords, setLoadingCoords] = useState(true);

  // Events List
  const [branchEvents, setBranchEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Albums List
  const [albums, setAlbums] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  // Modals & Form states for Coordinators / Events / Gallery
  const [showCoordModal, setShowCoordModal] = useState(false);
  const [coordForm, setCoordForm] = useState({
    name: '',
    jntuNo: '',
    password: '',
    isteRole: '',
    year: '1st Year',
    bio: '',
    linkedin: '',
    github: '',
    instagram: ''
  });
  const [coordFile, setCoordFile] = useState(null);
  const [editingCoordId, setEditingCoordId] = useState(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    category: 'Workshop'
  });
  const [eventFile, setEventFile] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);

  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [albumForm, setAlbumForm] = useState({
    albumName: '',
    eventId: ''
  });
  const [albumFiles, setAlbumFiles] = useState([]);

  // Add photos state
  const [showAddPhotosModal, setShowAddPhotosModal] = useState(false);
  const [selectedAlbumForUpload, setSelectedAlbumForUpload] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isSubmittingPhotos, setIsSubmittingPhotos] = useState(false);

  // Alerts/Messages
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hidden avatar input ref
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setDesignation(profile.designation || '');
      setBranch(profile.branch || 'CSE');
      setRole(profile.role || 'Faculty Coordinator');
      setBio(profile.bio || '');
      setLinkedin(profile.socialLinks?.linkedin || '');
      setGithub(profile.socialLinks?.github || '');
      setInstagram(profile.socialLinks?.instagram || '');
      setPreviewUrl(profile.photoUrl || '');
    }
  }, [profile]);

  useEffect(() => {
    fetchStats();
    fetchCoordinators();
    fetchEvents();
    fetchAlbums();
  }, [userBranch]);

  const fetchStats = async () => {
    try {
      const [coordsRes, eventsRes, galleryRes] = await Promise.all([
        api.get(`/profiles?branch=${userBranch}&role=student_coordinator`),
        api.get(`/events?branch=${userBranch}`),
        api.get(`/gallery?branch=${userBranch}`)
      ]);
      
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const upcoming = eventsRes.data.data.filter(e => new Date(e.date) >= now).length;

      setStats({
        coordinators: coordsRes.data.data.length,
        upcomingEvents: upcoming,
        albums: galleryRes.data.data.length
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchCoordinators = async () => {
    try {
      setLoadingCoords(true);
      const response = await api.get(`/users?branch=${userBranch}&role=student_coordinator`);
      if (response.data.success) {
        setCoordinators(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCoords(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await api.get(`/events?branch=${userBranch}`);
      if (response.data.success) {
        setBranchEvents(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      setLoadingAlbums(true);
      const response = await api.get(`/gallery?branch=${userBranch}`);
      if (response.data.success) {
        setAlbums(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAlbums(false);
    }
  };

  // ──────────────────────────────────────────
  // Faculty Profile Updates
  // ──────────────────────────────────────────
  const handleAvatarClick = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

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
        await checkAuth(); // Sync store session parameters (including user branch)
        toast.success('Profile photo updated instantly!', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload photo.', { id: loadingToast });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleFacultyProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const savingToast = toast.loading('Saving profile changes...');

    try {
      const updatePayload = {
        name: name.trim(),
        branch: branch,
        designation: designation.trim(),
        role: role.trim(),
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
        await checkAuth(); // Sync Zustand session parameters
        toast.success('Faculty profile updated successfully!', { id: savingToast });
        setTimeout(() => setActiveTab('profile'), 1500);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile.', { id: savingToast });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // ──────────────────────────────────────────
  // Coordinator CRUD
  // ──────────────────────────────────────────
  const handleCoordSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('role', 'student_coordinator');
      formData.append('branch', userBranch);
      formData.append('name', coordForm.name);
      formData.append('isteRole', coordForm.isteRole);
      formData.append('year', coordForm.year);
      formData.append('bio', coordForm.bio);
      formData.append('socialLinks[linkedin]', coordForm.linkedin);
      formData.append('socialLinks[github]', coordForm.github);
      formData.append('socialLinks[instagram]', coordForm.instagram);
      if (coordFile) {
        formData.append('image', coordFile);
      }

      if (editingCoordId) {
        // Edit Profile
        const coordToEdit = coordinators.find(c => c._id === editingCoordId);
        const profileId = coordToEdit?.profileId?._id;

        if (!profileId) throw new Error('Profile not found.');

        const response = await api.patch(`/profiles/${profileId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          toast.success('Coordinator profile updated!');
          fetchCoordinators();
          setShowCoordModal(false);
        }
      } else {
        // Create User + Profile
        formData.append('jntuNo', coordForm.jntuNo);
        formData.append('password', coordForm.password);

        const response = await api.post('/users/assign-credentials', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          toast.success('Coordinator account created!');
          fetchCoordinators();
          fetchStats();
          setShowCoordModal(false);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCoordActive = async (userId) => {
    try {
      const response = await api.patch(`/users/${userId}/toggle-active`);
      if (response.data.success) {
        toast.success('Coordinator status toggled.');
        fetchCoordinators();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCoord = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this coordinator? This will remove their user account and profile.')) return;
    try {
      const response = await api.delete(`/users/${userId}`);
      if (response.data.success) {
        toast.success('Coordinator account deleted.');
        fetchCoordinators();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddCoord = () => {
    setEditingCoordId(null);
    setCoordForm({
      name: '',
      jntuNo: '',
      password: '',
      isteRole: '',
      year: '1st Year',
      bio: '',
      linkedin: '',
      github: '',
      instagram: ''
    });
    setCoordFile(null);
    setShowCoordModal(true);
    setMessage({ type: '', text: '' });
  };

  const openEditCoord = (coord) => {
    setEditingCoordId(coord._id);
    setCoordForm({
      name: coord.profileId?.name || '',
      jntuNo: coord.jntuNo || '',
      password: '', 
      isteRole: coord.profileId?.role || '',
      year: coord.profileId?.year || '1st Year',
      bio: coord.profileId?.bio || '',
      linkedin: coord.profileId?.socialLinks?.linkedin || '',
      github: coord.profileId?.socialLinks?.github || '',
      instagram: coord.profileId?.socialLinks?.instagram || ''
    });
    setCoordFile(null);
    setShowCoordModal(true);
    setMessage({ type: '', text: '' });
  };

  // ──────────────────────────────────────────
  // Event CRUD
  // ──────────────────────────────────────────
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('title', eventForm.title);
      formData.append('description', eventForm.description);
      formData.append('date', eventForm.date);
      formData.append('time', eventForm.time);
      formData.append('venue', eventForm.venue);
      formData.append('category', eventForm.category);
      formData.append('branch', userBranch);

      if (eventFile) {
        formData.append('image', eventFile);
      }

      if (editingEventId) {
        const response = await api.patch(`/events/${editingEventId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          toast.success('Event updated successfully.');
          fetchEvents();
          setShowEventModal(false);
        }
      } else {
        const response = await api.post('/events', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          toast.success('Event posted successfully.');
          fetchEvents();
          fetchStats();
          setShowEventModal(false);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Event save failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event permanently?')) return;
    try {
      const response = await api.delete(`/events/${id}`);
      if (response.data.success) {
        toast.success('Event deleted.');
        fetchEvents();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddEvent = () => {
    setEditingEventId(null);
    setEventForm({ title: '', description: '', date: '', time: '', venue: '', category: 'Workshop' });
    setEventFile(null);
    setShowEventModal(true);
    setMessage({ type: '', text: '' });
  };

  const openEditEvent = (evt) => {
    setEditingEventId(evt._id);
    const dateFormatted = evt.date ? new Date(evt.date).toISOString().split('T')[0] : '';
    setEventForm({
      title: evt.title,
      description: evt.description,
      date: dateFormatted,
      time: evt.time,
      venue: evt.venue,
      category: evt.category
    });
    setEventFile(null);
    setShowEventModal(true);
    setMessage({ type: '', text: '' });
  };

  // ──────────────────────────────────────────
  // Gallery Management
  // ──────────────────────────────────────────
  const handleAlbumSubmit = async (e) => {
    e.preventDefault();
    if (albumFiles.length === 0) {
      toast.error('Please select at least one photo.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('albumName', albumForm.albumName);
      formData.append('branch', userBranch);
      if (albumForm.eventId) {
        formData.append('eventId', albumForm.eventId);
      }
      
      for (const file of albumFiles) {
        formData.append('photos', file);
      }

      const response = await api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('Gallery Album created!');
        fetchAlbums();
        fetchStats();
        setShowAlbumModal(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Album creation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAlbum = async (id) => {
    if (!window.confirm('Delete this album?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      toast.success('Album deleted.');
      fetchAlbums();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPhotosSubmit = async (e) => {
    e.preventDefault();
    if (uploadFiles.length === 0) {
      toast.error('Please select at least one photo.');
      return;
    }

    setIsSubmittingPhotos(true);
    const loadingToast = toast.loading('Uploading photos to album...');

    try {
      const formData = new FormData();
      for (const file of uploadFiles) {
        formData.append('photos', file);
      }

      const response = await api.patch(`/gallery/${selectedAlbumForUpload._id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success(`Added ${uploadFiles.length} photos successfully!`, { id: loadingToast });
        fetchAlbums();
        setShowAddPhotosModal(false);
        setUploadFiles([]);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add photos.', { id: loadingToast });
    } finally {
      setIsSubmittingPhotos(false);
    }
  };

  const openAddPhotosModal = (album) => {
    setSelectedAlbumForUpload(album);
    setUploadFiles([]);
    setShowAddPhotosModal(true);
  };

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-[#EEF1F5] text-slate-800 transition-colors duration-300">
      <section className="py-10 lg:py-16">
        <div className="section-container max-w-5xl px-4 mx-auto">
          
          {/* Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-[#161c2d] to-slate-900 text-white rounded-clay-md p-8 md:p-10 shadow-clay-md mb-10 select-none">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute w-72 h-72 rounded-full bg-iste-blue blur-3xl -top-20 -left-20" />
              <div className="absolute w-72 h-72 rounded-full bg-iste-violet blur-3xl -bottom-20 -right-20" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-iste-teal text-xs font-black mb-3 border border-white/10">
                  <span className="w-2 h-2 bg-iste-teal rounded-full animate-pulse" />
                  ISTE Faculty Portal
                </span>
                <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-white leading-none">
                  Faculty Board
                </h1>
                <p className="text-slate-400 font-bold mt-2 text-sm max-w-md">
                  Branch coordinators, scheduling dashboards, gallery photo uploads, and coordinator profiles configurations.
                </p>
              </div>

              {/* Quick Profile Overview */}
              {profile && (
                <div className="flex items-center gap-4 bg-white/[0.04] backdrop-blur-md rounded-clay-sm p-4 border border-white/5">
                  <div className="w-14 h-14 rounded-clay-sm overflow-hidden bg-white/10 flex items-center justify-center p-1 border border-white/10 shadow-md">
                    {profile.photoUrl ? (
                      <img src={profile.photoUrl} alt={userName} className="w-full h-full object-cover rounded-clay-sm" />
                    ) : (
                      <span className="text-lg font-black">{userName?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-100 truncate max-w-[150px]">{userName}</h3>
                    <p className="text-[10px] font-bold text-slate-450 mt-0.5">{profile.designation || 'Faculty Coordinator'}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      <span className="px-1.5 py-0.5 text-[8px] font-black rounded bg-iste-blue/20 text-blue-300 uppercase tracking-widest">{userBranch}</span>
                      <span className="px-1.5 py-0.5 text-[8px] font-black rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-widest">Faculty</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between gap-4 mb-8 w-full overflow-hidden">
            <div className="flex w-full bg-[#EEF1F5] rounded-clay-sm p-1.5 gap-1.5 shadow-clay-inset flex-nowrap overflow-x-auto scrollbar-hide select-none">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'profile', label: 'My Profile', icon: '👤' },
                { id: 'edit', label: 'Edit Profile', icon: '⚙️' },
                { id: 'coordinators', label: 'Coordinators', icon: '👥' },
                { id: 'events', label: 'Events', icon: '📅' },
                { id: 'gallery', label: 'Gallery', icon: '📸' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }); }}
                  className={`flex-grow md:flex-grow-0 px-4 py-2.5 rounded-clay-sm text-sm font-extrabold transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md'
                      : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          {message.text && (
            <div
              className={`p-4 rounded-clay-sm mb-6 text-sm font-bold flex items-center gap-2 max-w-2xl mx-auto animate-slide-down ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100'
                  : 'bg-red-50 text-red-700 shadow-sm border border-red-100'
              }`}
            >
              <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{message.text}</span>
            </div>
          )}

          {/* Hidden avatar input ref */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {/* ────────────────────────────────────────── */}
            {/* TAB: OVERVIEW                              */}
            {/* ────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <BentoGrid className="gap-6">
                  <ClayCard variant="raised" interactive={true} className="p-6 flex items-center gap-4 cursor-pointer col-span-12 sm:col-span-4" onClick={() => setActiveTab('coordinators')}>
                    <div className="w-12 h-12 rounded-clay-sm bg-[#EEF1F5] shadow-clay-inset flex items-center justify-center text-xl select-none">👥</div>
                    <div>
                      <div className="text-2xl font-black text-slate-800">{stats.coordinators}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-extrabold select-none">Student Coordinators</div>
                    </div>
                  </ClayCard>

                  <ClayCard variant="raised" interactive={true} className="p-6 flex items-center gap-4 cursor-pointer col-span-12 sm:col-span-4" onClick={() => setActiveTab('events')}>
                    <div className="w-12 h-12 rounded-clay-sm bg-[#EEF1F5] shadow-clay-inset flex items-center justify-center text-xl select-none">📅</div>
                    <div>
                      <div className="text-2xl font-black text-slate-800">{stats.upcomingEvents}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-extrabold select-none">Upcoming Events</div>
                    </div>
                  </ClayCard>

                  <ClayCard variant="raised" interactive={true} className="p-6 flex items-center gap-4 cursor-pointer col-span-12 sm:col-span-4" onClick={() => setActiveTab('gallery')}>
                    <div className="w-12 h-12 rounded-clay-sm bg-[#EEF1F5] shadow-clay-inset flex items-center justify-center text-xl select-none">📸</div>
                    <div>
                      <div className="text-2xl font-black text-slate-800">{stats.albums}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-extrabold select-none">Gallery Albums</div>
                    </div>
                  </ClayCard>
                </BentoGrid>

                {/* Coordinator activity teaser */}
                <ClayCard variant="raised" className="p-6">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 select-none">Branch Action Shortcuts</h3>
                  <div className="flex flex-wrap gap-4 select-none">
                    <button onClick={openAddCoord} className="px-5 py-2.5 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">Add Student Coordinator</button>
                    <button onClick={openAddEvent} className="px-5 py-2.5 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-slate-600 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">Schedule New Event</button>
                    <button onClick={() => setShowAlbumModal(true)} className="px-5 py-2.5 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-slate-600 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">Create Gallery Album</button>
                  </div>
                </ClayCard>
              </motion.div>
            )}

            {/* ────────────────────────────────────────── */}
            {/* TAB: PROFILE OVERVIEW                      */}
            {/* ────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Left details */}
                <ClayCard variant="raised" className="p-6 lg:col-span-1 flex flex-col items-center text-center">
                  
                  {/* Interactive Avatar Container */}
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
                          {userName?.charAt(0)?.toUpperCase() || 'F'}
                        </span>
                      )}

                      {/* Camera overlay */}
                      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-300">
                        <svg className="w-6 h-6 text-white mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-wider">Change Photo</span>
                      </div>

                      {/* Upload spinner */}
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
                    {profile?.role || 'Branch Faculty'}
                  </p>

                  <div className="flex gap-2.5 mt-4 select-none">
                    <span className="px-3 py-1 text-xs font-black rounded-clay-sm bg-[#EEF1F5] text-iste-blue shadow-clay-sm uppercase tracking-wide">
                      {userBranch} Branch
                    </span>
                    <span className="px-3 py-1 text-xs font-black rounded-clay-sm bg-[#EEF1F5] text-emerald-600 shadow-clay-sm uppercase tracking-wide">
                      Faculty
                    </span>
                  </div>

                  {/* Profile Metadata */}
                  <div className="w-full mt-8 space-y-4 text-xs font-extrabold text-slate-600 border-t border-slate-200/50 pt-6 select-none border-slate-200">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-slate-450 tracking-wider uppercase">Designation</span>
                      <span className="text-slate-800 font-black">{profile?.designation || 'Faculty Coordinator'}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-slate-450 tracking-wider uppercase">System Account</span>
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-0.5 rounded-full border border-blue-100">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        Branch Faculty
                      </span>
                    </div>
                  </div>
                </ClayCard>

                {/* Right side Bio & Social links */}
                <ClayCard variant="raised" className="p-6 lg:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-lg font-display font-black text-slate-800 mb-3 select-none flex items-center gap-2">
                      <span>📄</span> About Me
                    </h3>
                    <p className="text-slate-650 leading-relaxed bg-[#EEF1F5] p-5 rounded-clay-sm shadow-clay-inset font-semibold min-h-[140px] text-sm whitespace-pre-line border border-slate-200/10">
                      {profile?.bio || "No bio written yet! Head over to the 'Edit Details' tab to introduce yourself and describe your guidance interests."}
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
                          <span className="text-xl select-none">🔗</span>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-black">LinkedIn</span>
                            <span className="text-xs truncate">Connect</span>
                          </div>
                        </a>
                      ) : (
                        <div className="p-4 rounded-clay-sm bg-[#EEF1F5] text-slate-400 font-extrabold text-xs shadow-clay-inset select-none flex items-center gap-3">
                          <span className="text-xl opacity-40">🔗</span>
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
                          <span className="text-xl select-none">🐙</span>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-black">GitHub</span>
                            <span className="text-xs truncate">View GitHub</span>
                          </div>
                        </a>
                      ) : (
                        <div className="p-4 rounded-clay-sm bg-[#EEF1F5] text-slate-400 font-extrabold text-xs shadow-clay-inset select-none flex items-center gap-3">
                          <span className="text-xl opacity-40">🐙</span>
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
                          <span className="text-xl select-none">📸</span>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-black">Instagram</span>
                            <span className="text-xs truncate">Follow</span>
                          </div>
                        </a>
                      ) : (
                        <div className="p-4 rounded-clay-sm bg-[#EEF1F5] text-slate-400 font-extrabold text-xs shadow-clay-inset select-none flex items-center gap-3">
                          <span className="text-xl opacity-40">📸</span>
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

            {/* ────────────────────────────────────────── */}
            {/* TAB: EDIT PROFILE                          */}
            {/* ────────────────────────────────────────── */}
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
                    Customize your faculty profile card. Fill in details to show on the public coordinator portal.
                  </p>

                  <form onSubmit={handleFacultyProfileUpdate} className="space-y-6">
                    
                    {/* Photo Helper Banner */}
                    <div className="bg-[#EEF1F5] p-4 rounded-clay-sm shadow-clay-inset flex items-center justify-between border border-slate-200/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-clay-sm overflow-hidden bg-white shadow-clay-sm flex items-center justify-center p-0.5 border border-slate-200/20">
                          {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-clay-sm" />
                          ) : (
                            <span className="text-lg font-black">{name?.charAt(0) || 'F'}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-700">Instant Avatar Updates</h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">Change your image anytime on the Overview/Profile tabs.</p>
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

                    {/* Side-by-Side: Name & Designation */}
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
                            placeholder="e.g. Dr. John Doe"
                            required
                            disabled={isUpdatingProfile}
                          />
                        </div>
                      </div>

                      {/* Designation */}
                      <div className="space-y-2 group">
                        <label htmlFor="designation" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 group-focus-within:text-iste-blue transition-colors duration-300">
                          Faculty Designation
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-iste-blue transition-colors duration-300 pointer-events-none select-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="designation"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="w-full pl-12 pr-4 h-[50px] bg-[#EEF1F5] rounded-clay-sm text-slate-900 placeholder-slate-400/80 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 border-transparent focus:border-iste-blue/20"
                            placeholder="e.g. Associate Professor"
                            required
                            disabled={isUpdatingProfile}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Side-by-Side: Branch Dropdown & Title string */}
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
                            <option value="CENTRAL">CENTRAL (Central Board)</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Role Title (freeform string) */}
                      <div className="space-y-2 group">
                        <label htmlFor="role" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 group-focus-within:text-iste-blue transition-colors duration-300">
                          ISTE Faculty Role Title
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-iste-blue transition-colors duration-300 pointer-events-none select-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 00-2 2v12M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full pl-12 pr-4 h-[50px] bg-[#EEF1F5] rounded-clay-sm text-slate-900 placeholder-slate-400/80 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 border-transparent focus:border-iste-blue/20"
                            placeholder="e.g. Faculty Coordinator"
                            required
                            disabled={isUpdatingProfile}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2 group">
                      <label htmlFor="bio" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 group-focus-within:text-iste-blue transition-colors duration-300">
                        Biography
                      </label>
                      <div className="relative">
                        <textarea
                          id="bio"
                          rows={4}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Write a brief biography, department information, research guidance interests, etc..."
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
                        <span>🔗</span> Social Links
                      </h3>
                      
                      <div className="grid grid-cols-1 gap-5">
                        {/* LinkedIn */}
                        <div className="space-y-2 group">
                          <label htmlFor="linkedin" className="block text-xs font-extrabold uppercase tracking-wider text-slate-450 group-focus-within:text-iste-blue transition-colors duration-300">
                            LinkedIn Profile URL
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-iste-blue transition-colors duration-300 pointer-events-none select-none">
                              <span className="text-lg">🔗</span>
                            </div>
                            <input
                              type="url"
                              id="linkedin"
                              value={linkedin}
                              onChange={(e) => setLinkedin(e.target.value)}
                              placeholder="https://linkedin.com/in/yourusername"
                              className="w-full pl-12 pr-4 h-[50px] bg-[#EEF1F5] rounded-clay-sm text-slate-900 placeholder-slate-400/80 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 border-transparent focus:border-iste-blue/20"
                              disabled={isUpdatingProfile}
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
                              <span className="text-lg">🐙</span>
                            </div>
                            <input
                              type="url"
                              id="github"
                              value={github}
                              onChange={(e) => setGithub(e.target.value)}
                              placeholder="https://github.com/yourusername"
                              className="w-full pl-12 pr-4 h-[50px] bg-[#EEF1F5] rounded-clay-sm text-slate-900 placeholder-slate-400/80 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 border-transparent focus:border-iste-blue/20"
                              disabled={isUpdatingProfile}
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
                              <span className="text-lg">📸</span>
                            </div>
                            <input
                              type="url"
                              id="instagram"
                              value={instagram}
                              onChange={(e) => setInstagram(e.target.value)}
                              placeholder="https://instagram.com/yourusername"
                              className="w-full pl-12 pr-4 h-[50px] bg-[#EEF1F5] rounded-clay-sm text-slate-900 placeholder-slate-400/80 shadow-clay-inset focus:outline-none focus:shadow-clay-pressed transition-all duration-300 text-sm font-semibold border-2 border-transparent focus:border-iste-blue/20"
                              disabled={isUpdatingProfile}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-4 pt-6 border-t border-slate-200/50">
                      <motion.button
                        type="submit"
                        disabled={isUpdatingProfile}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        className="flex-grow py-3 h-[50px] rounded-clay-sm text-sm font-extrabold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isUpdatingProfile ? (
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

            {/* ────────────────────────────────────────── */}
            {/* TAB: COORDINATORS                          */}
            {/* ────────────────────────────────────────── */}
            {activeTab === 'coordinators' && (
              <motion.div
                key="coordinators-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center select-none px-1">
                  <h2 className="text-xl font-extrabold text-slate-800">Coordinators Board</h2>
                  <button onClick={openAddCoord} className="px-4 py-2.5 rounded-clay-sm text-xs font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">Add Coordinator</button>
                </div>

                {loadingCoords ? (
                  <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
                  </div>
                ) : coordinators.length === 0 ? (
                  <ClayCard variant="raised" className="p-10 text-center text-slate-500 font-bold select-none">No student coordinators assigned. Click 'Add Coordinator' to create one.</ClayCard>
                ) : (
                  <ClayCard variant="raised" className="p-6 overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-[#EEF1F5] text-slate-500 font-extrabold text-xs tracking-wider select-none">
                        <tr>
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">JNTU No</th>
                          <th className="px-6 py-4">ISTE Role</th>
                          <th className="px-6 py-4">Year</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right font-extrabold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/50 border-slate-200">
                        {coordinators.map((coord) => (
                          <tr key={coord._id} className="hover:bg-slate-200/20 font-bold">
                            <td className="px-6 py-4 text-slate-800">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#EEF1F5] shadow-clay-sm flex items-center justify-center font-extrabold text-iste-blue overflow-hidden p-0.5 border border-slate-200/10">
                                  {coord.profileId?.photoUrl ? (
                                    <img src={coord.profileId.photoUrl} alt="" className="w-full h-full object-cover rounded-full" />
                                  ) : (
                                    coord.profileId?.name?.charAt(0) || 'S'
                                  )}
                                </div>
                                {coord.profileId?.name || 'Unconfigured Profile'}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-800">{coord.jntuNo}</td>
                            <td className="px-6 py-4 text-slate-500">{coord.profileId?.role}</td>
                            <td className="px-6 py-4 text-slate-800">{coord.profileId?.year}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleCoordActive(coord._id)}
                                className={`px-3 py-1 rounded-clay-sm text-xs font-bold shadow-clay-sm active:shadow-clay-pressed active:scale-95 transition-all ${
                                  coord.isActive
                                    ? 'text-emerald-600'
                                    : 'text-red-500'
                                }`}
                              >
                                {coord.isActive ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right space-x-3 select-none">
                              <button onClick={() => openEditCoord(coord)} className="text-iste-blue hover:text-sky-600 font-extrabold text-xs">Edit</button>
                              <button onClick={() => deleteCoord(coord._id)} className="text-red-500 hover:text-red-700 font-extrabold text-xs">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ClayCard>
                )}
              </motion.div>
            )}

            {/* ────────────────────────────────────────── */}
            {/* TAB: EVENTS                                */}
            {/* ────────────────────────────────────────── */}
            {activeTab === 'events' && (
              <motion.div
                key="events-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center select-none px-1">
                  <h2 className="text-xl font-extrabold text-slate-800">Events Board</h2>
                  <button onClick={openAddEvent} className="px-4 py-2.5 rounded-clay-sm text-xs font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">Add Event</button>
                </div>

                {loadingEvents ? (
                  <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
                  </div>
                ) : branchEvents.length === 0 ? (
                  <ClayCard variant="raised" className="p-10 text-center text-slate-500 font-bold select-none animate-fade-in">No events listed. Click 'Add Event' to schedule one.</ClayCard>
                ) : (
                  <BentoGrid className="gap-6">
                    {branchEvents.map((evt) => (
                      <div key={evt._id} className="col-span-12 sm:col-span-6 lg:col-span-4 relative group">
                        <EventCard event={evt} />
                        <div className="absolute bottom-4 right-4 flex gap-2 z-10 select-none">
                          <button onClick={() => openEditEvent(evt)} className="px-3 py-1.5 rounded-clay-sm text-xs font-bold bg-[#EEF1F5] text-slate-700 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed transition-all">Edit</button>
                          <button onClick={() => deleteEvent(evt._id)} className="px-3 py-1.5 rounded-clay-sm text-xs font-bold bg-[#EEF1F5] text-red-650 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed transition-all">Delete</button>
                        </div>
                      </div>
                    ))}
                  </BentoGrid>
                )}
              </motion.div>
            )}

            {/* ────────────────────────────────────────── */}
            {/* TAB: GALLERY                               */}
            {/* ────────────────────────────────────────── */}
            {activeTab === 'gallery' && (
              <motion.div
                key="gallery-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center select-none px-1">
                  <h2 className="text-xl font-extrabold text-slate-800">Gallery Albums</h2>
                  <button onClick={() => { setShowAlbumModal(true); setAlbumFiles([]); setAlbumForm({ albumName: '', eventId: '' }); }} className="px-4 py-2.5 rounded-clay-sm text-xs font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">Create Album</button>
                </div>

                {loadingAlbums ? (
                  <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
                  </div>
                ) : albums.length === 0 ? (
                  <ClayCard variant="raised" className="p-10 text-center text-slate-500 font-bold select-none animate-fade-in">No gallery albums created yet.</ClayCard>
                ) : (
                  <BentoGrid className="gap-6">
                    {albums.map((album) => (
                      <div key={album._id} className="col-span-12 sm:col-span-6 lg:col-span-4 relative group">
                        <ClayCard variant="raised" className="p-4 space-y-3">
                          <div className="h-32 bg-[#EEF1F5] rounded-clay-sm shadow-clay-inset p-1.5 flex-shrink-0">
                            {album.photos?.length > 0 ? (
                              <img src={album.photos[0]} alt="" className="w-full h-full object-cover rounded-clay-sm shadow-clay-inset" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 select-none">Empty</div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 line-clamp-1">{album.albumName}</h4>
                            <p className="text-xs text-slate-400 font-bold mt-1 select-none">{album.photos?.length || 0} Photos</p>
                          </div>
                          <div className="flex justify-end mt-2 pt-2 border-t border-slate-100 select-none">
                            <button
                              onClick={() => openAddPhotosModal(album)}
                              className="text-xs font-bold text-iste-blue hover:text-sky-600 px-2.5 py-1 rounded bg-[#EEF1F5] shadow-clay-sm hover:shadow-clay-md active:scale-95 transition-all"
                            >
                              + Add Photos
                            </button>
                          </div>
                        </ClayCard>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 select-none">
                          <button onClick={() => deleteAlbum(album._id)} className="bg-[#EEF1F5] text-red-650 hover:text-red-800 rounded-full w-9 h-9 flex items-center justify-center shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </BentoGrid>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* ────────────────────────────────────────── */}
      {/* MODAL: COORDINATOR CREATE/EDIT             */}
      {/* ────────────────────────────────────────── */}
      <Modal
        isOpen={showCoordModal}
        onClose={() => setShowCoordModal(false)}
        title={editingCoordId ? 'Edit Coordinator Details' : 'Assign Student Coordinator'}
        onSubmit={handleCoordSubmit}
        submitText={editingCoordId ? 'Save Changes' : 'Assign Credentials'}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-5">
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              value={coordForm.name}
              onChange={(e) => setCoordForm({ ...coordForm, name: e.target.value })}
              placeholder="Coordinator full name"
              className="input-field"
            />
          </div>

          {!editingCoordId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">JNTU No</label>
                <input
                  type="text"
                  required
                  value={coordForm.jntuNo}
                  onChange={(e) => setCoordForm({ ...coordForm, jntuNo: e.target.value })}
                  placeholder="e.g. 24341A0574"
                  className="input-field font-mono"
                />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  value={coordForm.password}
                  onChange={(e) => setCoordForm({ ...coordForm, password: e.target.value })}
                  placeholder="Min 8 characters"
                  className="input-field"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">ISTE Role Title</label>
              <input
                type="text"
                required
                value={coordForm.isteRole}
                onChange={(e) => setCoordForm({ ...coordForm, isteRole: e.target.value })}
                placeholder="e.g. Technical Lead"
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Year</label>
              <select
                value={coordForm.year}
                onChange={(e) => setCoordForm({ ...coordForm, year: e.target.value })}
                className="input-field cursor-pointer"
              >
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Short Bio</label>
            <textarea
              value={coordForm.bio}
              onChange={(e) => setCoordForm({ ...coordForm, bio: e.target.value })}
              placeholder="Short bio details..."
              className="input-field h-24"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">LinkedIn</label>
              <input
                type="url"
                value={coordForm.linkedin}
                onChange={(e) => setCoordForm({ ...coordForm, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">GitHub</label>
              <input
                type="url"
                value={coordForm.github}
                onChange={(e) => setCoordForm({ ...coordForm, github: e.target.value })}
                placeholder="https://github.com/..."
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Instagram</label>
              <input
                type="url"
                value={coordForm.instagram}
                onChange={(e) => setCoordForm({ ...coordForm, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
                className="input-field"
              />
            </div>
          </div>

          <FileUpload 
            label="Photo (Optional)" 
            onChange={(file) => setCoordFile(file)}
          />
        </div>
      </Modal>

      {/* ────────────────────────────────────────── */}
      {/* MODAL: EVENT CREATE/EDIT                   */}
      {/* ────────────────────────────────────────── */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title={editingEventId ? 'Edit Event Details' : 'Post New Branch Event'}
        onSubmit={handleEventSubmit}
        submitText={editingEventId ? 'Save Changes' : 'Post Event'}
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="space-y-5">
          <div>
            <label className="form-label">Event Title</label>
            <input
              type="text"
              required
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              placeholder="e.g. Algocode Hackathon"
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              required
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              placeholder="Event details, structure, eligibility..."
              className="input-field h-32"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Date</label>
              <input
                type="date"
                required
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Time</label>
              <input
                type="text"
                required
                value={eventForm.time}
                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                placeholder="e.g. 10:00 AM"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Venue</label>
              <input
                type="text"
                required
                value={eventForm.venue}
                onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                placeholder="e.g. Seminar Hall 1"
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select
                value={eventForm.category}
                onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                className="input-field cursor-pointer"
              >
                <option>Workshop</option>
                <option>Seminar</option>
                <option>Competition</option>
                <option>Cultural</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <FileUpload 
            label="Poster (Optional)" 
            onChange={(file) => setEventFile(file)}
          />
        </div>
      </Modal>

      {/* ────────────────────────────────────────── */}
      {/* MODAL: GALLERY CREATE                      */}
      {/* ────────────────────────────────────────── */}
      <Modal
        isOpen={showAlbumModal}
        onClose={() => setShowAlbumModal(false)}
        title="Create Album"
        onSubmit={handleAlbumSubmit}
        submitText="Create Album"
        isSubmitting={isSubmitting}
      >
        <div className="space-y-5">
          <div>
            <label className="form-label">Album Name</label>
            <input
              type="text"
              required
              value={albumForm.albumName}
              onChange={(e) => setAlbumForm({ ...albumForm, albumName: e.target.value })}
              placeholder="e.g. Seminar on Web3 Highlights"
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">Linked Event (Optional)</label>
            <select
              value={albumForm.eventId}
              onChange={(e) => setAlbumForm({ ...albumForm, eventId: e.target.value })}
              className="input-field cursor-pointer"
            >
              <option value="">No Linked Event</option>
              {branchEvents.map(e => (
                <option key={e._id} value={e._id}>{e.title}</option>
              ))}
            </select>
            <span className="form-hint">Linking an event auto-fills the album date and context.</span>
          </div>

          <FileUpload 
            label="Photos (Select Multiple)" 
            multiple={true}
            onChange={(files) => setAlbumFiles(files)}
          />
        </div>
      </Modal>

      {/* ────────────────────────────────────────── */}
      {/* MODAL: ADD PHOTOS TO ALBUM                 */}
      {/* ────────────────────────────────────────── */}
      <Modal
        isOpen={showAddPhotosModal}
        onClose={() => setShowAddPhotosModal(false)}
        title={`Add Photos to "${selectedAlbumForUpload?.albumName}"`}
        onSubmit={handleAddPhotosSubmit}
        submitText="Upload Photos"
        isSubmitting={isSubmittingPhotos}
      >
        <div className="space-y-5">
          <FileUpload 
            label="Select Photos" 
            multiple={true}
            onChange={(files) => setUploadFiles(files)}
          />
        </div>
      </Modal>

    </div>
  );
};

export default BranchFacultyDashboard;

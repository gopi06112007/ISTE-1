import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import EventCard from '../../components/EventCard';
import RichTextEditor from '../../components/LazyRichTextEditor';
import Modal from '../../components/ui/Modal';
import FileUpload from '../../components/ui/FileUpload';
import ClayCard from '../../components/ui/ClayCard';
import BentoGrid from '../../components/ui/BentoGrid';
import { htmlToPlainText } from '../../utils/html';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'CENTRAL'];

const CentralDashboard = () => {
  const { profile, userName, userBranch, setProfile, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Central Profile Edit State
  const [name, setName] = useState(profile?.name || '');
  const [designation, setDesignation] = useState(profile?.designation || '');
  const [branch, setBranch] = useState(profile?.branch || 'CENTRAL');
  const [role, setRole] = useState(profile?.role || 'Central Coordinator');
  const [bio, setBio] = useState(profile?.bio || '');
  const [linkedin, setLinkedin] = useState(profile?.socialLinks?.linkedin || '');
  const [github, setGithub] = useState(profile?.socialLinks?.github || '');
  const [instagram, setInstagram] = useState(profile?.socialLinks?.instagram || '');
  const [previewUrl, setPreviewUrl] = useState(profile?.photoUrl || '');
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    coordinators: 0,
    events: 0,
    blogs: 0,
    albums: 0
  });

  // Data collections
  const [allCoordinators, setAllCoordinators] = useState([]);
  const [loadingCoords, setLoadingCoords] = useState(true);

  const [allEvents, setAllEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [allBlogs, setAllBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  const [allAlbums, setAllAlbums] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Forms, modal visibility & edit IDs
  const [showCoordModal, setShowCoordModal] = useState(false);
  const [coordForm, setCoordForm] = useState({
    role: 'student_coordinator',
    branch: 'CSE',
    name: '',
    jntuNo: '',
    email: '',
    password: '',
    isteRole: '',
    year: '1st Year',
    designation: '',
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
    branch: 'CENTRAL',
    category: 'Workshop'
  });
  const [eventFile, setEventFile] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'Announcement',
    content: ''
  });
  const [blogFile, setBlogFile] = useState(null);
  const [editingBlogId, setEditingBlogId] = useState(null);

  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [albumForm, setAlbumForm] = useState({
    albumName: '',
    branch: 'CENTRAL',
    eventId: ''
  });
  const [albumFiles, setAlbumFiles] = useState([]);

  // Add photos state
  const [showAddPhotosModal, setShowAddPhotosModal] = useState(false);
  const [selectedAlbumForUpload, setSelectedAlbumForUpload] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isSubmittingPhotos, setIsSubmittingPhotos] = useState(false);

  // Toast message
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hidden avatar input ref
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setDesignation(profile.designation || '');
      setBranch(profile.branch || 'CENTRAL');
      setRole(profile.role || 'Central Coordinator');
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
    fetchBlogs();
    fetchAlbums();
    fetchActivityLogs();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      const [coordsRes, eventsRes, blogsRes, galleryRes] = await Promise.all([
        api.get('/profiles'),
        api.get('/events'),
        api.get('/blogs'),
        api.get('/gallery')
      ]);

      setStats({
        coordinators: coordsRes.data.data.length,
        events: eventsRes.data.data.length,
        blogs: blogsRes.data.data.length,
        albums: galleryRes.data.data.length
      });
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const fetchCoordinators = async () => {
    try {
      setLoadingCoords(true);
      const response = await api.get('/users');
      if (response.data.success) {
        setAllCoordinators(response.data.data);
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
      const response = await api.get('/events');
      if (response.data.success) {
        setAllEvents(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoadingBlogs(true);
      const response = await api.get('/blogs');
      if (response.data.success) {
        setAllBlogs(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      setLoadingAlbums(true);
      const response = await api.get('/gallery');
      if (response.data.success) {
        setAllAlbums(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAlbums(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      setLoadingLogs(true);
      const response = await api.get('/users/activity-log');
      if (response.data.success) {
        setActivityLogs(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // ──────────────────────────────────────────
  // Central Profile Updates
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
        await checkAuth(); // Sync store session parameters
        toast.success('Profile photo updated instantly!', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload photo.', { id: loadingToast });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCentralProfileUpdate = async (e) => {
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
        await checkAuth(); // Sync Zustand store
        toast.success('Central profile updated successfully!', { id: savingToast });
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
      formData.append('role', coordForm.role);
      formData.append('branch', coordForm.branch);
      formData.append('name', coordForm.name);
      formData.append('isteRole', coordForm.isteRole);
      formData.append('bio', coordForm.bio);
      formData.append('socialLinks[linkedin]', coordForm.linkedin);
      formData.append('socialLinks[github]', coordForm.github);
      formData.append('socialLinks[instagram]', coordForm.instagram);
      if (coordForm.role === 'student_coordinator') {
        formData.append('year', coordForm.year);
      } else {
        formData.append('designation', coordForm.designation);
      }

      if (coordFile) {
        formData.append('image', coordFile);
      }

      if (editingCoordId) {
        const coordToEdit = allCoordinators.find(c => c._id === editingCoordId);
        const profileId = coordToEdit?.profileId?._id;
        if (!profileId) throw new Error('Profile Id not found.');

        const response = await api.patch(`/profiles/${profileId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          toast.success('Coordinator profile updated successfully!');
          fetchCoordinators();
          setShowCoordModal(false);
        }
      } else {
        if (coordForm.role === 'student_coordinator') {
          formData.append('jntuNo', coordForm.jntuNo);
        } else {
          formData.append('email', coordForm.email);
        }
        formData.append('password', coordForm.password);

        const response = await api.post('/users/assign-credentials', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          toast.success('Coordinator created successfully!');
          fetchCoordinators();
          fetchStats();
          fetchActivityLogs();
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
        toast.success('Coordinator status updated.');
        fetchCoordinators();
        fetchActivityLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCoord = async (userId) => {
    if (!window.confirm('Delete this coordinator user and profile permanently?')) return;
    try {
      const response = await api.delete(`/users/${userId}`);
      if (response.data.success) {
        toast.success('Coordinator account deleted.');
        fetchCoordinators();
        fetchStats();
        fetchActivityLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddCoord = () => {
    setEditingCoordId(null);
    setCoordForm({
      role: 'student_coordinator',
      branch: 'CSE',
      name: '',
      jntuNo: '',
      email: '',
      password: '',
      isteRole: '',
      year: '1st Year',
      designation: '',
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
      role: coord.role,
      branch: coord.branch,
      name: coord.profileId?.name || '',
      jntuNo: coord.jntuNo || '',
      email: coord.email || '',
      password: '',
      isteRole: coord.profileId?.role || '',
      year: coord.profileId?.year || '1st Year',
      designation: coord.profileId?.designation || '',
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
  // Event CUD
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
      formData.append('branch', eventForm.branch);
      formData.append('category', eventForm.category);
      if (eventFile) {
        formData.append('image', eventFile);
      }

      if (editingEventId) {
        const response = await api.patch(`/events/${editingEventId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          toast.success('Event updated successfully!');
          fetchEvents();
          setShowEventModal(false);
        }
      } else {
        const response = await api.post('/events', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          toast.success('Event posted successfully!');
          fetchEvents();
          fetchStats();
          fetchActivityLogs();
          setShowEventModal(false);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Event action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted.');
      fetchEvents();
      fetchStats();
      fetchActivityLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddEvent = () => {
    setEditingEventId(null);
    setEventForm({ title: '', description: '', date: '', time: '', venue: '', branch: 'CENTRAL', category: 'Workshop' });
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
      branch: evt.branch,
      category: evt.category
    });
    setEventFile(null);
    setShowEventModal(true);
    setMessage({ type: '', text: '' });
  };

  // ──────────────────────────────────────────
  // Blog CRUD
  // ──────────────────────────────────────────
  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('title', blogForm.title);
      formData.append('category', blogForm.category);
      formData.append('content', blogForm.content);
      if (blogFile) {
        formData.append('image', blogFile);
      }

      if (editingBlogId) {
        const response = await api.patch(`/blogs/${editingBlogId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          toast.success('Blog post updated successfully!');
          fetchBlogs();
          setShowBlogModal(false);
        }
      } else {
        const response = await api.post('/blogs', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          toast.success('Blog post published successfully!');
          fetchBlogs();
          fetchStats();
          fetchActivityLogs();
          setShowBlogModal(false);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Blog publish failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await api.delete(`/blogs/${id}`);
      toast.success('Blog post deleted.');
      fetchBlogs();
      fetchStats();
      fetchActivityLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddBlog = () => {
    setEditingBlogId(null);
    setBlogForm({ title: '', category: 'Announcement', content: '' });
    setBlogFile(null);
    setShowBlogModal(true);
    setMessage({ type: '', text: '' });
  };

  const openEditBlog = (blog) => {
    setEditingBlogId(blog._id);
    setBlogForm({
      title: blog.title,
      category: blog.category,
      content: blog.content
    });
    setBlogFile(null);
    setShowBlogModal(true);
    setMessage({ type: '', text: '' });
  };

  // ──────────────────────────────────────────
  // Gallery Management
  // ──────────────────────────────────────────
  const handleAlbumSubmit = async (e) => {
    e.preventDefault();
    if (albumFiles.length === 0) {
      toast.error('Please select photo files to upload.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('albumName', albumForm.albumName);
      formData.append('branch', albumForm.branch);
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
        toast.success('Album created successfully!');
        fetchAlbums();
        fetchStats();
        fetchActivityLogs();
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
    if (!window.confirm('Delete this gallery album?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      toast.success('Gallery Album deleted.');
      fetchAlbums();
      fetchStats();
      fetchActivityLogs();
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
    <div className="pt-2 lg:pt-20 min-h-screen bg-[#EEF1F5] text-slate-800 transition-colors duration-300">
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
                  ISTE Central Admin Portal
                </span>
                <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-white leading-none">
                  Central Board
                </h1>
                <p className="text-slate-400 font-bold mt-2 text-sm max-w-md">
                  Welcome back, {userName}! You have full read/write administration access across all branch coordinators, scheduled events, blog posts, and albums.
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
                    <p className="text-[10px] font-bold text-slate-450 mt-0.5">{profile.designation || 'Central Faculty Coordinator'}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      <span className="px-1.5 py-0.5 text-[8px] font-black rounded bg-iste-blue/20 text-blue-300 uppercase tracking-widest">{userBranch || 'CENTRAL'}</span>
                      <span className="px-1.5 py-0.5 text-[8px] font-black rounded bg-amber-500/20 text-amber-300 uppercase tracking-widest">Admin</span>
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
                { id: 'blogs', label: 'Blogs', icon: '📝' },
                { id: 'gallery', label: 'Gallery', icon: '📸' },
                { id: 'activity log', label: 'Activity Log', icon: '📜' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }); }}
                  className={`flex-grow xl:flex-grow-0 px-4 py-2.5 rounded-clay-sm text-sm font-extrabold transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap ${
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
                  <ClayCard variant="raised" interactive={true} className="p-6 flex items-center gap-4 cursor-pointer col-span-12 sm:col-span-6 lg:col-span-3" onClick={() => setActiveTab('coordinators')}>
                    <div className="w-12 h-12 rounded-clay-sm bg-[#EEF1F5] shadow-clay-inset flex items-center justify-center text-xl select-none">👥</div>
                    <div>
                      <div className="text-2xl font-black text-slate-800">{stats.coordinators}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-extrabold select-none">Total Coordinators</div>
                    </div>
                  </ClayCard>

                  <ClayCard variant="raised" interactive={true} className="p-6 flex items-center gap-4 cursor-pointer col-span-12 sm:col-span-6 lg:col-span-3" onClick={() => setActiveTab('events')}>
                    <div className="w-12 h-12 rounded-clay-sm bg-[#EEF1F5] shadow-clay-inset flex items-center justify-center text-xl select-none">📅</div>
                    <div>
                      <div className="text-2xl font-black text-slate-800">{stats.events}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-extrabold select-none">Scheduled Events</div>
                    </div>
                  </ClayCard>

                  <ClayCard variant="raised" interactive={true} className="p-6 flex items-center gap-4 cursor-pointer col-span-12 sm:col-span-6 lg:col-span-3" onClick={() => setActiveTab('blogs')}>
                    <div className="w-12 h-12 rounded-clay-sm bg-[#EEF1F5] shadow-clay-inset flex items-center justify-center text-xl select-none">📝</div>
                    <div>
                      <div className="text-2xl font-black text-slate-800">{stats.blogs}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-extrabold select-none">Published Blogs</div>
                    </div>
                  </ClayCard>

                  <ClayCard variant="raised" interactive={true} className="p-6 flex items-center gap-4 cursor-pointer col-span-12 sm:col-span-6 lg:col-span-3" onClick={() => setActiveTab('gallery')}>
                    <div className="w-12 h-12 rounded-clay-sm bg-[#EEF1F5] shadow-clay-inset flex items-center justify-center text-xl select-none">📸</div>
                    <div>
                      <div className="text-2xl font-black text-slate-800">{stats.albums}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-extrabold select-none">Gallery Albums</div>
                    </div>
                  </ClayCard>
                </BentoGrid>

                {/* Action shortcuts */}
                <ClayCard variant="raised" className="p-6">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 select-none">Quick Management Actions</h3>
                  <div className="flex flex-wrap gap-4 select-none">
                    <button onClick={openAddCoord} className="px-5 py-2.5 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">Assign New Credentials</button>
                    <button onClick={openAddEvent} className="px-5 py-2.5 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-slate-655 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">Post Event (Central or Branch)</button>
                    <button onClick={openAddBlog} className="px-5 py-2.5 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-slate-655 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">Create Blog Post</button>
                    <button onClick={() => { setShowAlbumModal(true); setAlbumFiles([]); }} className="px-5 py-2.5 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-slate-655 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">Create Gallery Album</button>
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
                          {userName?.charAt(0)?.toUpperCase() || 'A'}
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
                    {profile?.role || 'Central Coordinator'}
                  </p>

                  <div className="flex gap-2.5 mt-4 select-none">
                    <span className="px-3 py-1 text-xs font-black rounded-clay-sm bg-[#EEF1F5] text-iste-blue shadow-clay-sm uppercase tracking-wide">
                      {userBranch || 'CENTRAL'}
                    </span>
                    <span className="px-3 py-1 text-xs font-black rounded-clay-sm bg-[#EEF1F5] text-amber-600 shadow-clay-sm uppercase tracking-wide">
                      Admin
                    </span>
                  </div>

                  {/* Profile Metadata */}
                  <div className="w-full mt-8 space-y-4 text-xs font-extrabold text-slate-600 border-t border-slate-200/50 pt-6 select-none border-slate-200">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-slate-450 tracking-wider uppercase">Designation</span>
                      <span className="text-slate-800 font-black">{profile?.designation || 'Central Faculty Coordinator'}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-slate-450 tracking-wider uppercase">System Account</span>
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-0.5 rounded-full border border-amber-100">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                        Central Faculty
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
                    <p className="text-slate-655 leading-relaxed bg-[#EEF1F5] p-5 rounded-clay-sm shadow-clay-inset font-semibold min-h-[140px] text-sm whitespace-pre-line border border-slate-200/10">
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
                            <span className="text-xs truncate">View GitHub</span>
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
                    Customize your central coordinator profile. Fill in details to show on the public directory.
                  </p>

                  <form onSubmit={handleCentralProfileUpdate} className="space-y-6">
                    
                    {/* Photo Helper Banner */}
                    <div className="bg-[#EEF1F5] p-4 rounded-clay-sm shadow-clay-inset flex items-center justify-between border border-slate-200/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-clay-sm overflow-hidden bg-white shadow-clay-sm flex items-center justify-center p-0.5 border border-slate-200/20">
                          {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-clay-sm" />
                          ) : (
                            <span className="text-lg font-black">{name?.charAt(0) || 'A'}</span>
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
                            placeholder="e.g. Dr. Jane Smith"
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
                            placeholder="e.g. Professor & HOD"
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
                          Branch Board
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
                            <option value="CENTRAL">CENTRAL (Central Board)</option>
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

                      {/* Role Title (freeform string) */}
                      <div className="space-y-2 group">
                        <label htmlFor="role" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 group-focus-within:text-iste-blue transition-colors duration-300">
                          ISTE Role Title
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
                            placeholder="e.g. Central Coordinator"
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
                          placeholder="Write your research accomplishments, core coordination guidance notes, and student guidance message..."
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
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" /></svg>
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
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
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
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
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
                  <h2 className="text-xl font-extrabold text-slate-800">Coordinators Registry</h2>
                  <button onClick={openAddCoord} className="px-4 py-2.5 rounded-clay-sm text-xs font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">Add Coordinator</button>
                </div>

                {loadingCoords ? (
                  <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
                  </div>
                ) : allCoordinators.length === 0 ? (
                  <ClayCard variant="raised" className="p-10 text-center text-slate-500 font-bold select-none animate-fade-in">No coordinator accounts. Click 'Add Coordinator' to assign credentials.</ClayCard>
                ) : (
                  <ClayCard variant="raised" className="p-6 overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-[#EEF1F5] text-slate-500 font-extrabold text-xs tracking-wider select-none">
                        <tr>
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Branch</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Details</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right font-extrabold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/50 border-slate-200">
                        {allCoordinators.map((coord) => (
                          <tr key={coord._id} className="hover:bg-slate-200/20 font-bold">
                            <td className="px-6 py-4 text-slate-800">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#EEF1F5] shadow-clay-sm flex items-center justify-center font-extrabold text-iste-blue overflow-hidden p-0.5 flex-shrink-0 border border-slate-200/10">
                                  {coord.profileId?.photoUrl ? (
                                    <img src={coord.profileId.photoUrl} alt="" className="w-full h-full object-cover rounded-full" />
                                  ) : (
                                    coord.profileId?.name?.charAt(0) || 'U'
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span>{coord.profileId?.name || 'Unconfigured Profile'}</span>
                                  <span className="text-[10px] text-slate-450 font-extrabold mt-0.5">{coord.profileId?.role}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 text-xs font-bold rounded-clay-sm bg-[#EEF1F5] text-iste-blue shadow-clay-sm uppercase">{coord.branch}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 text-xs font-bold rounded-clay-sm bg-[#EEF1F5] shadow-clay-sm ${
                                coord.role === 'central_faculty' ? 'text-orange-600' :
                                coord.role === 'branch_faculty' ? 'text-blue-600' :
                                'text-emerald-600'
                              }`}>
                                {coord.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs">
                              {coord.role === 'student_coordinator' ? (
                                <span>JNTU: <strong className="font-mono text-slate-800">{coord.jntuNo}</strong> ({coord.profileId?.year})</span>
                              ) : (
                                <span>Email: <strong className="text-slate-800">{coord.email}</strong></span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleCoordActive(coord._id)}
                                disabled={coord.role === 'central_faculty'}
                                className={`px-3 py-1 rounded-clay-sm text-xs font-bold shadow-clay-sm active:shadow-clay-pressed active:scale-95 transition-all ${
                                  coord.isActive
                                    ? 'text-emerald-600'
                                    : 'text-red-500'
                                } disabled:opacity-50`}
                              >
                                {coord.isActive ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right space-x-3 select-none">
                              <button onClick={() => openEditCoord(coord)} className="text-iste-blue hover:text-sky-600 font-extrabold text-xs">Edit</button>
                              <button
                                onClick={() => deleteCoord(coord._id)}
                                disabled={coord.role === 'central_faculty'}
                                className="text-red-550 hover:text-red-700 font-extrabold text-xs disabled:opacity-50"
                              >
                                Delete
                              </button>
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
                  <h2 className="text-xl font-extrabold text-slate-800">All Events</h2>
                  <button onClick={openAddEvent} className="px-4 py-2.5 rounded-clay-sm text-xs font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">Post Event</button>
                </div>

                {loadingEvents ? (
                  <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
                  </div>
                ) : allEvents.length === 0 ? (
                  <ClayCard variant="raised" className="p-10 text-center text-slate-500 font-bold select-none animate-fade-in">No events listed. Click 'Post Event' to add one.</ClayCard>
                ) : (
                  <BentoGrid className="gap-6">
                    {allEvents.map((evt) => (
                      <div key={evt._id} className="col-span-12 sm:col-span-6 lg:col-span-4 relative group">
                        <EventCard event={evt} />
                        <div className="absolute bottom-4 right-4 flex gap-2 z-10 select-none">
                          <button onClick={() => openEditEvent(evt)} className="px-3 py-1.5 rounded-clay-sm text-xs font-bold bg-[#EEF1F5] text-slate-700 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed transition-all">Edit</button>
                          <button onClick={() => deleteEvent(evt._id)} className="px-3 py-1.5 rounded-clay-sm text-xs font-bold bg-[#EEF1F5] text-red-655 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed transition-all">Delete</button>
                        </div>
                      </div>
                    ))}
                  </BentoGrid>
                )}
              </motion.div>
            )}

            {/* ────────────────────────────────────────── */}
            {/* TAB: BLOGS                                 */}
            {/* ────────────────────────────────────────── */}
            {activeTab === 'blogs' && (
              <motion.div
                key="blogs-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center select-none px-1">
                  <h2 className="text-xl font-extrabold text-slate-800">Blog Manager</h2>
                  <button onClick={openAddBlog} className="px-4 py-2.5 rounded-clay-sm text-xs font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">New Blog Post</button>
                </div>

                {loadingBlogs ? (
                  <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
                  </div>
                ) : allBlogs.length === 0 ? (
                  <ClayCard variant="raised" className="p-10 text-center text-slate-500 font-bold select-none animate-fade-in">No blog posts published yet.</ClayCard>
                ) : (
                  <BentoGrid className="gap-6">
                    {allBlogs.map((blog) => (
                      <div key={blog._id} className="col-span-12 md:col-span-6 animate-fade-in">
                        <ClayCard variant="raised" className="p-5 flex flex-col justify-between h-56 relative group">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-clay-sm bg-[#EEF1F5] text-iste-blue shadow-clay-sm w-fit select-none">{blog.category}</span>
                              <span className="text-xs text-slate-400 font-bold select-none">{new Date(blog.publishedAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-base line-clamp-2">{blog.title}</h4>
                            <p className="text-xs text-slate-500 font-semibold mt-2 line-clamp-2">
                              {htmlToPlainText(blog.content) || 'No summary available.'}
                            </p>
                          </div>
                          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-200/50 select-none border-slate-200">
                            <button onClick={() => openEditBlog(blog)} className="text-xs font-bold text-iste-blue hover:text-sky-600">Edit</button>
                            <button onClick={() => deleteBlog(blog._id)} className="text-xs font-bold text-red-500 hover:text-red-700">Delete</button>
                          </div>
                        </ClayCard>
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
                  <h2 className="text-xl font-extrabold text-slate-800">Gallery Albums (All Branches)</h2>
                  <button onClick={() => { setShowAlbumModal(true); setAlbumFiles([]); }} className="px-4 py-2.5 rounded-clay-sm text-xs font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">Create Album</button>
                </div>

                {loadingAlbums ? (
                  <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
                  </div>
                ) : allAlbums.length === 0 ? (
                  <ClayCard variant="raised" className="p-10 text-center text-slate-500 font-bold select-none animate-fade-in">No gallery albums created.</ClayCard>
                ) : (
                  <BentoGrid className="gap-6">
                    {allAlbums.map((album) => (
                      <div key={album._id} className="col-span-12 sm:col-span-6 lg:col-span-4 relative group animate-fade-in">
                        <ClayCard variant="raised" className="p-4 space-y-3">
                          <div className="h-32 bg-[#EEF1F5] rounded-clay-sm shadow-clay-inset p-1.5 flex-shrink-0 relative overflow-hidden">
                            {album.photos?.length > 0 ? (
                              <img src={album.photos[0]} alt="" className="w-full h-full object-cover rounded-clay-sm shadow-clay-inset" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 select-none">Empty</div>
                            )}
                            <div className="absolute top-2 right-2">
                              <span className="px-2.5 py-1 text-[9px] uppercase font-bold rounded-clay-sm bg-[#EEF1F5] text-iste-blue shadow-clay-sm">{album.branch}</span>
                            </div>
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
                          <button onClick={() => deleteAlbum(album._id)} className="bg-[#EEF1F5] text-red-655 hover:text-red-800 rounded-full w-9 h-9 flex items-center justify-center shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </BentoGrid>
                )}
              </motion.div>
            )}

            {/* ────────────────────────────────────────── */}
            {/* TAB: ACTIVITY LOG                          */}
            {/* ────────────────────────────────────────── */}
            {activeTab === 'activity log' && (
              <motion.div
                key="activity-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center select-none px-1">
                  <h2 className="text-xl font-extrabold text-slate-800">Recent Platform Activity</h2>
                  <button onClick={fetchActivityLogs} className="px-4 py-2 rounded-clay-sm text-xs font-bold bg-[#EEF1F5] text-slate-550 shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all">Refresh Log</button>
                </div>

                {loadingLogs ? (
                  <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
                  </div>
                ) : activityLogs.length === 0 ? (
                  <ClayCard variant="raised" className="p-10 text-center text-slate-500 font-bold select-none">No activity logged yet.</ClayCard>
                ) : (
                  <ClayCard variant="raised" className="p-6">
                    <div className="divide-y divide-slate-200/30 max-h-[600px] overflow-y-auto bg-[#EEF1F5] rounded-clay-sm shadow-clay-inset p-4 border-slate-200">
                      {activityLogs.map((log) => {
                        const actor = log.performedBy?.profileId?.name || log.performedBy?.email || 'System';
                        return (
                          <div key={log._id} className="py-3 flex items-start justify-between gap-4 hover:bg-slate-200/20 text-sm font-bold">
                            <div>
                              <span className={`px-2 py-0.5 rounded-clay-sm text-[10px] font-black uppercase shadow-clay-sm mr-3 ${
                                log.action === 'CREATE' ? 'bg-[#EEF1F5] text-emerald-600' :
                                log.action === 'UPDATE' ? 'bg-[#EEF1F5] text-blue-600' :
                                'bg-[#EEF1F5] text-red-655'
                              }`}>
                                {log.action}
                              </span>
                              <span className="text-slate-800">{actor}</span>
                              <span className="text-slate-400 mx-1.5 select-none font-semibold">has performed:</span>
                              <span className="text-slate-700 font-extrabold">{log.details}</span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono whitespace-nowrap select-none font-bold">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </ClayCard>
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
        title={editingCoordId ? 'Edit Coordinator Details' : 'Assign New Credentials'}
        onSubmit={handleCoordSubmit}
        submitText={editingCoordId ? 'Save Changes' : 'Assign Credentials'}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Account Role</label>
              <select
                disabled={!!editingCoordId}
                value={coordForm.role}
                onChange={(e) => setCoordForm({ ...coordForm, role: e.target.value })}
                className="input-field cursor-pointer"
              >
                <option value="student_coordinator">Student Coordinator</option>
                <option value="branch_faculty">Branch Faculty</option>
              </select>
            </div>
            <div>
              <label className="form-label">Branch</label>
              <select
                disabled={!!editingCoordId}
                value={coordForm.branch}
                onChange={(e) => setCoordForm({ ...coordForm, branch: e.target.value })}
                className="input-field cursor-pointer"
              >
                {BRANCHES.filter(b => b !== 'CENTRAL').map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
          </div>

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
              {coordForm.role === 'student_coordinator' ? (
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
              ) : (
                <div>
                  <label className="form-label">College Outlook Email</label>
                  <input
                    type="email"
                    required
                    value={coordForm.email}
                    onChange={(e) => setCoordForm({ ...coordForm, email: e.target.value })}
                    placeholder="name@gmrit.edu.in"
                    className="input-field"
                  />
                </div>
              )}
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
                placeholder="e.g. Lead Coordinator"
                className="input-field"
              />
            </div>
            {coordForm.role === 'student_coordinator' ? (
              <div>
                <label className="form-label">Student Year</label>
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
            ) : (
              <div>
                <label className="form-label">Faculty Designation</label>
                <input
                  type="text"
                  required
                  value={coordForm.designation}
                  onChange={(e) => setCoordForm({ ...coordForm, designation: e.target.value })}
                  placeholder="e.g. Assistant Professor"
                  className="input-field"
                />
              </div>
            )}
          </div>

          <div>
            <label className="form-label">Bio</label>
            <textarea
              value={coordForm.bio}
              onChange={(e) => setCoordForm({ ...coordForm, bio: e.target.value })}
              placeholder="Short bio..."
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
        title={editingEventId ? 'Edit Event Details' : 'Post New Event'}
        onSubmit={handleEventSubmit}
        submitText={editingEventId ? 'Save Changes' : 'Post Event'}
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Event Title</label>
              <input
                type="text"
                required
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Hackathon title"
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Assigned Branch</label>
              <select
                value={eventForm.branch}
                onChange={(e) => setEventForm({ ...eventForm, branch: e.target.value })}
                className="input-field cursor-pointer"
              >
                {BRANCHES.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              required
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              placeholder="Details..."
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
                placeholder="e.g. Auditorium"
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
      {/* MODAL: BLOG CREATE/EDIT                    */}
      {/* ────────────────────────────────────────── */}
      <Modal
        isOpen={showBlogModal}
        onClose={() => setShowBlogModal(false)}
        title={editingBlogId ? 'Edit Blog Post' : 'Create Blog Post'}
        onSubmit={handleBlogSubmit}
        submitText={editingBlogId ? 'Save Changes' : 'Publish Blog Post'}
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Blog Title</label>
              <input
                type="text"
                required
                value={blogForm.title}
                onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                placeholder="Article title"
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select
                value={blogForm.category}
                onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                className="input-field cursor-pointer"
              >
                <option>Announcement</option>
                <option>Achievement</option>
                <option>Technical</option>
                <option>ISTE News</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Body Content (Rich Text)</label>
            <RichTextEditor
              content={blogForm.content}
              onChange={(html) => setBlogForm({ ...blogForm, content: html })}
            />
          </div>

          <FileUpload 
            label="Featured Image (Optional)" 
            onChange={(file) => setBlogFile(file)}
          />
        </div>
      </Modal>

      {/* ────────────────────────────────────────── */}
      {/* MODAL: GALLERY ALBUM CREATE                */}
      {/* ────────────────────────────────────────── */}
      <Modal
        isOpen={showAlbumModal}
        onClose={() => setShowAlbumModal(false)}
        title="Create Gallery Album"
        onSubmit={handleAlbumSubmit}
        submitText="Create Album"
        isSubmitting={isSubmitting}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Album Name</label>
              <input
                type="text"
                required
                value={albumForm.albumName}
                onChange={(e) => setAlbumForm({ ...albumForm, albumName: e.target.value })}
                placeholder="e.g. Annual Fest Highlights"
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Branch</label>
              <select
                value={albumForm.branch}
                onChange={(e) => setAlbumForm({ ...albumForm, branch: e.target.value })}
                className="input-field cursor-pointer"
              >
                {BRANCHES.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Linked Event (Optional)</label>
            <select
              value={albumForm.eventId}
              onChange={(e) => setAlbumForm({ ...albumForm, eventId: e.target.value })}
              className="input-field cursor-pointer"
            >
              <option value="">No Linked Event</option>
              {allEvents.map(e => (
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

export default CentralDashboard;

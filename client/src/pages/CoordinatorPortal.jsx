import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import PageTransition from '../components/ui/PageTransition';
import ClayCard from '../components/ui/ClayCard';
import BentoGrid from '../components/ui/BentoGrid';
import Modal from '../components/ui/Modal';
import FileUpload from '../components/ui/FileUpload';
import SafeImage from '../components/SafeImage';
import { DashboardTableSkeleton, CoordinatorCardSkeleton } from '../components/ui/SkeletonLoaders';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'CENTRAL'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Faculty'];

const CoordinatorPortal = () => {
  const { user, profile, userName, userBranch, checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [coordinators, setCoordinators] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modals / Action States (Faculty only)
  const [showCoordModal, setShowCoordModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editingCoordId, setEditingCoordId] = useState(null);
  const [resetCoord, setResetCoord] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Coordinator Edit/Create
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
    instagram: '',
  });
  const [coordFile, setCoordFile] = useState(null);

  const isFaculty = user?.role === 'central_faculty' || user?.role === 'branch_faculty';

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (isFaculty) {
        // Faculty: Get User Accounts
        const res = await api.get('/users');
        if (res.data.success) {
          setCoordinators(res.data.data);
        }
      } else {
        // Student: Get Public Profiles
        const res = await api.get('/profiles');
        if (res.data.success) {
          setProfiles(res.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching coordinator data:', err);
      toast.error('Failed to load portal data.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle account active state
  const toggleCoordActive = async (userId) => {
    try {
      const response = await api.patch(`/users/${userId}/toggle-active`);
      if (response.data.success) {
        toast.success('Status updated successfully.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle status.');
    }
  };

  // Delete Coordinator user and profile
  const deleteCoord = async (userId) => {
    if (!window.confirm('Delete this coordinator permanently? This action is irreversible.')) return;
    try {
      const response = await api.delete(`/users/${userId}`);
      if (response.data.success) {
        toast.success('Coordinator account deleted.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete coordinator.');
    }
  };

  // Reset password modal
  const openResetPasswordModal = (coord) => {
    setResetCoord(coord);
    setNewPassword('');
    setShowResetModal(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await api.patch(`/users/${resetCoord._id}/reset-password`, { password: newPassword });
      if (res.data.success) {
        toast.success(`Password reset successfully for ${resetCoord.profileId?.name || 'User'}`);
        setShowResetModal(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create or Edit Coordinator modal triggers
  const openAddCoord = () => {
    setEditingCoordId(null);
    setCoordForm({
      role: 'student_coordinator',
      branch: userBranch === 'CENTRAL' ? 'CSE' : userBranch,
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
      instagram: '',
    });
    setCoordFile(null);
    setShowCoordModal(true);
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
      instagram: coord.profileId?.socialLinks?.instagram || '',
    });
    setCoordFile(null);
    setShowCoordModal(true);
  };

  // Submit Coordinator Edit / Creation Form
  const handleCoordSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('role', coordForm.role);
      formData.append('branch', coordForm.branch);
      formData.append('name', coordForm.name);
      formData.append('isteRole', coordForm.isteRole);
      formData.append('year', coordForm.year);
      formData.append('designation', coordForm.designation);
      formData.append('bio', coordForm.bio);
      formData.append('socialLinks[linkedin]', coordForm.linkedin);
      formData.append('socialLinks[github]', coordForm.github);
      formData.append('socialLinks[instagram]', coordForm.instagram);

      if (coordFile) {
        formData.append('image', coordFile);
      }

      if (editingCoordId) {
        const coordToEdit = coordinators.find((c) => c._id === editingCoordId);
        const profileId = coordToEdit?.profileId?._id;
        if (!profileId) throw new Error('Profile ID not found.');

        const response = await api.patch(`/profiles/${profileId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.success) {
          toast.success('Coordinator profile updated successfully!');
          fetchData();
          setShowCoordModal(false);
          checkAuth(); // update central session if self-edited
        }
      } else {
        if (coordForm.role === 'student_coordinator') {
          formData.append('jntuNo', coordForm.jntuNo);
        } else {
          formData.append('email', coordForm.email);
        }
        formData.append('password', coordForm.password);

        const response = await api.post('/users/assign-credentials', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.success) {
          toast.success('Coordinator account assigned successfully!');
          fetchData();
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

  // Filtering Logic
  const filteredCoordinators = coordinators.filter((coord) => {
    const matchesSearch =
      coord.profileId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coord.jntuNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coord.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = branchFilter === 'All' || coord.branch === branchFilter;
    const matchesRole = roleFilter === 'All' || coord.role === roleFilter;

    // Branch Faculty: restrict list to their own branch
    if (user?.role === 'branch_faculty') {
      return matchesSearch && coord.branch === userBranch;
    }
    return matchesSearch && matchesBranch && matchesRole;
  });

  const filteredProfiles = profiles.filter((prof) => {
    const matchesSearch = prof.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = branchFilter === 'All' || prof.branch === branchFilter;
    return matchesSearch && matchesBranch;
  });

  return (
    <PageTransition className="pt-6 lg:pt-24 pb-16 min-h-screen bg-[#F0F2F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 select-none">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 font-display">
              Coordinator <span className="text-transparent bg-clip-text bg-gradient-to-r from-iste-blue to-sky-500">Portal</span>
            </h1>
            <p className="text-slate-500 text-sm font-semibold mt-1">
              Welcome, {userName}. Manage credentials, edit profiles, and view team roles.
            </p>
          </div>
          {isFaculty && (
            <button
              onClick={openAddCoord}
              className="px-5 py-3 rounded-full text-sm font-extrabold bg-iste-blue text-white shadow-lg hover:bg-iste-blue/90 active:scale-95 transition-all"
            >
              + Add Coordinator
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coordinators by name, ID or email..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-iste-blue/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Branch Filter */}
            {user?.role !== 'branch_faculty' && (
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-iste-blue/20 font-bold"
              >
                <option value="All">All Branches</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            )}

            {/* Role Filter */}
            {isFaculty && user?.role !== 'branch_faculty' && (
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-iste-blue/20 font-bold"
              >
                <option value="All">All Roles</option>
                <option value="student_coordinator">Student</option>
                <option value="branch_faculty">Branch Faculty</option>
                <option value="central_faculty">Central Faculty</option>
              </select>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          isFaculty ? <DashboardTableSkeleton rows={5} cols={6} /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <CoordinatorCardSkeleton key={i} delay={i} />)}
            </div>
          )
        ) : (
          <AnimatePresence mode="wait">
            {isFaculty ? (
              /* FACULTY VIEW: Accounts List Table */
              filteredCoordinators.length === 0 ? (
                <ClayCard variant="raised" className="p-10 text-center text-slate-500 font-bold">
                  No coordinator records found.
                </ClayCard>
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
                      {filteredCoordinators.map((coord) => (
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
                                coord.isActive ? 'text-emerald-600' : 'text-red-500'
                              } disabled:opacity-50`}
                            >
                              {coord.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right space-x-3 select-none">
                            {coord.role !== 'central_faculty' && (
                              <button onClick={() => openResetPasswordModal(coord)} className="text-amber-600 hover:text-amber-700 font-extrabold text-xs">Reset PW</button>
                            )}
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
              )
            ) : (
              /* STUDENT COORDINATOR VIEW: Directory Grid */
              filteredProfiles.length === 0 ? (
                <ClayCard variant="raised" className="p-10 text-center text-slate-500 font-bold">
                  No coordinator profiles found.
                </ClayCard>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProfiles.map((prof) => {
                    const isOwnProfile = prof._id === profile?._id;
                    return (
                      <ClayCard
                        key={prof._id}
                        variant="raised"
                        className={`p-6 flex flex-col justify-between h-full bg-white border ${
                          isOwnProfile ? 'border-iste-blue/30 ring-2 ring-iste-blue/5' : 'border-slate-100'
                        }`}
                      >
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                            <SafeImage src={prof.photoUrl} alt={prof.name} fallbackType="profile" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow space-y-1">
                            {isOwnProfile && (
                              <span className="px-2 py-0.5 rounded bg-iste-blue/10 text-iste-blue font-bold text-[9px] uppercase tracking-wider">
                                My Profile
                              </span>
                            )}
                            <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                              {prof.name}
                            </h3>
                            <p className="text-[11px] font-bold text-slate-450 uppercase tracking-widest leading-none">
                              {prof.role || 'Coordinator'}
                            </p>
                            <p className="text-xs font-semibold text-slate-500">
                              {prof.branch} • {prof.year}
                            </p>
                          </div>
                        </div>

                        {prof.bio && (
                          <p className="text-slate-500 font-semibold text-xs leading-relaxed line-clamp-2 mt-4">
                            {prof.bio}
                          </p>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-slate-100/50 mt-4 select-none">
                          {isOwnProfile ? (
                            <a
                              href="/dashboard?tab=profile"
                              className="flex-1 text-center py-2.5 rounded-full text-xs font-bold bg-iste-blue text-white shadow-md hover:bg-iste-blue/90"
                            >
                              Edit Profile Info
                            </a>
                          ) : (
                            <a
                              href={`/coordinators/${prof._id}`}
                              className="flex-1 text-center py-2.5 rounded-full text-xs font-bold bg-[#EEF1F5] text-slate-700 hover:shadow-clay-sm"
                            >
                              View Public Profile
                            </a>
                          )}
                        </div>
                      </ClayCard>
                    );
                  })}
                </div>
              )
            )}
          </AnimatePresence>
        )}

      </div>

      {/* ══════════════════════════════════════════ */}
      {/* MODAL: COORDINATOR CREATE/EDIT (Faculty)   */}
      {/* ══════════════════════════════════════════ */}
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
              <label className="form-label text-xs font-bold text-slate-500">Account Role</label>
              <select
                disabled={!!editingCoordId}
                value={coordForm.role}
                onChange={(e) => setCoordForm({ ...coordForm, role: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              >
                <option value="student_coordinator">Student Coordinator</option>
                <option value="branch_faculty">Branch Faculty</option>
              </select>
            </div>
            <div>
              <label className="form-label text-xs font-bold text-slate-500">Branch</label>
              <select
                disabled={!!editingCoordId || user?.role === 'branch_faculty'}
                value={coordForm.branch}
                onChange={(e) => setCoordForm({ ...coordForm, branch: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              >
                {BRANCHES.filter(b => b !== 'CENTRAL').map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label text-xs font-bold text-slate-500">Full Name</label>
            <input
              type="text"
              required
              value={coordForm.name}
              onChange={(e) => setCoordForm({ ...coordForm, name: e.target.value })}
              placeholder="Coordinator full name"
              className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
            />
          </div>

          {!editingCoordId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coordForm.role === 'student_coordinator' ? (
                <div>
                  <label className="form-label text-xs font-bold text-slate-500">JNTU No</label>
                  <input
                    type="text"
                    required
                    value={coordForm.jntuNo}
                    onChange={(e) => setCoordForm({ ...coordForm, jntuNo: e.target.value })}
                    placeholder="e.g. 21911A0501"
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="form-label text-xs font-bold text-slate-500">Email Address</label>
                  <input
                    type="email"
                    required
                    value={coordForm.email}
                    onChange={(e) => setCoordForm({ ...coordForm, email: e.target.value })}
                    placeholder="e.g. faculty@gmrit.edu.in"
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="form-label text-xs font-bold text-slate-500">Password</label>
                <input
                  type="password"
                  required
                  value={coordForm.password}
                  onChange={(e) => setCoordForm({ ...coordForm, password: e.target.value })}
                  placeholder="At least 8 chars"
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs font-bold text-slate-500">Chapter Role / Title</label>
              <input
                type="text"
                required
                value={coordForm.isteRole}
                onChange={(e) => setCoordForm({ ...coordForm, isteRole: e.target.value })}
                placeholder="e.g. Executive Body / Vice President"
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="form-label text-xs font-bold text-slate-500">Academic Year</label>
              <select
                value={coordForm.year}
                onChange={(e) => setCoordForm({ ...coordForm, year: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label text-xs font-bold text-slate-500">LinkedIn Profile</label>
              <input
                type="url"
                value={coordForm.linkedin}
                onChange={(e) => setCoordForm({ ...coordForm, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="form-label text-xs font-bold text-slate-500">GitHub Profile</label>
              <input
                type="url"
                value={coordForm.github}
                onChange={(e) => setCoordForm({ ...coordForm, github: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="form-label text-xs font-bold text-slate-500">Instagram Handle</label>
              <input
                type="url"
                value={coordForm.instagram}
                onChange={(e) => setCoordForm({ ...coordForm, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="form-label text-xs font-bold text-slate-500">Brief Biography</label>
            <textarea
              value={coordForm.bio}
              onChange={(e) => setCoordForm({ ...coordForm, bio: e.target.value })}
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="form-label text-xs font-bold text-slate-500">Profile Photo</label>
            <div className="mt-1.5">
              <FileUpload
                onFileSelect={(file) => setCoordFile(file)}
                previewUrl={null}
                placeholder="Upload face photo (square format preferred)"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════ */}
      {/* MODAL: RESET PASSWORD (Faculty)            */}
      {/* ══════════════════════════════════════════ */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Password"
        onSubmit={handleResetPasswordSubmit}
        submitText="Save Password"
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-600">
            Set a new password for <span className="text-slate-800 font-extrabold">{resetCoord?.profileId?.name}</span> ({resetCoord?.role?.replace('_', ' ')}).
          </p>
          <div>
            <label className="form-label text-xs font-bold text-slate-500">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 8 characters)"
              className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
};

export default CoordinatorPortal;

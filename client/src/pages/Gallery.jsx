import { useState, useEffect } from 'react';
import api from '../api/axios';
import AlbumGrid from '../components/AlbumGrid';
import Lightbox from '../components/Lightbox';
import PageTransition from '../components/ui/PageTransition';
import ClayCard from '../components/ui/ClayCard';
import { GalleryAlbumSkeleton } from '../components/ui/SkeletonLoaders';

const BRANCHES = ['All', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'CENTRAL'];

const Gallery = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeBranch, setActiveBranch] = useState('All');

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState([]);
  const [lightboxAlbumName, setLightboxAlbumName] = useState('');
  const [lightboxBranch, setLightboxBranch] = useState('');
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await api.get('/gallery');
      if (response.data.success) {
        setAlbums(response.data.data);
      }
    } catch (err) {
      setError('Failed to load gallery. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlbums = albums.filter((album) => {
    if (activeBranch !== 'All' && album.branch !== activeBranch) return false;
    return true;
  });

  const openLightbox = (album, startIndex = 0) => {
    if (album.photos && album.photos.length > 0) {
      setLightboxPhotos(album.photos);
      setLightboxAlbumName(album.albumName);
      setLightboxBranch(album.branch || '');
      setLightboxStartIndex(startIndex);
      setLightboxOpen(true);
    }
  };

  const totalPhotos = filteredAlbums.reduce((sum, a) => sum + (a.photos?.length || 0), 0);

  return (
    <PageTransition className="pt-2 lg:pt-20">
      <section className="bg-transparent pt-6 pb-16 lg:pt-8 lg:pb-24">
        <div className="section-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 select-none">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 animate-fade-in">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-iste-blue to-sky-500">Gallery</span>
            </h1>
            <p className="text-slate-600 font-bold max-w-xl mx-auto text-sm sm:text-base animate-fade-in">
              Photo albums from our events, workshops, and chapter activities.
            </p>
          </div>

          {/* Branch filter - Clay Toggle Buttons */}
          <div className="filter-scroll flex flex-nowrap md:flex-wrap md:justify-center gap-2.5 overflow-x-auto py-2 px-4 md:px-0 mb-6 select-none">
            {BRANCHES.map((branch) => {
              const isActive = activeBranch === branch;
              return (
                <button
                  key={branch}
                  onClick={() => setActiveBranch(branch)}
                  className={`px-5 py-2 rounded-clay-sm text-sm font-extrabold transition-all duration-300 active:scale-95 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#EEF1F5] text-iste-blue shadow-clay-pressed'
                      : 'bg-[#EEF1F5] text-slate-600 shadow-clay-sm hover:shadow-clay-md'
                  }`}
                >
                  {branch}
                </button>
              );
            })}
          </div>

          {/* Stats Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-slate-500 font-bold px-4 sm:px-0 select-none">
            <div>
              {filteredAlbums.length} album{filteredAlbums.length !== 1 ? 's' : ''} • {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''}
              {activeBranch !== 'All' && ` in ${activeBranch}`}
            </div>
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <GalleryAlbumSkeleton key={i} delay={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 flex justify-center px-4">
              <ClayCard variant="raised" className="max-w-md w-full p-8 text-center flex flex-col items-center">
                <p className="text-red-600 font-bold mb-4">{error}</p>
                <button
                  onClick={fetchAlbums}
                  className="px-5 py-2.5 rounded-clay-sm text-sm font-bold bg-[#EEF1F5] text-iste-blue shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all duration-300"
                >
                  Try Again
                </button>
              </ClayCard>
            </div>
          ) : filteredAlbums.length === 0 ? (
            <div className="text-center py-20 flex justify-center px-4">
              <ClayCard variant="raised" className="max-w-md w-full px-6 py-12 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#EEF1F5] shadow-clay-inset flex items-center justify-center">
                  <svg className="w-8 h-8 text-iste-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-extrabold text-slate-800">No Albums Found</h3>
                <p className="text-slate-500 font-bold text-sm">
                  No albums found{activeBranch !== 'All' ? ` for ${activeBranch}` : ''}. Albums will appear here once created.
                </p>
              </ClayCard>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredAlbums.map((album) => (
                <div key={album._id} className="h-full">
                  <AlbumGrid
                    album={album}
                    onClick={() => openLightbox(album)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          photos={lightboxPhotos}
          initialIndex={lightboxStartIndex}
          albumName={lightboxAlbumName}
          branch={lightboxBranch}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </PageTransition>
  );
};

export default Gallery;

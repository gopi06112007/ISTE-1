import SafeImage from './SafeImage';
import ClayCard from './ui/ClayCard';

const getBranchChipClass = (branch) => {
  const b = branch?.toUpperCase();
  switch (b) {
    case 'CSE':
      return 'bg-[#A8C5F0]/90 text-blue-900 border border-blue-400/20';
    case 'ECE':
      return 'bg-[#C9B8F0]/90 text-purple-900 border border-purple-400/20';
    case 'EEE':
      return 'bg-[#F0D9A8]/90 text-amber-900 border border-amber-400/20';
    case 'MECH':
      return 'bg-[#C7CDD6]/90 text-slate-900 border border-slate-400/20';
    case 'CIVIL':
      return 'bg-[#A8E0D4]/90 text-emerald-900 border border-emerald-400/20';
    case 'IT':
      return 'bg-[#F0B8D4]/90 text-pink-900 border border-pink-400/20';
    case 'CENTRAL':
      return 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 border border-blue-500/20';
    default:
      return 'bg-[#EEF1F5] text-slate-800 shadow-clay-sm';
  }
};

const AlbumGrid = ({ album, onClick }) => {
  const photoCount = album.photos?.length || 0;

  const branchAccents = {
    CSE: 'blue',
    ECE: 'violet',
    EEE: 'amber',
    MECH: 'slate',
    CIVIL: 'teal',
    IT: 'rose',
    CENTRAL: 'blue',
  };
  const accentColor = branchAccents[album.branch?.toUpperCase()] || 'blue';

  return (
    <div className="relative group h-full select-none">
      {/* Visual Photo Stack layers if > 1 photo */}
      {photoCount > 1 && (
        <>
          <div className="absolute inset-0 rounded-3xl bg-slate-200/60 rotate-2 translate-y-1 scale-98 transition-transform duration-300 group-hover:rotate-3 group-hover:translate-y-2" />
          <div className="absolute inset-0 rounded-3xl bg-slate-300/40 -rotate-1 translate-y-0.5 scale-99 transition-transform duration-300 group-hover:-rotate-2" />
        </>
      )}

      <ClayCard
        as="div"
        interactive={true}
        onClick={() => onClick?.(album)}
        accent={accentColor}
        className="relative z-10 overflow-hidden flex flex-col h-full rounded-3xl bg-white border border-slate-100 shadow-clay-md group-hover:shadow-clay-lg transition-all duration-300 cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.(album)}
      >
        {/* Cover Photo */}
        <div className="relative w-full overflow-hidden flex-shrink-0" style={{ aspectRatio: '16/10' }}>
          {album.photos && album.photos.length > 0 ? (
            <SafeImage
              src={album.photos[0]}
              alt={`${album.albumName} cover`}
              className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
              fallbackType="gallery"
              objectPosition="center center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-50">
              <svg className="w-10 h-10 text-blue-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Dark Overlay Gradient on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white text-xs font-bold flex items-center gap-1.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <span>View Album</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>

          {/* Branch badge — top-left */}
          <div className="absolute top-3 left-3 z-10">
            <span className={`px-3 py-1 text-[11px] font-extrabold rounded-full shadow-md backdrop-blur-md uppercase tracking-wider ${getBranchChipClass(album.branch)}`}>
              {album.branch}
            </span>
          </div>

          {/* Photo count badge — top-right */}
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-extrabold z-10 rounded-full flex items-center gap-1 border border-white/10 shadow-md">
            <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{photoCount}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-grow flex flex-col justify-between bg-white">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 line-clamp-1 group-hover:text-iste-blue transition-colors duration-300">
              {album.albumName}
            </h3>
            {album.eventId?.title ? (
              <p className="text-xs text-iste-blue mt-1 font-bold line-clamp-1">
                📌 {album.eventId.title}
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Captured during ISTE activities
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
            <span className="flex items-center gap-1 text-slate-400">
              <span>ISTE Gallery</span>
            </span>
            <span className="text-iste-blue group-hover:translate-x-1 transition-transform duration-300">
              Explore →
            </span>
          </div>
        </div>
      </ClayCard>
    </div>
  );
};

export default AlbumGrid;

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

  return (
    <ClayCard
      as="div"
      interactive={true}
      onClick={() => onClick?.(album)}
      className="group cursor-pointer overflow-hidden flex flex-col h-full"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(album)}
    >
      {/* Photo Preview sits flush at the top */}
      <div className="relative w-full overflow-hidden flex-shrink-0" style={{ aspectRatio: '16/10' }}>
        <div className="w-full h-full">
          {album.photos && album.photos.length > 0 ? (
            <SafeImage
              src={album.photos[0]}
              alt={`${album.albumName} cover`}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
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
        </div>

        {/* Branch chip — top-right */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded shadow-sm backdrop-blur-sm ${getBranchChipClass(album.branch)}`}>
            {album.branch}
          </span>
        </div>

        {/* Photo count badge */}
        {photoCount > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold z-10 rounded">
            +{photoCount - 1} more
          </div>
        )}
      </div>

      {/* Info section below image */}
      <div className="p-4 flex-grow flex flex-col justify-between bg-white">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 line-clamp-1 group-hover:text-iste-blue transition-colors duration-300">
            {album.albumName}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-semibold flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{photoCount} photo{photoCount !== 1 ? 's' : ''}</span>
          </p>
        </div>

        {album.eventId?.title && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-bold">
            <span className="truncate text-iste-blue flex items-center gap-1" title={album.eventId.title}>
              <span>📅</span>
              <span className="truncate max-w-[180px] text-left">{album.eventId.title}</span>
            </span>
          </div>
        )}
      </div>
    </ClayCard>
  );
};

export default AlbumGrid;

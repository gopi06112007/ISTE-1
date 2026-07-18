/**
 * SkeletonLoaders.jsx
 * Reusable skeleton loading components for the entire ISTE-1 website.
 * Each skeleton mimics the shape of the real content it replaces.
 */

/* ── Base shimmer block ─────────────────────────────────── */
const Shimmer = ({ className = '', style }) => (
  <div className={`skeleton-shimmer ${className}`} style={style} />
);

const ShimmerCircle = ({ className = '' }) => (
  <div className={`skeleton-shimmer-circle ${className}`} />
);

/* ══════════════════════════════════════════════════════════
   EventCardSkeleton — matches the event-card-container layout
   ══════════════════════════════════════════════════════════ */
export const EventCardSkeleton = ({ delay = 0 }) => (
  <div
    className={`event-card-container flex flex-col skeleton-delay-${delay}`}
    style={{ opacity: 0.7 }}
  >
    {/* Banner image area */}
    <div className="w-full aspect-[4/3] skeleton-shimmer rounded-t-[20px]" style={{ borderRadius: '20px 20px 0 0' }} />
    {/* Content area */}
    <div className="p-6 space-y-3">
      {/* Tags */}
      <div className="flex gap-2">
        <Shimmer className="h-5 w-20 !rounded-full" />
        <Shimmer className="h-5 w-14 !rounded-full" />
      </div>
      {/* Title */}
      <Shimmer className="h-6 w-full !rounded-lg" />
      <Shimmer className="h-6 w-3/4 !rounded-lg" />
      {/* Description */}
      <Shimmer className="h-4 w-full !rounded" />
      <Shimmer className="h-4 w-5/6 !rounded" />
      {/* Meta row */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
        <Shimmer className="h-4 w-28 !rounded" />
        <Shimmer className="h-4 w-24 !rounded" />
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   BlogCardSkeleton — matches frameless blog card layout
   ══════════════════════════════════════════════════════════ */
export const BlogCardSkeleton = ({ delay = 0 }) => (
  <div className={`flex flex-col skeleton-delay-${delay}`}>
    {/* Image */}
    <Shimmer className="w-full aspect-[16/10] !rounded-[1.25rem] mb-4" />
    {/* Title */}
    <Shimmer className="h-6 w-full !rounded-lg mb-2" />
    <Shimmer className="h-6 w-2/3 !rounded-lg mb-2" />
    {/* Excerpt */}
    <Shimmer className="h-4 w-full !rounded mb-1" />
    <Shimmer className="h-4 w-5/6 !rounded mb-1" />
    <Shimmer className="h-4 w-3/4 !rounded mb-3" />
    {/* Date */}
    <Shimmer className="h-3 w-32 !rounded mb-4" />
    {/* Footer */}
    <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
      <Shimmer className="h-4 w-24 !rounded" />
      <div className="flex gap-3">
        <ShimmerCircle className="w-5 h-5" />
        <ShimmerCircle className="w-5 h-5" />
        <ShimmerCircle className="w-5 h-5" />
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   CoordinatorCardSkeleton — matches coordinator card layout
   ══════════════════════════════════════════════════════════ */
export const CoordinatorCardSkeleton = ({ delay = 0 }) => (
  <div
    className={`w-[280px] sm:w-[300px] bg-white rounded-[1.5rem] border border-slate-100 shadow-md overflow-hidden skeleton-delay-${delay}`}
    style={{ opacity: 0.7 }}
  >
    {/* Photo area */}
    <div className="w-full aspect-[3/4] skeleton-shimmer" style={{ borderRadius: '1.5rem 1.5rem 0 0' }} />
    {/* Info area */}
    <div className="p-5 space-y-3">
      {/* Name */}
      <Shimmer className="h-6 w-3/4 !rounded-lg" />
      {/* Role badge */}
      <Shimmer className="h-5 w-24 !rounded-full" />
      {/* Branch + details */}
      <div className="flex gap-2">
        <Shimmer className="h-4 w-16 !rounded" />
        <Shimmer className="h-4 w-20 !rounded" />
      </div>
      {/* Designation */}
      <Shimmer className="h-4 w-2/3 !rounded" />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   GalleryAlbumSkeleton — matches album grid card layout
   ══════════════════════════════════════════════════════════ */
export const GalleryAlbumSkeleton = ({ delay = 0 }) => (
  <div
    className={`rounded-3xl bg-[#EEF1F5] shadow-clay-md p-4 space-y-4 skeleton-delay-${delay}`}
    style={{ opacity: 0.7 }}
  >
    {/* Thumbnail */}
    <Shimmer className="w-full h-48 !rounded-2xl" />
    {/* Album name */}
    <Shimmer className="h-5 w-3/4 !rounded" />
    {/* Branch + photo count */}
    <div className="flex justify-between">
      <Shimmer className="h-4 w-16 !rounded" />
      <Shimmer className="h-4 w-20 !rounded" />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   BlogDetailSkeleton — matches full article layout
   ══════════════════════════════════════════════════════════ */
export const BlogDetailSkeleton = () => (
  <div className="max-w-3xl mx-auto px-4 space-y-6 animate-pulse">
    {/* Category badge */}
    <Shimmer className="h-6 w-28 !rounded-full" />
    {/* Title */}
    <Shimmer className="h-10 w-full !rounded-xl" />
    <Shimmer className="h-10 w-3/4 !rounded-xl" />
    {/* Meta info */}
    <div className="flex items-center gap-4">
      <ShimmerCircle className="w-10 h-10" />
      <div className="space-y-2">
        <Shimmer className="h-4 w-32 !rounded" />
        <Shimmer className="h-3 w-24 !rounded" />
      </div>
    </div>
    {/* Hero image */}
    <Shimmer className="w-full h-64 sm:h-80 !rounded-2xl" />
    {/* Body paragraphs */}
    <div className="space-y-3 pt-4">
      <Shimmer className="h-4 w-full !rounded" />
      <Shimmer className="h-4 w-full !rounded" />
      <Shimmer className="h-4 w-5/6 !rounded" />
      <Shimmer className="h-4 w-full !rounded" />
      <Shimmer className="h-4 w-4/5 !rounded" />
      <div className="py-2" />
      <Shimmer className="h-4 w-full !rounded" />
      <Shimmer className="h-4 w-full !rounded" />
      <Shimmer className="h-4 w-3/5 !rounded" />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   DashboardTableSkeleton — mimics a data table with rows
   ══════════════════════════════════════════════════════════ */
export const DashboardTableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="rounded-clay-md bg-white shadow-clay-md p-6 space-y-4">
    {/* Header row */}
    <div className="flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Shimmer key={`h-${i}`} className="h-4 flex-1 !rounded" />
      ))}
    </div>
    {/* Data rows */}
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={`flex gap-4 skeleton-delay-${(r % 8) + 1}`}>
          {Array.from({ length: cols }).map((_, c) => (
            <Shimmer
              key={`${r}-${c}`}
              className="h-5 flex-1 !rounded"
              style={{ width: c === 0 ? '30%' : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   DashboardBlogSkeleton — mimics blog card in dashboard
   ══════════════════════════════════════════════════════════ */
export const DashboardBlogSkeleton = ({ delay = 0 }) => (
  <div
    className={`rounded-clay-md bg-white shadow-clay-md p-5 h-56 flex flex-col justify-between skeleton-delay-${delay}`}
    style={{ opacity: 0.7 }}
  >
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Shimmer className="h-5 w-20 !rounded-full" />
        <Shimmer className="h-3 w-24 !rounded" />
      </div>
      <Shimmer className="h-6 w-full !rounded-lg" />
      <Shimmer className="h-4 w-full !rounded" />
      <Shimmer className="h-4 w-3/4 !rounded" />
    </div>
    <div className="flex justify-end gap-2 pt-2">
      <Shimmer className="h-8 w-16 !rounded-lg" />
      <Shimmer className="h-8 w-16 !rounded-lg" />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   DashboardAlbumSkeleton — mimics album card in dashboard
   ══════════════════════════════════════════════════════════ */
export const DashboardAlbumSkeleton = ({ delay = 0 }) => (
  <div
    className={`rounded-clay-md bg-white shadow-clay-md p-4 space-y-3 skeleton-delay-${delay}`}
    style={{ opacity: 0.7 }}
  >
    <Shimmer className="h-32 w-full !rounded-lg" />
    <Shimmer className="h-5 w-2/3 !rounded" />
    <div className="flex justify-between">
      <Shimmer className="h-4 w-20 !rounded" />
      <Shimmer className="h-4 w-16 !rounded" />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   ActivityLogSkeleton — mimics activity log entries
   ══════════════════════════════════════════════════════════ */
export const ActivityLogSkeleton = ({ rows = 6 }) => (
  <div className="rounded-clay-md bg-white shadow-clay-md p-6">
    <div className="bg-[#EEF1F5] rounded-clay-sm p-4 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`flex items-center justify-between gap-4 py-3 skeleton-delay-${(i % 8) + 1}`}>
          <div className="flex items-center gap-3 flex-1">
            <Shimmer className="h-5 w-16 !rounded-full" />
            <Shimmer className="h-4 flex-1 !rounded" />
          </div>
          <Shimmer className="h-3 w-24 !rounded" />
        </div>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   PageLoaderSkeleton — Suspense fallback for lazy routes
   ══════════════════════════════════════════════════════════ */
export const PageLoaderSkeleton = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
    <div className="w-full max-w-4xl space-y-6">
      {/* Header area */}
      <div className="text-center space-y-3">
        <Shimmer className="h-10 w-64 mx-auto !rounded-xl" />
        <Shimmer className="h-5 w-96 mx-auto !rounded-lg" />
      </div>
      {/* Content grid placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`space-y-4 skeleton-delay-${i}`}>
            <Shimmer className="h-40 w-full !rounded-2xl" />
            <Shimmer className="h-5 w-3/4 !rounded" />
            <Shimmer className="h-4 w-1/2 !rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   AuthCheckSkeleton — for ProtectedRoute auth verification
   ══════════════════════════════════════════════════════════ */
export const AuthCheckSkeleton = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      {/* Avatar placeholder */}
      <ShimmerCircle className="w-16 h-16" />
      {/* Text lines */}
      <div className="space-y-2 flex flex-col items-center">
        <Shimmer className="h-5 w-48 !rounded-lg" />
        <Shimmer className="h-4 w-36 !rounded" />
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   HomeEventSkeleton — for the carousel in HomeSections
   ══════════════════════════════════════════════════════════ */
export const HomeEventSkeleton = () => (
  <div className="events-scroll">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className={`events-scroll-card h-[420px] rounded-[1.25rem] bg-white border border-slate-100 overflow-hidden skeleton-delay-${i}`}
      >
        {/* Image area */}
        <div className="w-full h-[55%] skeleton-shimmer" style={{ borderRadius: '1.25rem 1.25rem 0 0' }} />
        {/* Content area */}
        <div className="p-5 space-y-3">
          <div className="flex gap-2">
            <Shimmer className="h-5 w-16 !rounded-full" />
            <Shimmer className="h-5 w-12 !rounded-full" />
          </div>
          <Shimmer className="h-6 w-full !rounded-lg" />
          <Shimmer className="h-4 w-3/4 !rounded" />
          <Shimmer className="h-4 w-1/2 !rounded" />
        </div>
      </div>
    ))}
  </div>
);

/* ══════════════════════════════════════════════════════════
   HomeBlogSkeleton — for the blog carousel in HomeSections
   ══════════════════════════════════════════════════════════ */
export const HomeBlogSkeleton = () => (
  <div className="blog-scroll">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className={`blog-scroll-card h-[480px] rounded-[1.25rem] bg-white border border-slate-100 overflow-hidden skeleton-delay-${i}`}
      >
        {/* Image area */}
        <div className="w-full h-[45%] skeleton-shimmer" style={{ borderRadius: '1.25rem 1.25rem 0 0' }} />
        {/* Content area */}
        <div className="p-5 space-y-3">
          <Shimmer className="h-6 w-full !rounded-lg" />
          <Shimmer className="h-6 w-2/3 !rounded-lg" />
          <Shimmer className="h-4 w-full !rounded" />
          <Shimmer className="h-4 w-5/6 !rounded" />
          <Shimmer className="h-3 w-28 !rounded" />
          <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
            <Shimmer className="h-4 w-24 !rounded" />
            <div className="flex gap-3">
              <ShimmerCircle className="w-5 h-5" />
              <ShimmerCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ══════════════════════════════════════════════════════════
   HomeGallerySkeleton — enhanced gallery skeleton
   ══════════════════════════════════════════════════════════ */
export const HomeGallerySkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className={`rounded-3xl bg-[#EEF1F5] shadow-clay-md p-4 space-y-4 skeleton-delay-${i}`}>
        <Shimmer className="w-full h-48 !rounded-2xl" />
        <Shimmer className="w-3/4 h-5 !rounded" />
        <div className="flex justify-between">
          <Shimmer className="w-16 h-4 !rounded" />
          <Shimmer className="w-20 h-4 !rounded" />
        </div>
      </div>
    ))}
  </div>
);

/* ══════════════════════════════════════════════════════════
   StudentDashboardEventSkeleton — for student event grid
   ══════════════════════════════════════════════════════════ */
export const StudentDashboardEventSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <EventCardSkeleton key={i} delay={i} />
    ))}
  </div>
);

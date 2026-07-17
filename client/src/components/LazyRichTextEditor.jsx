import { lazy, Suspense } from 'react';

const RichTextEditor = lazy(() => import('./RichTextEditor'));

const LazyRichTextEditor = (props) => (
  <Suspense
    fallback={
      <div className="min-h-[180px] rounded-clay-sm bg-[#EEF1F5] shadow-clay-inset flex items-center justify-center text-sm font-bold text-slate-500">
        Loading editor...
      </div>
    }
  >
    <RichTextEditor {...props} />
  </Suspense>
);

export default LazyRichTextEditor;

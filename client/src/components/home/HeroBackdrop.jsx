import { lazy, Suspense, useEffect, useState } from 'react';

const HeroBackground3D = lazy(() => import('../HeroBackground3D'));

const HeroFallback = () => (
  <div
    className="absolute inset-0 z-0"
    aria-hidden="true"
    style={{
      background:
        'radial-gradient(circle at 20% 20%, rgba(26,86,219,0.16), transparent 28%), radial-gradient(circle at 80% 30%, rgba(124,58,237,0.14), transparent 30%), radial-gradient(circle at 50% 85%, rgba(13,148,136,0.12), transparent 32%)',
    }}
  />
);

const HeroBackdrop = () => {
  const [shouldRender3D, setShouldRender3D] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const saveData = navigator.connection?.saveData;

    if (reduceMotion || coarsePointer || saveData) {
      return undefined;
    }

    const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 450));
    const cancel = window.cancelIdleCallback || window.clearTimeout;
    const id = schedule(() => setShouldRender3D(true));

    return () => cancel(id);
  }, []);

  return (
    <>
      <HeroFallback />
      {shouldRender3D && (
        <Suspense fallback={null}>
          <HeroBackground3D />
        </Suspense>
      )}
    </>
  );
};

export default HeroBackdrop;

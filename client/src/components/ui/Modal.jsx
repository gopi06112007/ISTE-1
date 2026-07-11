import { useEffect } from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // 'md' for normal (560px), 'lg' for large (640px)
  isDestructive = false,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isSubmitting = false,
  hideFooter = false,
}) => {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClass = size === 'lg' ? 'max-w-[640px]' : 'max-w-[560px]';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-5 select-none">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#0c1424]/40 transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div
        className={`relative w-full ${maxWidthClass} bg-[#EEF1F5] rounded-clay shadow-clay-lg flex flex-col max-h-[85vh] animate-slide-up mx-auto overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 shrink-0 select-none">
          <h2 className={`text-xl font-black tracking-tight flex items-center gap-2 ${isDestructive ? 'text-red-500' : 'text-slate-805'}`}>
            {isDestructive && (
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:text-slate-800 bg-[#EEF1F5] shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto form-scroll space-y-5 text-left text-slate-700 font-semibold select-text">
          {children}
        </div>

        {/* Footer */}
        {!hideFooter && (
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-8 py-5 shrink-0 select-none">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-clay-sm font-bold text-slate-500 bg-[#EEF1F5] shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 disabled:opacity-50 transition-all"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-clay-sm font-bold transition-all shadow-clay-sm hover:shadow-clay-md active:shadow-clay-pressed active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                isDestructive 
                  ? 'bg-[#EEF1F5] text-red-500' 
                  : 'bg-[#EEF1F5] text-iste-blue'
              }`}
            >
              {isSubmitting && (
                <svg className="animate-spin w-4 h-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {submitText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

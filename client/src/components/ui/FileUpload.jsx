import { useState, useRef } from 'react';

const FileUpload = ({ label, accept = "image/*", onChange, multiple = false, hint = "Upload JPG, PNG or WEBP up to 5MB" }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    setFiles(multiple ? fileArray : [fileArray[0]]);
    if (onChange) {
      onChange(multiple ? newFiles : newFiles[0]);
    }
  };

  const removeFile = (indexToRemove) => {
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(newFiles);
    if (onChange) {
      onChange(multiple ? newFiles : (newFiles[0] || null));
    }
  };

  return (
    <div>
      {label && <label className="form-label">{label}</label>}
      <div
        className={`relative flex flex-col items-center justify-center w-full min-h-[120px] p-6 rounded-clay-sm transition-all duration-300 cursor-pointer select-none
          ${dragActive 
            ? 'bg-[#E5E9EE] shadow-clay-pressed' 
            : 'bg-[#EEF1F5] shadow-clay-inset hover:shadow-clay-md'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-2 text-center select-none">
            <svg className="w-8 h-8 text-slate-400 group-hover:text-iste-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="text-sm font-bold text-slate-600">
              Drag & drop or <span className="text-iste-blue">click to upload</span>
            </div>
            {hint && <div className="form-hint !mt-0 text-slate-500 font-semibold">{hint}</div>}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 w-full max-h-[150px] overflow-y-auto p-1">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between w-full p-3 bg-[#EEF1F5] shadow-clay-sm hover:shadow-clay-md rounded-clay-sm transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <svg className="w-5 h-5 text-iste-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-bold text-slate-700 truncate">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1.5 text-slate-400 hover:text-red-500 bg-[#EEF1F5] shadow-clay-sm active:shadow-clay-pressed rounded-full transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

import React, { useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FileUploadProps {
  label?: string;
  accept?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  helperText?: string;
  error?: string;
  currentFileName?: string;
}

export function FileUpload({
  label,
  accept,
  value,
  onChange,
  helperText,
  error,
  currentFileName,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const displayName = value?.name || currentFileName;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      {displayName ? (
        <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
          <File className="h-5 w-5 text-gray-400" />
          <span className="flex-1 text-sm text-gray-700 truncate">{displayName}</span>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            'w-full p-6 border-2 border-dashed rounded-lg text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50',
            error ? 'border-red-500' : 'border-gray-300'
          )}
        >
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
          {helperText && <p className="text-xs text-gray-400 mt-1">{helperText}</p>}
        </button>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

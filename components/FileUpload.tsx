'use client';

import { useRef, useState } from 'react';
import { uploadFile, uploadFiles } from '@/lib/upload';

interface SingleFileUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  required?: boolean;
}

export function SingleFileUpload({ label, value, onChange, accept = 'image/*', required }: SingleFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err: any) {
      alert('Erreur upload: ' + err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt={label}
            className="h-24 w-24 object-cover rounded-md border border-gray-300"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center leading-none hover:bg-red-600"
          >
            ×
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors text-gray-400 text-xs text-center"
        >
          {uploading ? (
            <span>Upload...</span>
          ) : (
            <>
              <span className="text-2xl mb-1">+</span>
              <span>Choisir</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

interface MultiFileUploadProps {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  required?: boolean;
}

export function MultiFileUpload({ label, values, onChange, max = 5, required }: MultiFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = max - values.length;
    const toUpload = files.slice(0, remaining);
    if (toUpload.length === 0) {
      alert(`Maximum ${max} photos autorisées`);
      return;
    }

    setUploading(true);
    try {
      const urls = await uploadFiles(toUpload);
      onChange([...values, ...urls]);
    } catch (err: any) {
      alert('Erreur upload: ' + err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
        <span className="text-gray-400 font-normal ml-1">({values.length}/{max})</span>
      </label>

      <div className="flex flex-wrap gap-2">
        {values.map((url, i) => (
          <div key={i} className="relative">
            <img
              src={url}
              alt={`${label} ${i + 1}`}
              className="h-20 w-20 object-cover rounded-md border border-gray-300"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center leading-none hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ))}

        {values.length < max && (
          <div
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors text-gray-400 text-xs text-center"
          >
            {uploading ? (
              <span>Upload...</span>
            ) : (
              <>
                <span className="text-2xl mb-1">+</span>
                <span>Ajouter</span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

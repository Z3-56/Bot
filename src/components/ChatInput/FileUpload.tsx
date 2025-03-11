import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { motion, MotionProps } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void>;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setError(null);
    setIsUploading(true);

    try {
      await onFileUpload(file);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  return (
    <div className="relative">
      <motion.div
        {...(getRootProps() as MotionProps)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`p-2 rounded-full transition-colors ${
          isDragActive
            ? 'bg-blue-100 text-blue-600'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Upload className="w-5 h-5" />
        )}
      </motion.div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute bottom-full mb-2 p-2 bg-red-100 text-red-600 text-sm rounded-lg whitespace-nowrap"
        >
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

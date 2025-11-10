"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface UploadedScript {
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

interface ScriptUploadProps {
  onFilesChange: (files: File[]) => void;
  existingScripts?: Array<{ id: string; file_name: string; file_size: number }>;
  onDeleteExisting?: (scriptId: string) => void;
}

export function ScriptUpload({ onFilesChange, existingScripts = [], onDeleteExisting }: ScriptUploadProps) {
  const [uploadedScripts, setUploadedScripts] = useState<UploadedScript[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out files larger than 10MB
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newScripts: UploadedScript[] = validFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      status: 'pending'
    }));

    setUploadedScripts(prev => [...prev, ...newScripts]);

    // Notify parent component
    const allFiles = [...uploadedScripts.map(s => s.file), ...validFiles];
    onFilesChange(allFiles);

    toast.success(`${validFiles.length} script${validFiles.length > 1 ? 's' : ''} added`);
  }, [uploadedScripts, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/javascript': ['.js', '.jsx'],
      'text/x-python': ['.py'],
      'application/javascript': ['.js', '.jsx'],
      'text/typescript': ['.ts', '.tsx'],
      'text/markdown': ['.md'],
      'application/json': ['.json'],
      'text/html': ['.html'],
      'text/css': ['.css'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeScript = (index: number) => {
    const newScripts = uploadedScripts.filter((_, i) => i !== index);
    setUploadedScripts(newScripts);
    onFilesChange(newScripts.map(s => s.file));
    toast.success('Script removed');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
          ${isDragActive
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
          }`}
      >
        <input {...getInputProps()} />
        <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragActive ? 'text-green-500' : 'text-gray-400'}`} />

        {isDragActive ? (
          <p className="text-green-600 font-medium">Drop your scripts here...</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium mb-1">
              Drag & drop script files here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-3">
              Supports: .txt, .js, .py, .ts, .md, .json, .html, .css
            </p>
            <p className="text-xs text-gray-400">
              Maximum file size: 10MB per file
            </p>
          </>
        )}
      </div>

      {/* Existing Scripts from Database */}
      {existingScripts.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Existing Scripts</h4>
          <div className="space-y-2">
            {existingScripts.map((script) => (
              <div
                key={script.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{script.file_name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(script.file_size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {onDeleteExisting && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteExisting(script.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Newly Uploaded Scripts (not yet saved) */}
      {uploadedScripts.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            New Scripts (will be uploaded when you save)
          </h4>
          <div className="space-y-2">
            {uploadedScripts.map((script, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{script.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(script.size)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeScript(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Message */}
      {uploadedScripts.length === 0 && existingScripts.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Train your AI agent with reference scripts
              </h4>
              <p className="text-xs text-blue-700">
                Upload example writing samples, scripts, or documents that showcase your desired style and tone.
                The AI will learn from these to generate content that matches your preferences.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, File, FileText, Image as ImageIcon, Trash2, Download, AlertCircle } from 'lucide-react';
import { useDocuments, useUploadDocument, useDeleteDocument } from '../api/documentQueries';
import type { User } from '../types';

interface DocumentUploadWidgetProps {
    ownerType: string;
    ownerId: string;
    currentUser: User;
}

interface UploadingFile {
    id: string;
    file: globalThis.File;
    progress: number;
    error?: string;
}

export const DocumentUploadWidget: React.FC<DocumentUploadWidgetProps> = ({ ownerType, ownerId, currentUser }) => {
    const { data: documents, isLoading } = useDocuments(ownerType, ownerId);
    const { mutateAsync: uploadDocument } = useUploadDocument();
    const { mutate: deleteDocument } = useDeleteDocument();

    const [isDragging, setIsDragging] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        
        const newUploads = Array.from(files).map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            progress: 0
        }));

        setUploadingFiles(prev => [...prev, ...newUploads]);

        for (const upload of newUploads) {
            try {
                await uploadDocument({
                    file: upload.file,
                    ownerType,
                    ownerId,
                    onProgress: (progress) => {
                        setUploadingFiles(prev => prev.map(f => 
                            f.id === upload.id ? { ...f, progress } : f
                        ));
                    }
                });
                
                // Remove from uploading list on success
                setUploadingFiles(prev => prev.filter(f => f.id !== upload.id));
            } catch (err: any) {
                setUploadingFiles(prev => prev.map(f => 
                    f.id === upload.id ? { ...f, error: err?.response?.data?.message || 'Upload failed' } : f
                ));
            }
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        // Reset input so same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <ImageIcon size={20} className="text-blue-500" />;
        if (mimeType === 'application/pdf') return <FileText size={20} className="text-red-500" />;
        return <File size={20} className="text-gray-500" />;
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-[var(--border-color)] bg-gray-50/50 dark:bg-gray-800/20">
                <h3 className="font-semibold text-lg">Documents</h3>
                <p className="text-sm text-[var(--text-secondary)]">Upload and manage related files</p>
            </div>

            <div className="p-4 flex-1 flex flex-col overflow-hidden">
                {/* Drag and Drop Zone */}
                <div 
                    className={`
                        border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors mb-4 shrink-0
                        ${isDragging ? 'border-[var(--color-primary)] bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}
                    `}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        multiple 
                        onChange={onFileInputChange} 
                    />
                    <UploadCloud size={32} className="text-[var(--text-secondary)] mb-2" />
                    <p className="font-medium">Click or drag files here to upload</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">PDF, PNG, JPEG up to 10MB</p>
                </div>

                {/* File List Area */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {/* Active Uploads */}
                    {uploadingFiles.map(file => (
                        <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-[var(--border-color)]">
                            {getFileIcon(file.file.type)}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                                    <span className="text-xs text-[var(--text-secondary)]">{file.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-300 ${file.error ? 'bg-red-500' : 'bg-[var(--color-primary)]'}`} 
                                        style={{ width: `${file.progress}%` }} 
                                    />
                                </div>
                                {file.error && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} /> {file.error}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Server Documents */}
                    {isLoading && <p className="text-sm text-center text-[var(--text-secondary)] py-4">Loading documents...</p>}
                    
                    {!isLoading && documents?.length === 0 && uploadingFiles.length === 0 && (
                        <p className="text-sm text-center text-[var(--text-secondary)] py-8">No documents uploaded yet.</p>
                    )}

                    {documents?.map(doc => {
                        const canDelete = currentUser.role === 'ADMIN' || doc.uploadedBy === currentUser.id;
                        return (
                            <div key={doc.id} className="flex items-center gap-3 p-3 bg-[var(--card-color)] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg border border-[var(--border-color)] group">
                                {getFileIcon(doc.mimeType)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" title={doc.fileName}>{doc.fileName}</p>
                                    <p className="text-xs text-[var(--text-secondary)]">{formatBytes(doc.fileSize)}</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a 
                                        href={`http://localhost:8080/api/documents/${doc.id}/download`} 
                                        download
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 text-gray-500 hover:text-[var(--color-primary)] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                        title="Download"
                                    >
                                        <Download size={16} />
                                    </a>
                                    {canDelete && (
                                        <button 
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this document?')) {
                                                    deleteDocument({ documentId: doc.id });
                                                }
                                            }}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

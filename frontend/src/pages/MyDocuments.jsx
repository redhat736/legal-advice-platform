import React, { useState, useEffect, useRef } from 'react';
import { docApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  FolderLock, 
  UploadCloud, 
  FileText, 
  File, 
  Trash2, 
  Download, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const MyDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await docApi.listDocuments();
      if (res?.documents) {
        setDocuments(res.documents);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch vault documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate client-side size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File exceeds the 5MB maximum security threshold.');
      return;
    }

    // Validate extension
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload PDF, JPEG, or PNG files.');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);

    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await docApi.uploadDocument(formData);
      setSuccessMessage(`"${file.name}" deposited into encrypted vault.`);
      loadDocuments();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setErrorMessage(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently destroy vault record for "${name}"?`)) return;
    try {
      await docApi.deleteDocument(id);
      setDocuments(documents.filter((d) => d.id !== id));
      setSuccessMessage(`Document removed from vault.`);
    } catch (err) {
      setErrorMessage(err.message || 'Could not delete document.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5" /> Confidential Discovery Vault
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Case Documents</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Upload and safeguard privileged exhibits, contractual agreements, and evidence records under zero-trust BOLA authorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            {uploading ? 'Encrypting & Depositing...' : 'Upload Document'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
          />
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 flex items-center gap-2 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="mb-8 p-8 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/20 rounded-2xl cursor-pointer text-center transition-all group"
      >
        <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">
          Drop evidence files here, or <span className="text-blue-600 underline">browse device</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Supports Application/PDF, JPEG, and PNG images (Strict 5MB cap per file)
        </p>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Saved Vault Records</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {documents.length} File{documents.length === 1 ? '' : 's'} Stored
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Decrypting vault entries...
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <FolderLock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">Vault is empty</h4>
            <p className="text-xs text-slate-400 mt-1">
              Upload discovery documents above to share them securely with your counsel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const isPdf = doc.mime_type.includes('pdf');
              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-400 transition-all flex flex-col justify-between group shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-blue-600 shrink-0">
                      {isPdf ? <FileText className="w-5 h-5 text-red-500" /> : <File className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-800 truncate" title={doc.original_name}>
                        {doc.original_name}
                      </h4>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {(doc.file_size / 1024).toFixed(1)} KB • {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600">
                        {isPdf ? 'PDF Exhibit' : 'Image Evidence'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <a
                      href={docApi.getDownloadUrl(doc.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id, doc.original_name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition"
                      title="Destroy Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default MyDocuments;

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  AlertCircle,
  FileDown,
  UploadCloud,
  FileSpreadsheet,
  X,
} from 'lucide-react';

type ApiValidationError = {
  loc?: Array<string | number>;
  msg?: string;
};

export function CSVUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadCSV, isLoading } = usePortfolioStore();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [portfolioName, setPortfolioName] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setUploadStatus('idle');
    setUploadMessage('');

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      setUploadStatus('error');
      setUploadMessage('Unsupported format. Please upload a .csv or .xlsx file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('error');
      setUploadMessage('File size exceeds 10MB limit.');
      return;
    }

    setFiles([file]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploadStatus('idle');
    setUploadMessage('');

    try {
      await uploadCSV(files[0], portfolioName || undefined);
      setUploadStatus('success');
      setUploadMessage('Portfolio uploaded successfully! Redirecting to dashboard...');

      setFiles([]);
      setPortfolioName('');

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: unknown) {
      const responseData = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { detail?: string | ApiValidationError[] } } }).response?.data
        : undefined;

      console.error('UPLOAD ERROR RESPONSE:', JSON.stringify(responseData, null, 2));
      setUploadStatus('error');

      let errorMsg = 'Failed to upload portfolio. Please try again.';
      const detail = responseData?.detail;

      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        errorMsg = detail
          .map((err) => `${err.loc?.join('.') ?? 'upload'}: ${err.msg ?? 'Invalid value'}`)
          .join(', ');
      }

      setUploadMessage(errorMsg);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const downloadSampleCSV = () => {
    const csvContent = "Symbol,Quantity,Purchase Price,Purchase Date,Sector,Exchange\nRELIANCE,10,2450.50,2023-05-20,Energy,NSE\nTCS,5,3800.00,2023-06-15,Technology,NSE\nINFY,15,1450.25,2023-07-10,Technology,NSE";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finguard_sample_portfolio.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-600">Portfolio upload</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">Portfolio Data Ingestion</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            Upload a brokerage statement or holdings file for portfolio analysis.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={downloadSampleCSV}
          icon={<FileDown size={16} />}
          className="w-fit border border-border bg-white"
        >
          Download Template
        </Button>
      </div>

      <Card hoverable={false} className="overflow-hidden">
        <CardHeader className="py-4">
          <CardTitle>Portfolio name</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <input
            type="text"
            placeholder="Enter portfolio name (leave empty to auto-generate)"
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
            className="h-11 w-full rounded-md border border-borderHighlight/70 bg-white px-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </CardContent>
      </Card>

      {uploadStatus !== 'idle' && (
        <div className={`flex items-center gap-3 rounded-lg border p-4 text-sm ${
          uploadStatus === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
        }`}>
          {uploadStatus === 'success' ? (
            <CheckCircle className="shrink-0 text-emerald-600" size={20} />
          ) : (
            <AlertCircle className="shrink-0 text-red-600" size={20} />
          )}
          <p className={uploadStatus === 'success' ? 'text-emerald-800' : 'text-red-800'}>
            {uploadMessage}
          </p>
        </div>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`rounded-[14px] border border-dashed p-6 transition-all sm:p-8 ${
          dragActive ? 'border-primary-500 bg-primary-50 shadow-glow-primary' : 'border-borderHighlight bg-white shadow-card'
        }`}
      >
        <div className="mx-auto flex min-h-[260px] max-w-xl flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 ring-8 ring-primary-50/50">
            <UploadCloud className="h-8 w-8 text-primary-600" />
          </div>
          <p className="text-lg font-semibold text-text-primary">
            Drop your portfolio file here
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            CSV or XLSX up to 10 MB
          </p>
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            icon={<FileSpreadsheet size={16} />}
            className="mt-6"
          >
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>

      {files.length > 0 && (
        <Card hoverable={false}>
          <CardHeader className="py-4">
            <CardTitle>Selected Files</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <div className="space-y-3">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surfaceHighlight/40 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-600">
                      <FileSpreadsheet size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-text-primary">{file.name}</p>
                      <p className="text-sm text-text-secondary">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(idx)}
                    disabled={isLoading}
                    icon={<X size={16} />}
                    className="shrink-0 text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button
              className="mt-6 w-full"
              onClick={handleUpload}
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card hoverable={false}>
        <CardHeader className="py-4">
          <CardTitle>Ingestion Rules & Format</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <div className="grid gap-3 text-sm text-text-secondary sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-surfaceHighlight/30 p-3">
              <span className="font-medium text-text-primary">Required columns</span>
              <p className="mt-1">Symbol/Ticker and Quantity</p>
            </div>
            <div className="rounded-lg border border-border bg-surfaceHighlight/30 p-3">
              <span className="font-medium text-text-primary">Recommended fields</span>
              <p className="mt-1">Purchase Price, Purchase Date, Sector</p>
            </div>
            <div className="rounded-lg border border-border bg-surfaceHighlight/30 p-3">
              <span className="font-medium text-text-primary">Upload limits</span>
              <p className="mt-1">CSV or XLSX, maximum 10 MB</p>
            </div>
          </div>
          <p className="mt-4 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2 text-sm text-primary-800">
            New uploads replace your existing tracked portfolio.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

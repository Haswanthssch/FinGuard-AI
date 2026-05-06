import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';

export function CSVUploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

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
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CSV Upload</h1>
        <p className="text-gray-500 mt-2">Upload transaction data for analysis</p>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg transition-colors p-12 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="text-center">
          <p className="text-4xl mb-4">📁</p>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drag and drop your CSV file here
          </p>
          <p className="text-gray-600 mb-6">or</p>
          <Button>Browse Files</Button>
          <p className="text-sm text-gray-500 mt-4">
            Supported formats: CSV, XLSX
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button variant="danger" size="sm">
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button className="w-full mt-6">Upload Files</Button>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>• File must contain transaction data with columns: Date, Amount, Merchant, Category</li>
            <li>• Maximum file size: 100 MB</li>
            <li>• Supported formats: CSV, XLSX</li>
            <li>• Data will be processed and analyzed for fraud patterns</li>
            <li>• Results will be available in the Fraud Center</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

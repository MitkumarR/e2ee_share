import React, { useState, useRef } from 'react';

// A simple mock data structure for a file.
// In a real app, this would come from your backend.
interface AppFile {
  id: string;
  name: string;
  size: string;
  lastModified: string;
  isEncrypted: boolean;
}

// Mock file data
const mockFiles: AppFile[] = [
  { id: '1', name: 'project-alpha-specs.docx', size: '2.3 MB', lastModified: '2 hours ago', isEncrypted: true },
  { id: '2', name: 'design-mockups.zip', size: '15.1 MB', lastModified: '1 day ago', isEncrypted: true },
  { id: '3', name: 'meeting-notes-q3.pdf', size: '850 KB', lastModified: '3 days ago', isEncrypted: true },
];

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<AppFile[]>(mockFiles);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handles the file selection from the input
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      // Automatically trigger the upload process once a file is selected
      handleUpload(file);
    }
  };

  // Triggers the hidden file input
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Handles the entire upload and encryption process
  const handleUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    console.log(`Starting upload for: ${file.name}`);

    try {
      // --- E2EE WORKFLOW IMPLEMENTATION ---
      // This is a placeholder for the workflow you provided.

      // 1. User Selects File (Already done)

      // 2. Encrypt File in Browser
      // TODO: Implement client-side file encryption (e.g., using Web Crypto API)
      console.log('Step 2: Encrypting file in browser...');
      // const encryptedFile = await encryptFile(file);

      // 3. Generate AES Key
      // TODO: Generate a new AES key for this file
      console.log('Step 3: Generating AES key...');
      // const aesKey = await generateAESKey();

      // 4. Encrypt AES Key with RSA
      // TODO: Fetch recipient's public RSA key and encrypt the AES key
      console.log('Step 4: Encrypting AES key with RSA...');
      // const encryptedAESKey = await encryptAESKeyWithRSA(aesKey, recipientPublicKey);

      // 5. Send Encrypted File and Metadata to Backend
      // TODO: Create a FormData object and send it to your server
      console.log('Step 5: Sending encrypted data to backend...');
      // const formData = new FormData();
      // formData.append('file', encryptedFile);
      // formData.append('key', encryptedAESKey);
      // formData.append('filename', file.name);
      // await fetch('/api/upload', { method: 'POST', body: formData });

      // --- END OF WORKFLOW ---

      // Simulate network delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 2000));

      // On success, add the new file to the list (mocked)
      const newFile: AppFile = {
        id: (files.length + 1).toString(),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        lastModified: 'Just now',
        isEncrypted: true,
      };
      setFiles(prevFiles => [newFile, ...prevFiles]);

      console.log('Upload successful!');
    } catch (error) {
      console.error('Upload failed:', error);
      // TODO: Show an error message to the user
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-bold text-xl">E2EE Share</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Welcome, user!</span>
              <a href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">Logout</a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Files</h1>
          <button
            onClick={triggerFileSelect}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload New File'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden" // The input is hidden and triggered by the button
          />
        </div>

        {/* File List */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {files.map((file) => (
              <li key={file.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center space-x-4">
                  <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {file.size} - Last modified {file.lastModified}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.isEncrypted && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Encrypted
                    </span>
                  )}
                  <button className="text-gray-400 hover:text-gray-600">
                     {/* More options icon */}
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import './App.css';

const App = () => {
  const [uploadResults, setUploadResults] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);

  const handleUploadSuccess = (result) => {
    console.log('Upload successful:', result);
    setUploadResults(prev => [...prev, result]);
    setUploadHistory(prev => [{
      timestamp: new Date().toISOString(),
      status: 'success',
      result: result
    }, ...prev]);
  };

  const handleUploadError = (error) => {
    console.error('Upload failed:', error);
    setUploadHistory(prev => [{
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error.message
    }, ...prev]);
  };

  const clearHistory = () => {
    setUploadResults([]);
    setUploadHistory([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Image Upload Component Demo</h1>
        <p>A reusable React component for uploading JPEG images to MongoDB</p>
      </header>

      <main className="app-main">
        {/* Single Image Upload */}
        <section className="upload-section">
          <h2>Single Image Upload</h2>
          <ImageUpload
            apiEndpoint="/upload"
            multiple={false}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            showPreview={true}
            className="single-upload"
          />
        </section>

        {/* Multiple Images Upload */}
        <section className="upload-section">
          <h2>Multiple Images Upload</h2>
          <ImageUpload
            apiEndpoint="/upload/multiple"
            multiple={true}
            maxFiles={5}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            showPreview={true}
            className="multiple-upload"
          />
        </section>

        {/* Custom Styled Upload */}
        <section className="upload-section">
          <h2>Custom Styled Upload</h2>
          <ImageUpload
            apiEndpoint="/upload"
            multiple={false}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            showPreview={false}
            className="custom-upload"
          >
            <div className="custom-upload-content">
              <div className="custom-icon">🎨</div>
              <h3>Drop your artwork here</h3>
              <p>We accept high-quality JPEG images</p>
            </div>
          </ImageUpload>
        </section>

        {/* Upload Results */}
        {uploadResults.length > 0 && (
          <section className="results-section">
            <h2>Recent Uploads</h2>
            <div className="results-grid">
              {uploadResults.map((result, index) => (
                <div key={index} className="result-card">
                  <h4>Upload #{index + 1}</h4>
                  {result.data && (
                    <div className="result-info">
                      <p><strong>File ID:</strong> {result.data.fileId}</p>
                      <p><strong>Filename:</strong> {result.data.filename}</p>
                      <p><strong>Size:</strong> {result.data.size} bytes</p>
                      <p><strong>Upload Date:</strong> {new Date(result.data.uploadDate).toLocaleString()}</p>
                      {result.data.fileId && (
                        <div className="result-actions">
                          <a 
                            href={`/images/${result.data.fileId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-link"
                          >
                            View Image
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upload History */}
        {uploadHistory.length > 0 && (
          <section className="history-section">
            <div className="history-header">
              <h2>Upload History</h2>
              <button onClick={clearHistory} className="clear-history-btn">
                Clear History
              </button>
            </div>
            <div className="history-list">
              {uploadHistory.map((entry, index) => (
                <div key={index} className={`history-item ${entry.status}`}>
                  <div className="history-time">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  <div className="history-status">
                    {entry.status === 'success' ? '✅' : '❌'} {entry.status}
                  </div>
                  {entry.result && (
                    <div className="history-details">
                      Uploaded: {entry.result.data?.filename || 'Unknown file'}
                    </div>
                  )}
                  {entry.error && (
                    <div className="history-error">
                      Error: {entry.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* API Information */}
        <section className="api-section">
          <h2>API Information</h2>
          <div className="api-info">
            <h3>Available Endpoints:</h3>
            <ul>
              <li><code>POST /upload</code> - Upload single JPEG image</li>
              <li><code>POST /upload/multiple</code> - Upload multiple JPEG images</li>
              <li><code>GET /images/:id</code> - Retrieve uploaded image</li>
              <li><code>DELETE /images/:id</code> - Delete uploaded image</li>
              <li><code>GET /images</code> - List all uploaded images</li>
              <li><code>GET /health</code> - Service health check</li>
            </ul>
            
            <h3>Integration Example:</h3>
            <pre className="code-example">{`import ImageUpload from './components/ImageUpload';

function MyComponent() {
  const handleSuccess = (result) => {
    console.log('Upload successful:', result);
  };

  const handleError = (error) => {
    console.error('Upload failed:', error);
  };

  return (
    <ImageUpload
      apiEndpoint="/upload"
      multiple={false}
      maxFileSize={5 * 1024 * 1024}
      onUploadSuccess={handleSuccess}
      onUploadError={handleError}
      showPreview={true}
    />
  );
}`}</pre>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Built with React + Node.js + MongoDB</p>
      </footer>
    </div>
  );
};

export default App;

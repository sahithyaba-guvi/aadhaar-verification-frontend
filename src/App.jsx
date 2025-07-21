import React, { useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [zipFile, setZipFile] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        file.type !== 'application/zip' &&
        file.type !== 'application/x-zip-compressed'
      ) {
        setError('Please select a valid ZIP file');
        e.target.value = '';
        return;
      } else if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        e.target.value = '';
        return;
      } else {
        setError('');
      }
      setZipFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!zipFile) {
      setError('Please select a ZIP file');
      return;
    }
    if (!password) {
      setError('Please enter password');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('zipFile', zipFile);
      formData.append('password', password);
      const response = await fetch(`${API_URL}/api/verify`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        // Auto download photo
        if (data.data.photoBase64 && data.data.photoBase64 !== 'N/A') {
          const link = document.createElement('a');
          link.href = `data:image/jpeg;base64,${data.data.photoBase64}`;
          link.download = 'aadhaar_photo.jpg';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Aadhaar KYC Verification</h1>
      <p>Upload your Aadhaar ZIP file for KYC verification</p>
      <form id="uploadForm" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="zipFile">Select Aadhaar ZIP File:</label>
          <input
            type="file"
            id="zipFile"
            name="zipFile"
            accept=".zip"
            onChange={handleFileChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <small>Usually first 4 digits of Number - Share Code (e.g., 1990)</small>
        </div>
        <button type="submit" id="submitBtn" disabled={loading}>
          <span id="btnText" className={loading ? 'hidden' : ''}>Verify</span>
          <span id="loading" className={loading ? '' : 'hidden'}>Processing...</span>
        </button>
      </form>
      {error && <div id="error" className="error">{error}</div>}
      {result && (
        <div id="result" className="result">
          <h3>Verification Successful!</h3>
          <div className="data-grid">
            <div className="data-section">
              <h4>Personal Information</h4>
              <p><strong>Name:</strong> {result.name}</p>
              <p><strong>Date of Birth:</strong> {result.dob}</p>
              <p><strong>Gender:</strong> {result.gender}</p>
            </div>
            <div className="data-section">
              <h4>Contact Information</h4>
              <p><strong>Phone:</strong> {result.phone}</p>
              <p><strong>Email:</strong> {result.email === '' ? 'N/A' : result.email}</p>
            </div>
            <div className="data-section">
              <h4>Address</h4>
              <p><strong>House:</strong> {result.address.house === '' ? 'N/A' : result.address.house}</p>
              <p><strong>Street:</strong> {result.address.street === '' ? 'N/A' : result.address.street}</p>
              <p><strong>Locality:</strong> {result.address.locality === '' ? 'N/A' : result.address.locality}</p>
              <p><strong>District:</strong> {result.address.district === '' ? 'N/A' : result.address.district}</p>
              <p><strong>State:</strong> {result.address.state === '' ? 'N/A' : result.address.state}</p>
              <p><strong>Pincode:</strong> {result.address.pincode === '' ? 'N/A' : result.address.pincode}</p>
            </div>
          </div>
          <div className="data-section" style={{ textAlign: 'center', marginTop: 20 }}>
            <h4>Photo</h4>
            {result.photoBase64 && result.photoBase64 !== 'N/A' ? (
              <img
                src={`data:image/jpeg;base64,${result.photoBase64}`}
                alt="Aadhaar Photo"
                style={{ maxWidth: 150, maxHeight: 150, borderRadius: 8, border: '1px solid #ccc', boxShadow: '0 2px 8px #0001' }}
              />
            ) : (
              <p>No photo available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

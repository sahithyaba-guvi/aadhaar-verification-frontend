// frontend/script.js
const API_URL = 'http://localhost:3001';

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('zipFile');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const resultDiv = document.getElementById('result');
    
    // Reset UI
    errorDiv.classList.add('hidden');
    resultDiv.classList.add('hidden');
    
    // Validate inputs
    if (!fileInput.files[0]) {
        showError('Please select a ZIP file');
        return;
    }
    
    if (!passwordInput.value) {
        showError('Please enter password');
        return;
    }
    
    // Show loading
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    loading.classList.remove('hidden');
    
    try {
        // Create form data
        const formData = new FormData();
        formData.append('zipFile', fileInput.files[0]);
        formData.append('password', passwordInput.value);
        
        // Send request
        const response = await fetch(`${API_URL}/api/verify`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showResult(data.data);
        } else {
            showError(data.message || 'Verification failed');
        }
        
    } catch (error) {
        showError('Error: ' + error.message);
    } finally {
        // Hide loading
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        loading.classList.add('hidden');
    }
});

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function showResult(data) {
    const resultDiv = document.getElementById('result');
    
    const html = `
        <h3>Verification Successful!</h3>
        <div class="data-grid">
            <div class="data-section">
                <h4>Personal Information</h4>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Date of Birth:</strong> ${data.dob}</p>
                <p><strong>Gender:</strong> ${data.gender}</p>
            </div>
            
            <div class="data-section">
                <h4>Contact Information</h4>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Email:</strong> ${data.email == '' ? 'N/A' : data.email}</p>
            </div>
            
            <div class="data-section">
                <h4>Address</h4>
                <p><strong>House:</strong> ${data.address.house == '' ? 'N/A' : data.address.house}</p>
                <p><strong>Street:</strong> ${data.address.street == '' ? 'N/A' : data.address.street}</p>
                <p><strong>Locality:</strong> ${data.address.locality == '' ? 'N/A' : data.address.locality}</p>
                <p><strong>District:</strong> ${data.address.district == '' ? 'N/A' : data.address.district}</p>
                <p><strong>State:</strong> ${data.address.state == '' ? 'N/A' : data.address.state}</p>
                <p><strong>Pincode:</strong> ${data.address.pincode == '' ? 'N/A' : data.address.pincode}</p>
            </div>
        </div>
        <div class="data-section" style="text-align:center; margin-top:20px;">
            <h4>Photo</h4>
            ${data.photoBase64 && data.photoBase64 !== 'N/A' ? `<img src="data:image/jpeg;base64,${data.photoBase64}" alt="Aadhaar Photo" style="max-width:150px;max-height:150px;border-radius:8px;border:1px solid #ccc;box-shadow:0 2px 8px #0001;" />` : '<p>No photo available</p>'}
        </div>
    `;
    
    resultDiv.innerHTML = html;
    resultDiv.classList.remove('hidden');

    // Automatically download the Aadhaar photo if available
    if (data.photoBase64 && data.photoBase64 !== 'N/A') {
        const link = document.createElement('a');
        link.href = `data:image/jpeg;base64,${data.photoBase64}`;
        link.download = 'aadhaar_photo.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// File validation
document.getElementById('zipFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
            showError('Please select a valid ZIP file');
            e.target.value = '';
        } else if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showError('File size must be less than 10MB');
            e.target.value = '';
        } else {
            document.getElementById('error').classList.add('hidden');
        }
    }
});
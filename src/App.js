import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import * as XLSX from 'xlsx';

const uuid = require('uuid');

function App() {
  const [image, setImage] = useState('');
  const [uploadResultMessage, setUploadResultMessage] = useState('Please Upload an image to authenticate');
  const [visitorName, setVisitorName] = useState('placeholder.png');
  const [isAuth, setAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authHistory, setAuthHistory] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false); 

  const videoRef = useRef(null);

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };
    if (cameraOpen) {
      enableCamera();
    }
  }, [cameraOpen]); // Run whenever cameraOpen state changes

  function resetCamera() {
    videoRef.current.style.display = 'block';
    document.getElementById('captureButton').style.display = 'block';
  }

  function toggleCamera() {
    setCameraOpen(prevState => !prevState); // Toggle cameraOpen state
  }

  function captureImage() {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL();
      setImage(dataURL);
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      resetCamera();
      toggleCamera(); // Close the camera after capturing the image
    }
  }

  function downloadImage() {
    const link = document.createElement('a');
    link.href = image;
    link.download = 'captured_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function sendImage(e) {
    e.preventDefault();
    setVisitorName(image.name);
    const visitorImageName = uuid.v4();
    setIsLoading(true);

    fetch(`https://71uic87xzi.execute-api.us-east-1.amazonaws.com/dev/visitor-image-storage-1/${visitorImageName}.png`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: image
    })
      .then(async () => {
        const response = await authenticate(visitorImageName);
        const timestamp = new Date().toLocaleString();
        
        if (response.Message === 'Success') {
          setAuth(true);
          setUploadResultMessage(`Hi ${response['firstName']} ${response['lastName']}, welcome to work`);
          const authAttempt = { visitorName: `${response['firstName']} ${response['lastName']}`, status: response.Message === 'Success' ? 'Success' : 'Failure', timestamp };
          setAuthHistory(prevHistory => [...prevHistory, authAttempt]);
        } else {
          setAuth(false);
          console.log(response);
          setUploadResultMessage(`Authentication Failed: This person is not an employee`);
        }
      })
      .catch(error => {
        setAuth(false);
        setUploadResultMessage(`There is an error in the authentication process. Please try again.`);
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  async function authenticate(visitorImageName) {
    const requestUrl = `https://71uic87xzi.execute-api.us-east-1.amazonaws.com/dev/employee?${new URLSearchParams({
      objectKey: `${visitorImageName}.png`
    })}`;
    return await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => data)
      .catch(error => console.error(error));
  }

  function exportToExcel() {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const fileName = 'auth_history';

    const ws = XLSX.utils.json_to_sheet(authHistory);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName + fileExtension;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  }

  return (
    <div className="App">
      <h2>FACIAL RECOGNITION SYSTEM</h2>
      <button onClick={toggleCamera}>
        {cameraOpen ? 'Close Camera' : 'Open Camera'}
      </button>
      {cameraOpen && (
        <div className="camera">
          <video ref={videoRef} autoPlay />
          <button id="captureButton" onClick={captureImage}>Capture</button>
        </div>
      )}

      <form onSubmit={sendImage}>
        <input type='file' name='image' onChange={e => setImage(e.target.files[0])} />
        <button type='submit'>Authenticate</button>
      </form>

      <div className="download">
        {image && <img src={image} alt="Captured" height={250} width={250} />}
        {image && <button onClick={downloadImage}>Download</button>}
      </div>
      <img src={require(`./visitors/${visitorName}`)} alt='Visitor' height={250} width={250} />
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className={isAuth ? 'success' : 'failure'}>{uploadResultMessage}</div>
      )}

      <button onClick={exportToExcel}>Download as Excel</button>

      <table className="auth-history">
        <thead>
          <tr>
            <th>Visitor Name</th>
            <th>Status</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {authHistory.map((attempt, index) => (
            <tr key={index}>
              <td>{attempt.visitorName}</td>
              <td>{attempt.status}</td>
              <td>{attempt.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;

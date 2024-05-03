// import { useState } from 'react';
// import './App.css';

// const uuid = require('uuid');

// function App() {
//   const [image, setImage] = useState('');
//   const [uploadResultMessage, setUploadResultMessage] = useState('Please enter an image to authenticate');
//   const [visitorName, setVisitorName] = useState('placeholder.png');
//   const [isAuth, setAuth] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   function sendImage(e) {
//     e.preventDefault();
//     setVisitorName(image.name);
//     const visitorImageName = uuid.v4();
//     setIsLoading(true); // Set loading state to true

//     fetch(`https://71uic87xzi.execute-api.us-east-1.amazonaws.com/dev/visitor-image-storage-1/${visitorImageName}.png`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       },
//       body: image
//     })
//       .then(async () => {
//         const response = await authenticate(visitorImageName);
//         if (response.Message === 'Success') {
//           setAuth(true);
//           setUploadResultMessage(`Hi ${response['firstName']} ${response['lastName']}, welcome to work`);
//         } else {
//           setAuth(false);
//           console.log(response);
//           setUploadResultMessage(`Authentication Failed: This person is not an employee`);
//         }
//       })
//       .catch(error => {
//         setAuth(false);
//         setUploadResultMessage(`There is an error in the authentication process. Please try again.`);
//         console.error(error);
//       })
//       .finally(() => {
//         setIsLoading(false); // Set loading state to false after response
//       });
//   }

//   async function authenticate(visitorImageName) {
//     const requestUrl = `https://71uic87xzi.execute-api.us-east-1.amazonaws.com/dev/employee?${new URLSearchParams({
//       objectKey: `${visitorImageName}.png`
//     })}`;
//     return await fetch(requestUrl, {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//       }
//     })
//       .then(response => response.json())
//       .then(data => data)
//       .catch(error => console.error(error));
//   }

//   return (
//     <div className="App">
//       <h2>FACIAL RECOGNITION SYSTEM</h2>
//       <form onSubmit={sendImage}>
//         <input type='file' name='image' onChange={e => setImage(e.target.files[0])} />
//         <button type='submit'>Authenticate</button>
//       </form>

//       {isLoading ? ( // Display loading icon if isLoading is true
//         <div className="loading">Loading...</div>
//       ) : (
//         <div className={isAuth ? 'success' : 'failure'}>{uploadResultMessage}</div>
//       )}

//       <img src={require(`./visitors/${visitorName}`)} alt='Visitor' height={250} width={250} />
//     </div>
//   );
// }

// export default App;






// // import React, { useState, useEffect } from 'react';
// // import * as faceapi from 'face-api.js';
// // import axios from 'axios';
// // import { ref, push, set, update, get, onValue } from 'firebase/database';
// // import { rtdb, storage  } from '../config/firebase';
// // import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage'; // Import Firebase Storage


// // const Faces = () => {
// //   const [isRegistered, setIsRegistered] = useState(false);
// //   const [currentUser, setCurrentUser] = useState(null);
// //   const [location, setLocation] = useState({ lat: null, lon: null });
// //   const [ipAddress, setIpAddress] = useState('');
// //   const [showPulangButton, setShowPulangButton] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [kegiatan, setKegiatan] = useState('');

// //   const [showDinasButton, setShowDinasButton] = useState(false);

// //   const [cameraStarted, setCameraStarted] = useState(false);
// //   const [mediaRecorder, setMediaRecorder] = useState(null);
// //   const [videoBlob, setVideoBlob] = useState(null); // Untuk menyimpan rekaman video


// //   const kominfoLocation = {
// //     lat: -6.99306,  // Latitude Kominfo Jateng
// //     lon: 110.42083, // Longitude Kominfo Jateng
// //   }

// //   // Fungsi untuk mendapatkan data latitude dan longitude berdasarkan name dari Firebase RTDB
// // function getKominfoLocation( callback) {
// //   const dbRef = firebase.database().ref("kp/magang/batasan");
  
// //   // Query data dari RTDB
// //   dbRef
// //     .orderByChild("name")
// //     .equalTo("KOMINFO JATENG")
// //     .once("value", (snapshot) => {
// //       if (snapshot.exists()) {
// //         snapshot.forEach((childSnapshot) => {
// //           const data = childSnapshot.val();
// //           const location = {
// //             lat: parseFloat(data.latitude),
// //             lon: parseFloat(data.longitude)
// //           };
          
// //           // Mengembalikan lokasi melalui callback
// //           callback(null, location);
// //         });
// //       } else {
// //         callback("Data tidak ditemukan", null);
// //       }
// //     })
// //     .catch((error) => {
// //       callback(error, null);
// //     });
// // }

// // // // Mengambil data lokasi untuk "KOMINFO JATENG"
// // // getKominfoLocation("KOMINFO JATENG", (error, kominfoLocation) => {
// // //   if (error) {
// // //     console.error("Error:", error);
// // //   } else {
// // //     // Gunakan kominfoLocation di sini
// // //     console.log("Latitude:", kominfoLocation.lat);
// // //     console.log("Longitude:", kominfoLocation.lon);

// // //     // Anda bisa melakukan sesuatu dengan kominfoLocation, seperti menampilkan pada peta
// // //   }
// // // });


// // // useEffect(() => {
// // //   // Cleanup on unmount
// // //   return () => {
// // //     if (mediaRecorder && mediaRecorder.stream) {
// // //       mediaRecorder.stream.getTracks().forEach(track => track.stop());
// // //     }
// // //   };
// // // }, [mediaRecorder]);

// //   useEffect(() => {
// //     async function loadModels() {
// //       await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
// //       await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
// //       await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
// //       await faceapi.nets.tinyFaceDetector.loadFromUri('/models');

// //       await faceapi.nets.faceExpressionNet.loadFromUri('/models');
// //     }
// //     loadModels();

// //     async function fetchIpAndLocation() {
// //       try {
// //         const ipRes = await axios.get('https://api.ipify.org?format=json');
// //         setIpAddress(ipRes.data.ip);

// //         // const locationRes = await axios.get(`https://ipapi.co/${ipRes.data.ip}/json/`);
// //         // setLocation({ lat: locationRes.data.latitude, lon: locationRes.data.longitude });
// //       } catch (error) {
// //         // console.error('Failed to fetch IP and location', error);
// //       }
// //     }
// //     fetchIpAndLocation();

// //      // Fungsi untuk mengambil lokasi berbasis GPS
// //     async function fetchGpsLocation() {
// //       if (navigator.geolocation) {
// //         navigator.geolocation.getCurrentPosition(
// //           (position) => {
// //             const { latitude, longitude } = position.coords;
// //             setLocation({ lat: latitude, lon: longitude });
// //           },
// //           (error) => {
// //             console.error("Error fetching GPS location:", error);
// //             // Fallback jika gagal mendapat GPS, bisa Anda tambahkan logic lain di sini
// //           }
// //         );
// //       } else {
// //         console.error("Geolocation is not supported by this browser.");
// //       }
// //     }

// //   fetchGpsLocation();
// //   }, []);

// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       if (isWithinAllowedTimeForPulang()) {
// //         setShowPulangButton(true);
// //       } else {
// //         setShowPulangButton(false);
// //       }
// //     }, 60000); // Check every minute

// //     return () => clearInterval(interval);
// //   }, []);

// //   const generateId = (length = 16) => {
// //     return btoa([...crypto.getRandomValues(new Uint8Array(length))].map(b => String.fromCharCode(b)).join(''));
// //   };

// //   useEffect(() => {
// //     // Cleanup on unmount
// //     return () => {
// //       if (mediaRecorder && mediaRecorder.stream) {
// //         mediaRecorder.stream.getTracks().forEach(track => track.stop());
// //       }
// //     };
// //   }, [mediaRecorder]);

// //   const startVideo = async () => {
// //     setLoading(true);
// //     const video = document.getElementById('video');

// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
// //       video.srcObject = stream;
// //       setCameraStarted(true);

// //       // Start recording the video
// //       const recorder = new MediaRecorder(stream);
// //       setMediaRecorder(recorder);

// //       let chunks = [];
// //       recorder.ondataavailable = (event) => {
// //         if (event.data.size > 0) {
// //           chunks.push(event.data);
// //         }
// //       };

// //       recorder.onstop = () => {
// //         const blob = new Blob(chunks, { type: 'video/mp4' });
// //         setVideoBlob(blob); // Simpan blob video untuk di-upload ke storage
// //       };

// //       recorder.start();
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// //   // const startVideo = async () => {
// //   //   setLoading(true);
// //   //   const video = document.getElementById('video');

// //   //   try {
// //   //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
// //   //     video.srcObject = stream;
// //   //     setCameraStarted(true);

// //   //     const recorder = new MediaRecorder(stream);
// //   //     setMediaRecorder(recorder);

// //   //     let chunks = [];
// //   //     recorder.ondataavailable = (event) => {
// //   //       if (event.data.size > 0) {
// //   //         chunks.push(event.data);
// //   //       }
// //   //     };

// //   //     recorder.onstop = () => {
// //   //       const blob = new Blob(chunks, { type: 'video/mp4' });
// //   //       setVideoBlob(blob); // Simpan blob video untuk di-upload
// //   //     };

// //   //     recorder.start();
// //   //   } finally {
// //   //     setLoading(false);
// //   //   }
// //   // };
// //   // const startVideo = async () => {
// //   //   setLoading(true);
// //   //   const video = document.getElementById('video');

// //   //   try {
// //   //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
// //   //     video.srcObject = stream;
// //   //     setCameraStarted(true);

// //   //     // Start recording the video
// //   //     const recorder = new MediaRecorder(stream);
// //   //     setMediaRecorder(recorder);

// //   //     let chunks = [];
// //   //     recorder.ondataavailable = (event) => {
// //   //       if (event.data.size > 0) {
// //   //         chunks.push(event.data);
// //   //       }
// //   //     };

// //   //     recorder.onstop = () => {
// //   //       const blob = new Blob(chunks, { type: 'video/mp4' });
// //   //       setVideoBlob(blob); // Simpan blob video untuk di-upload ke storage
// //   //     };

// //   //     recorder.start();
// //   //   } finally {
// //   //     setLoading(false);
// //   //   }
// //   // };
// //   // const startVideo = async () => {
// //   //   setLoading(true);
// //   //   const video = document.getElementById('video');

// //   //     try {
// //   //       const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
// //   //       video.srcObject = stream;
// //   //       setCameraStarted(true);
// //   //     } 
// //   //     finally {
// //   //       setLoading(false);
// //   //     }

// //   // };








// //   import React, { useState, useEffect, useRef } from 'react';
// // import * as faceapi from 'face-api.js';
// // import axios from 'axios';
// // import { ref, push, set, update, get, onValue } from 'firebase/database';
// // import { rtdb, storage  } from '../config/firebase';
// // import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage'; // Import Firebase Storage



// // const Faces = () => {
// //   const [isRegistered, setIsRegistered] = useState(false);
// //   const [location, setLocation] = useState(null);//{ lat: null, lon: null }
// //   const [latitude, setLatitude] = useState(null);
// //   const [longitude, setLongitude] = useState(null);
// //   const [ipAddress, setIpAddress] = useState('');
// //   const [loading, setLoading] = useState(false);
  
// //   const [cameraStarted, setCameraStarted] = useState(false);
// //   const currentHour = new Date().getHours(); // Mendapatkan jam saat ini
// //   const canvasRef = useRef(null);
// //   const videoRef = useRef(null);  
// //   const kominfoLocation = {
// //     lat: -6.99306,  // Latitude Kominfo Jateng
// //     lon: 110.42083, // Longitude Kominfo Jateng
// //   }
 

// //   const startVideo = async () => {
// //     setLoading(true);
// //     await loadModelsAndStartVideo();
// //     // setCameraStarted(true);
// //     setLoading(false);
// //   };

// //   const loadModelsAndStartVideo = async () => {
// //     // Load model Face API
// //     await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
// //     await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
// //     await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
// //     await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
// //     await faceapi.nets.faceExpressionNet.loadFromUri('/models');

// //     // Akses video dari elemen yang ada
// //     // const video = document.getElementById('video');
// //     const video = videoRef.current;
    
// //     // Mulai video webcam
// //     // navigator.mediaDevices.getUserMedia({ video: {} })
// //     //   .then(stream => {
// //     //     video.srcObject = stream;
// //     //   })
// //     //   .catch(err => console.error("Error accessing webcam: ", err));
// //         const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
// //         video.srcObject = stream;
// //         setCameraStarted(true);

// //     // Saat video mulai diputar, jalankan deteksi wajah secara berkala
// //     video.addEventListener('play', () => {
// //       // Pastikan canvas dan video sudah siap
// //       if (canvasRef.current && video) {
// //         const canvas = canvasRef.current;

// //         canvas.width = video.videoWidth;
// //         canvas.height = video.videoHeight;

// //         const displaySize = { width: video.videoWidth, height: video.videoHeight };
        
// //         // Sesuaikan dimensi canvas dengan video
// //         faceapi.matchDimensions(canvas, displaySize);
        
// //         setInterval(async () => {
// //           const detections = await faceapi.detectAllFaces(
// //             video,
// //             new faceapi.TinyFaceDetectorOptions()
// //           ).withFaceLandmarks().withFaceDescriptors();

// //           // Bersihkan canvas sebelum menggambar
// //           const resizedDetections = faceapi.resizeResults(detections, displaySize);
// //           const ctx = canvas.getContext('2d');
// //           ctx.clearRect(0, 0, canvas.width, canvas.height);

// //           // Gambar deteksi wajah dan landmark di canvas
// //           faceapi.draw.drawDetections(canvas, resizedDetections);
// //           faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

// //           // // Periksa kecocokan wajah dengan API
// //           // for (const detection of resizedDetections) {
// //           //   const userDescriptor = detection.descriptor;
// //           //   const descriptorResponse = await axios.post('/api/faces', {
// //           //     action: 'checkDescriptor',
// //           //     descriptor: Array.from(userDescriptor) // Mengonversi ke array
// //           //   });

// //           //   if (descriptorResponse.data.exists) {
// //           //     const matchedName = descriptorResponse.data.name;
// //           //     // Tampilkan nama di kanvas
// //           //     ctx.font = '24px Arial';
// //           //     ctx.fillStyle = 'red';
// //           //     ctx.fillText(matchedName, detection.detection.box.x, detection.detection.box.y);
// //           //   }
// //           // }
// //         }, 100);
// //       }
// //     });
// //   };

  
// //   const fetchIpAndLocation = async () => {
// //     try {
// //       const ipRes = await axios.get('https://api.ipify.org?format=json');
// //       setIpAddress(ipRes.data.ip);

// //       // Jika ingin menggunakan API eksternal untuk lokasi IP:
// //       // const locationRes = await axios.get(`https://ipapi.co/${ipRes.data.ip}/json/`);
// //       // setLocation({ latitude: locationRes.data.latitude, longitude: locationRes.data.longitude });
// //     } catch (error) {
// //       console.error('Failed to fetch IP and location', error);
// //     }
// //   };
// //    // Fungsi untuk mengambil lokasi berbasis GPS
// //    const fetchGpsLocation = async () => {
// //     if (navigator.geolocation) {
// //       navigator.geolocation.getCurrentPosition(
// //         (position) => {
// //           const { latitude, longitude } = position.coords;
          
// //           setLocation({latitude,longitude });
// //           setLatitude(latitude);
// //           setLongitude(longitude);
          
// //         },
// //         (error) => {
// //           console.error("Error fetching GPS location:", error);
// //           // Fallback jika gagal mendapat GPS, bisa Anda tambahkan logic lain di sini
// //         }
// //       );
// //     } else {
// //       console.error("Geolocation is not supported by this browser.");
// //     }
// //   };
 
// //   const calculateDistance = (lat1, lon1, lat2, lon2) => {
// //     const toRadians = (degree) => degree * (Math.PI / 180);
// //     const R = 6371; // Radius bumi dalam kilometer
// //     const dLat = toRadians(lat2 - lat1);
// //     const dLon = toRadians(lon2 - lon1);
// //     const a =
// //       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
// //       Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
// //       Math.sin(dLon / 2) * Math.sin(dLon / 2);
// //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// //     return R * c; // Jarak dalam kilometer
// //   };

// //   const checkLocationAndDistance = async () => {
// //     if (latitude && longitude) {
// //       const distanceToKominfo = calculateDistance(latitude, longitude, kominfoLocation.lat, kominfoLocation.lon);
    
// //       if (distanceToKominfo > 2) {
// //         alert('Lokasi Anda tidak sesuai dengan lokasi kantor.');
// //         setLoading(false); 
// //       }
// //       //  else {
// //       //   // alert('Lokasi Anda sesuai dengan lokasi kantor.');
// //       //   setLoading(false); // Jika loading sudah dilakukan
// //       // }
// //     }
// //   };

// //   // useEffect untuk menjalankan pengecekan setelah lokasi diperoleh
// //   useEffect(() => {
// //     fetchIpAndLocation();
// //     fetchGpsLocation();
    
// //     checkLocationAndDistance();
// //   }, [latitude, longitude]); // Jalankan saat latitude atau longitude berubah

// //   const isWithinAllowedTime = () => {
// //     const now = new Date();
// //     const hours = now.getUTCHours() + 7; // Convert to WIB (UTC+7)
// //     const minutes = now.getUTCMinutes();
// //     const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

// //      return day >= 1 && day <= 5 && (hours >= 4 && (hours < 9 || (hours === 9 && minutes === 0)));
// //   }; 

// //   const isWithinAllowedTimeForPulang = () => {
// //     const now = new Date();
// //     const hours = now.getUTCHours() + 7; // Convert to WIB (UTC+7)
// //     const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

// //     // Batasan waktu pulang
// //     if (day === 5) { // Jumat
// //       return hours >= 13 && hours < 18;
// //     } else if (day >= 1 && day <= 4) { // Senin - Kamis
// //       return hours >= 14 && hours < 18;
// //     }
// //     return false;
// //   };

// //    // Placeholder function for handleRegister
// //   const handleRegister = async (userNim) => {
// //     setLoading(true);
// //     const video = document.getElementById('video');
// //     const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();

// //     if (detections.length === 0) {
// //         alert('Wajah tidak terdeteksi.');
// //         return;
// //     }

// //     const userDescriptor = detections[0].descriptor;
// //     const kpAbsenRef = ref(rtdb, 'kp/magang/absen');
// //     const snapshot = await get(kpAbsenRef);
// //     const absenData = snapshot.val();
// //     let descriptorExists = false;
// //     let existingUserId = null;

// //     if (absenData) {
// //         for (const key in absenData) {
// //             const userData = absenData[key];
// //             if (userData && userData.descriptor) {
// //                 const storedDescriptor = new Float32Array(userData.descriptor);
// //                 const distance = faceapi.euclideanDistance(userDescriptor, storedDescriptor);

// //                 if (distance < 0.5) { // Sesuaikan threshold jika perlu
// //                     descriptorExists = true;
// //                     existingUserId = key; // Simpan ID user yang sudah ada
// //                     break;
// //                 }
// //             }
// //         }
// //     }

// //     if (descriptorExists) {
// //         alert('Wajah sudah terdaftar. Silakan coba lagi nanti.');
// //        } else {
// //         const userName = prompt('Masukkan nama Anda:');
// //         const kpUsersRef = ref(rtdb, 'kp/magang/users');
// //         const usersSnapshot = await get(kpUsersRef);
// //         const usersData = usersSnapshot.val();
// //         let nameExists = false;
// //         let isUserActive = false;

// //         for (const key in usersData) {
// //             const userData = usersData[key];
// //             if (userData && userData.name === userName) {
// //                 nameExists = true;
// //                 existingUserId = key;
// //                 if (userData.status === 'ACTIVE') {
// //                     isUserActive = true;
// //                     return userData.nim;
// //                 }
// //                 break;
// //             }
// //         }

// //         //const newUserRef = push(kpUsersRef); // Firebase akan otomatis memberikan ID unik di sini

// //         if (nameExists) {
// //           if (isUserActive) {
// //             const newUser = {
// //                 id: generateId(),
// //                 name: userName,
// //                 nim: userNim,
// //                 descriptor: Array.from(userDescriptor),
                
// //             };
          

// //             const kpUsersRef = ref(rtdb, `kp/magangKom/absen/${newUser.id}`);
// //             await set(kpUsersRef, newUser);

// //             alert('Registrasi berhasil dan data disimpan untuk absen!');
// //             setIsRegistered(true);
// //         } else {
// //             alert('Nama tidak ditemukan di sistem. Silakan hubungi admin.');
// //           }
// //       }else {
// //         alert('Nama tidak ditemukan di sistem. Silakan hubungi admin.');
// //       }
// //     }
// //     setLoading(false);
// //   };
  
  

// //   return (
// //     <>
      
// //     <div style={{ position: 'relative', width: '100%', maxWidth: '720px' }}>
// //     <video ref={videoRef} autoPlay muted style={{ width: '100%', height: 'auto', display: cameraStarted ? 'block' : 'none'  }} />
// //     <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 'auto',display: cameraStarted ? 'block' : 'none'  }} />
  
// //     </div>
// //     {!cameraStarted && (
// //       <span onClick={startVideo} disabled={loading} type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">{loading ? 'Loading...' : 'Start Kamera'}</span> 
// //     )}
// //     <span onClick={handleRegister} disabled={loading} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2  dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">{loading ? 'Loading...' : 'Registrasi'}</span> 
                 
      
// //     </>
// //   );
// // };

// // export default Faces;
















// import React, { useState, useEffect, useRef } from 'react';
// import * as faceapi from 'face-api.js';
// import axios from 'axios';
// import { ref, push, set, update, get, onValue } from 'firebase/database';
// import { rtdb, storage  } from '../config/firebase';
// import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage'; // Import Firebase Storage



// const Faces = () => {
//   const [isRegistered, setIsRegistered] = useState(false);
//   const [location, setLocation] = useState(null);//{ lat: null, lon: null }
//   const [latitude, setLatitude] = useState(null);
//   const [longitude, setLongitude] = useState(null);
//   const [ipAddress, setIpAddress] = useState('');
//   const [loading, setLoading] = useState(false);
  
//   const [cameraStarted, setCameraStarted] = useState(false);
//   const currentHour = new Date().getHours(); // Mendapatkan jam saat ini
//   const canvasRef = useRef(null);
//   const videoRef = useRef(null);  
//   const kominfoLocation = {
//     lat: -6.99306,  // Latitude Kominfo Jateng
//     lon: 110.42083, // Longitude Kominfo Jateng
//   }
 

//   const startVideo = async () => {
//     setLoading(true);
//     await loadModelsAndStartVideo();
//     // setCameraStarted(true);
//     setLoading(false);
//   };

//   const loadModelsAndStartVideo = async () => {
//     // Load model Face API
//     await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
//     await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
//     await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
//     await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
//     await faceapi.nets.faceExpressionNet.loadFromUri('/models');

//     // Akses video dari elemen yang ada
//     // const video = document.getElementById('video');
//     const video = videoRef.current;
    
//     // Mulai video webcam
//     // navigator.mediaDevices.getUserMedia({ video: {} })
//     //   .then(stream => {
//     //     video.srcObject = stream;
//     //   })
//     //   .catch(err => console.error("Error accessing webcam: ", err));
//         const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
//         video.srcObject = stream;
//         setCameraStarted(true);

//     // Saat video mulai diputar, jalankan deteksi wajah secara berkala
//     video.addEventListener('play', () => {
//       // Pastikan canvas dan video sudah siap
//       if (canvasRef.current && video) {
//         const canvas = canvasRef.current;

//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;

//         const displaySize = { width: video.videoWidth, height: video.videoHeight };
        
//         // Sesuaikan dimensi canvas dengan video
//         faceapi.matchDimensions(canvas, displaySize);
        
//         setInterval(async () => {
//           const detections = await faceapi.detectAllFaces(
//             video,
//             new faceapi.TinyFaceDetectorOptions()
//           ).withFaceLandmarks().withFaceDescriptors();

//           // Bersihkan canvas sebelum menggambar
//           const resizedDetections = faceapi.resizeResults(detections, displaySize);
//           const ctx = canvas.getContext('2d');
//           ctx.clearRect(0, 0, canvas.width, canvas.height);

//           // Gambar deteksi wajah dan landmark di canvas
//           faceapi.draw.drawDetections(canvas, resizedDetections);
//           faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

//           // // Periksa kecocokan wajah dengan API
//           // for (const detection of resizedDetections) {
//           //   const userDescriptor = detection.descriptor;
//           //   const descriptorResponse = await axios.post('/api/faces', {
//           //     action: 'checkDescriptor',
//           //     descriptor: Array.from(userDescriptor) // Mengonversi ke array
//           //   });

//           //   if (descriptorResponse.data.exists) {
//           //     const matchedName = descriptorResponse.data.name;
//           //     // Tampilkan nama di kanvas
//           //     ctx.font = '24px Arial';
//           //     ctx.fillStyle = 'red';
//           //     ctx.fillText(matchedName, detection.detection.box.x, detection.detection.box.y);
//           //   }
//           // }
//         }, 100);
//       }
//     });
//   };

//    const fetchIpAndLocation = async () => {
//     try {
//       const ipRes = await axios.get('https://api.ipify.org?format=json');
//       setIpAddress(ipRes.data.ip);

//       // Jika ingin menggunakan API eksternal untuk lokasi IP:
//       // const locationRes = await axios.get(`https://ipapi.co/${ipRes.data.ip}/json/`);
//       // setLocation({ latitude: locationRes.data.latitude, longitude: locationRes.data.longitude });
//     } catch (error) {
//       console.error('Failed to fetch IP and location', error);
//     }
//   };
//    // Fungsi untuk mengambil lokasi berbasis GPS
//    const fetchGpsLocation = async () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
          
//           setLocation({latitude,longitude });
//           setLatitude(latitude);
//           setLongitude(longitude);
          
//         },
//         (error) => {
//           console.error("Error fetching GPS location:", error);
//           // Fallback jika gagal mendapat GPS, bisa Anda tambahkan logic lain di sini
//         }
//       );
//     } else {
//       console.error("Geolocation is not supported by this browser.");
//     }
//   };
 
//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const toRadians = (degree) => degree * (Math.PI / 180);
//     const R = 6371; // Radius bumi dalam kilometer
//     const dLat = toRadians(lat2 - lat1);
//     const dLon = toRadians(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c; // Jarak dalam kilometer
//   };

//   const checkLocationAndDistance = async () => {
//     if (latitude && longitude) {
//       const distanceToKominfo = calculateDistance(latitude, longitude, kominfoLocation.lat, kominfoLocation.lon);
    
//       if (distanceToKominfo > 2) {
//         alert('Lokasi Anda tidak sesuai dengan lokasi kantor.');
//         setLoading(false); 
//       }
//       //  else {
//       //   // alert('Lokasi Anda sesuai dengan lokasi kantor.');
//       //   setLoading(false); // Jika loading sudah dilakukan
//       // }
//     }
//   };

//   // useEffect untuk menjalankan pengecekan setelah lokasi diperoleh
//   useEffect(() => {
//     fetchIpAndLocation();
//     fetchGpsLocation();
    
//     checkLocationAndDistance();
//   }, [latitude, longitude]); // Jalankan saat latitude atau longitude berubah

//   const isWithinAllowedTime = () => {
//     const now = new Date();
//     const hours = now.getUTCHours() + 7; // Convert to WIB (UTC+7)
//     const minutes = now.getUTCMinutes();
//     const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

//      return day >= 1 && day <= 5 && (hours >= 4 && (hours < 9 || (hours === 9 && minutes === 0)));
//   }; 

//   const isWithinAllowedTimeForPulang = () => {
//     const now = new Date();
//     const hours = now.getUTCHours() + 7; // Convert to WIB (UTC+7)
//     const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

//     // Batasan waktu pulang
//     if (day === 5) { // Jumat
//       return hours >= 13 && hours < 18;
//     } else if (day >= 1 && day <= 4) { // Senin - Kamis
//       return hours >= 14 && hours < 18;
//     }
//     return false;
//   };

//    // Placeholder function for handleRegister
//   const handleRegister = async (userNim) => {
//     setLoading(true);
//     const video = document.getElementById('video');
//     const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();

//     if (detections.length === 0) {
//         alert('Wajah tidak terdeteksi.');
//         return;
//     }

//     const userDescriptor = detections[0].descriptor;
//     const kpAbsenRef = ref(rtdb, 'kp/magang/absen');
//     const snapshot = await get(kpAbsenRef);
//     const absenData = snapshot.val();
//     let descriptorExists = false;
//     let existingUserId = null;

//     if (absenData) {
//         for (const key in absenData) {
//             const userData = absenData[key];
//             if (userData && userData.descriptor) {
//                 const storedDescriptor = new Float32Array(userData.descriptor);
//                 const distance = faceapi.euclideanDistance(userDescriptor, storedDescriptor);

//                 if (distance < 0.5) { // Sesuaikan threshold jika perlu
//                     descriptorExists = true;
//                     existingUserId = key; // Simpan ID user yang sudah ada
//                     break;
//                 }
//             }
//         }
//     }

//     if (descriptorExists) {
//         alert('Wajah sudah terdaftar. Silakan coba lagi nanti.');
//        } else {
//         const userName = prompt('Masukkan nama Anda:');
//         const kpUsersRef = ref(rtdb, 'kp/magang/users');
//         const usersSnapshot = await get(kpUsersRef);
//         const usersData = usersSnapshot.val();
//         let nameExists = false;
//         let isUserActive = false;

//         for (const key in usersData) {
//             const userData = usersData[key];
//             if (userData && userData.name === userName) {
//                 nameExists = true;
//                 existingUserId = key;
//                 if (userData.status === 'ACTIVE') {
//                     isUserActive = true;
//                     return userData.nim;
//                 }
//                 break;
//             }
//         }

//         //const newUserRef = push(kpUsersRef); // Firebase akan otomatis memberikan ID unik di sini

//         if (nameExists) {
//           if (isUserActive) {
//             const newUser = {
//                 id: generateId(),
//                 name: userName,
//                 nim: userNim,
//                 descriptor: Array.from(userDescriptor),
                
//             };
          

//             const kpUsersRef = ref(rtdb, `kp/magangKom/absen/${newUser.id}`);
//             await set(kpUsersRef, newUser);

//             alert('Registrasi berhasil dan data disimpan untuk absen!');
//             setIsRegistered(true);
//         } else {
//             alert('Nama tidak ditemukan di sistem. Silakan hubungi admin.');
//           }
//       }else {
//         alert('Nama tidak ditemukan di sistem. Silakan hubungi admin.');
//       }
//     }
//     setLoading(false);
//   };
  

//   return (
//     <>
      
//     <div style={{ position: 'relative', width: '100%', maxWidth: '720px' }}>
//     <video ref={videoRef} autoPlay muted style={{ width: '100%', height: 'auto', display: cameraStarted ? 'block' : 'none'  }} />
//     <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 'auto',display: cameraStarted ? 'block' : 'none'  }} />
  
//     </div>
//     {!cameraStarted && (
//       <span onClick={startVideo} disabled={loading} type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">{loading ? 'Loading...' : 'Start Kamera'}</span> 
//     )}
//       <span onClick={handleRegister} disabled={loading} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2  dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">{loading ? 'Loading...' : 'Registrasi'}</span> 
     
      
//     </>
//   );
// };

// export default Faces;


import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { ref, push, set, update, get, onValue } from 'firebase/database';
import { rtdb, storage  } from '../config/firebase';
import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage'; // Import Firebase Storage



const Faces = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [ipAddress, setIpAddress] = useState('');
  const [showPulangButton, setShowPulangButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kegiatan, setKegiatan] = useState('');

  const [showDinasButton, setShowDinasButton] = useState(false);

  const [cameraStarted, setCameraStarted] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null); // Untuk menyimpan rekaman video

  const kominfoLocation = {
    lat: -6.99306,  // Latitude Kominfo Jateng
    lon: 110.42083, // Longitude Kominfo Jateng
  }

  useEffect(() => {
    async function loadModels() {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');

      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    }
    loadModels();

    async function fetchIpAndLocation() {
      try {
        const ipRes = await axios.get('https://api.ipify.org?format=json');
        setIpAddress(ipRes.data.ip);

        const locationRes = await axios.get(`https://ipapi.co/${ipRes.data.ip}/json/`);
        //setLocation({ lat: locationRes.data.latitude, lon: locationRes.data.longitude });
      } catch (error) {
        // console.error('Failed to fetch IP and location', error);
      }
    }
    fetchIpAndLocation();

    // Fungsi untuk mengambil lokasi berbasis GPS
    async function fetchGpsLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lon: longitude });
          },
          (error) => {
            console.error("Error fetching GPS location:", error);
            // Fallback jika gagal mendapat GPS, bisa Anda tambahkan logic lain di sini
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    }

  fetchGpsLocation();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isWithinAllowedTimeForPulang()) {
        setShowPulangButton(true);
      } else {
        setShowPulangButton(false);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const generateId = (length = 16) => {
    return btoa([...crypto.getRandomValues(new Uint8Array(length))].map(b => String.fromCharCode(b)).join(''));
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (mediaRecorder && mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaRecorder]);

  const startVideo = async () => {
    setLoading(true);
    const video = document.getElementById('video');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      setCameraStarted(true);

      // Start recording the video
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      let chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        setVideoBlob(blob); // Simpan blob video untuk di-upload ke storage
      };

      recorder.start();
    } finally {
      setLoading(false);
    }
  };

  const isWithinAllowedTime = () => {
    
    const now = new Date();
    const hours = now.getUTCHours() + 7; // Convert to WIB (UTC+7)
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Batasan waktu pulang
    if (day >= 1 && day <= 5) { // Jumat
      return hours > 4 && hours < 9;
    }
    return false;
  };

  const isWithinAllowedTimeForPulang = () => {
    const now = new Date();
    const hours = now.getUTCHours() + 7; // Convert to WIB (UTC+7)
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Batasan waktu pulang
    if (day === 5) { // Jumat
      return hours > 13 && hours < 17;
    } else if (day >= 1 && day <= 4) { // Senin - Kamis
      return hours >= 14 && hours < 17;
    }
    return false;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degree) => degree * (Math.PI / 180);
    const R = 6371; // Radius bumi dalam kilometer
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Jarak dalam kilometer
  };

  const handleScan = async () => {
    setLoading(true);
    if (!isWithinAllowedTime()) {
        alert('Absensi hanya bisa dilakukan antara pukul 06:00 WIB dan 09:00 WIB pada hari Senin hingga Jumat.');
        setLoading(false);
        return;
    }

    const video = document.getElementById('video');
    const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();

    if (detections.length === 0) {
        alert('Wajah tidak terdeteksi.');
        setLoading(false);
        return;
    }

    const userDescriptor = detections[0].descriptor;
    const currentLocation = location; // Assumes location is defined

    // Calculate distance to Kominfo
    const distanceToKominfo = calculateDistance(currentLocation.lat, currentLocation.lon, kominfoLocation.lat, kominfoLocation.lon);
  
    if (distanceToKominfo > 3) { // Radius batas jarak dalam kilometer
      //  await handleOutOfTownAttendance('userId', 'userName'); // Replace with actual user ID and name if available
       
        alert('Lokasi Anda tidak sesuai dengan lokasi absensi.');
        setLoading(false);
        return;
    }

    // Fetch all attendance data
    const kpAbsenRef = ref(rtdb, 'kp/magang/absen/');
    const absenSnapshot = await get(kpAbsenRef);
    const absenData = absenSnapshot.val();
    let found = false;
    let matchedName = null;
    let currentUserId = null;

    if (absenData) {
        for (const key in absenData) {
            const userData = absenData[key];
            if (userData && userData.descriptor) {
                const storedDescriptor = new Float32Array(userData.descriptor);
                const distance = faceapi.euclideanDistance(userDescriptor, storedDescriptor);

                if (distance < 0.6) { // Adjust threshold as needed
                    found = true;
                    matchedName = userData.name; // Save the name that matches
                    currentUserId = key; // Save user ID

                    break; // Exit loop once a match is found
                }
            }
        }
    }

    if (found && matchedName) {
        // Fetch user details by name
        const kpUsersRef = ref(rtdb, 'kp/magang/users/');
        const usersSnapshot = await get(kpUsersRef);
        const usersData = usersSnapshot.val();

        if (usersData) {
            const userDetails = Object.values(usersData).find(user => user.name === matchedName);

            if (userDetails && userDetails.status === 'ACTIVE') {
              // const attendanceRef = ref(rtdb, `kp/magang/absenu/${currentUserId}/attendance/${formattedDate}`);
              // const attendanceSnapshot = await get(attendanceRef);

              // if (attendanceSnapshot.exists() && attendanceSnapshot.val().timot) {
              //     alert('Anda sudah melakukan absensi pulang hari ini.');
              //     setLoading(false);
              // }
                mediaRecorder.stop();
  
                // Save attendance and upload video
                
                if (videoBlob) {
                  const absensiId = await saveAttendance(currentUserId, matchedName);
                  await hadirVideo(absensiId, videoBlob); // Upload video to Firebase Storage
                  alert(`Absensi berhasil untuk: ${matchedName}\nSemangat Menjalani hari ini`);
                  setLoading(true);
                }
                else {
                  alert('ulangi sekali lagi untuk validasi data.');
                  setLoading(false);
                }
              
            } else {
                alert('Status pengguna tidak aktif. Silakan hubungi admin.');
                setLoading(false);
            }
        } else {
            alert('Pengguna tidak ditemukan di sistem.');
            setLoading(false);
        }
    } else {
        alert('Pengguna tidak ditemukan. Silakan registrasi terlebih dahulu.');
        // setIsRegistered(false);
    }

    setLoading(false);
  };

  const saveAttendance = async (userId, userName, userNim) => {
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0];
    const hours = date.getUTCHours() + 7; // Convert to WIB (UTC+7)
    const minutes = date.getUTCMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} WIB`;

    const attendanceRef = ref(rtdb, `kp/magang/absen/${userId}/attendance/${formattedDate}`);
    const attendanceSnapshot = await get(attendanceRef);

    if (attendanceSnapshot.exists()) {
      alert('Anda sudah melakukan absensi untuk hari ini.');
      return;
    } 

    const attendanceData = {
      date: formattedDate,
      timein: formattedTime, // Time saat absensi
      ip: ipAddress,
      location,
      timot: '', 
      kegiatan: '', 
    };

    await set(attendanceRef, attendanceData);

    // Simpan data absenh di tabel absenh
    const absenhRef = ref(rtdb, `kp/magang/absenh/${formattedDate}/attendance`);
    const newAbsenhRef = push(absenhRef);
    await set(newAbsenhRef, {
      name: userName,
      // nim: userNim,
      idabsen:  userId,
      location,
      date: formattedDate,
      timein: formattedTime,
      ip: ipAddress,
      timot: '', // Nilai ini akan diupdate saat absensi pulang
      kegiatan: '', // Nilai ini akan diupdate saat absensi pulang
    });

    // alert('Absensi berhasil disimpan!');
    const absensiId = newAbsenhRef.key;// Simpan absensiId untuk digunakan nanti
    sessionStorage.setItem('absensiId', absensiId); // Simpan absensiId ke sessionStorage untuk digunakan saat absensi pulang
    //alert('Absensi berhasil disimpan!');
    return absensiId;
  };

  const hadirVideo = async (absensiId, videoBlob) => {
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0];
    const videoFileName = `${absensiId}.mp4`;
    const videoStorageRef = storageRef(storage, `kp/magang/absenh/${formattedDate}/attendance/${absensiId}/bhadir/${videoFileName}`);

    try {
      await uploadBytes(videoStorageRef, videoBlob);
      const videoURL = await getDownloadURL(videoStorageRef);

      // Simpan URL video ke dalam absensi
      const attendanceRef = ref(rtdb, `kp/magang/absenh/${formattedDate}/attendance/${absensiId}/bhadir`);
      await set(attendanceRef, videoURL);
      // console.log('Video berhasil di-upload dan URL disimpan.');
    } catch (error) {
      // console.error('Gagal upload video:', error);
    }
  };

  const handlePulang = async () => {
    setLoading(true);

    if (!isWithinAllowedTimeForPulang()) {
        alert('Absensi pulang hanya dapat dilakukan pada jam-jam tertentu.');
        setLoading(false);
        return;
    }

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Formats date as 'YYYY-MM-DD'

    const video = document.getElementById('video');
    const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();

    if (detections.length === 0) {
        alert('Wajah tidak terdeteksi.');
        setLoading(false);
        return;
    }

    const userDescriptor = detections[0].descriptor;
    const currentLocation = location; // Assumes location is defined

    // Calculate distance to Kominfo
    const distanceToKominfo = calculateDistance(currentLocation.lat, currentLocation.lon, kominfoLocation.lat, kominfoLocation.lon);
  
    if (distanceToKominfo > 3) { // Radius batas jarak dalam kilometer
        alert('Lokasi Anda tidak sesuai dengan lokasi absensi.');
        setLoading(false);
        return;
    }

    const kpAbsenRef = ref(rtdb, 'kp/magang/absen/');
    const absenSnapshot = await get(kpAbsenRef);
    const absenData = absenSnapshot.val();
    let found = false;
    let currentUserId = null;
    let matchedName = null;

    if (absenData) {
        for (const key in absenData) {
            const userData = absenData[key];
            if (userData && userData.descriptor) {
                const storedDescriptor = new Float32Array(userData.descriptor);
                const distance = faceapi.euclideanDistance(userDescriptor, storedDescriptor);

                if (distance < 0.6) { // Adjust threshold as needed
                    found = true;
                    currentUserId = key;
                    matchedName = userData.name; // Save the name that matches
                    break; // Exit loop once a match is found
                }
            }
        }
    }

    if (found && matchedName) {
      // Fetch corresponding user data from kp/magang/users
      const kpUsersRef = ref(rtdb, 'kp/magang/users');
      const usersSnapshot = await get(kpUsersRef);
      const usersData = usersSnapshot.val();

      if (usersData) {
          const userDetails = Object.values(usersData).find(user => user.name === matchedName);

          if (userDetails && userDetails.status === 'ACTIVE') {
            const attendanceRef = ref(rtdb, `kp/magang/absenu/${currentUserId}/attendance/${formattedDate}`);
              const attendanceSnapshot = await get(attendanceRef);

              if (attendanceSnapshot.exists() && attendanceSnapshot.val().timot) {
                  alert('Anda sudah melakukan absensi pulang hari ini.');
                  setLoading(false);
              }
              // Check if user has already clocked out
              mediaRecorder.stop();
                // const kegiatanInput = prompt('Masukkan kegiatan hari ini:');
                if (videoBlob) {
                  const kegiatanInput = prompt('Masukkan kegiatan hari ini:');
                  
                  if (kegiatanInput) {
                    const absensiId = await saveAttendance1(currentUserId, matchedName, kegiatanInput);
                    await pulangVideo(absensiId, videoBlob); // Upload video to Firebase Storage
                    alert(`Absensi pulang berhasil: ${matchedName}\nTerima kasih untuk hari ini`);
                    setLoading(true);
                  }
                  else {
                    alert('Kegiatan tidak boleh kosong.');
                    setLoading(false);
                  }
                }
                else {
                  alert('ulangi sekali lagi untuk validasi data.');
                  setLoading(false);
                }
          } else {
              alert('Status pengguna tidak aktif. Silakan hubungi admin.');
          }
      } else {
          alert('Pengguna tidak ditemukan di sistem.');
      }
  } else {
      alert('Pengguna tidak ditemukan. Silakan registrasi terlebih dahulu.');
      setIsRegistered(false);
  }

  setLoading(false);
};

    
  const saveAttendance1 = async (userId, userName, kegiatan) => {
    const date = new Date();
    
    const formattedDate = date.toISOString().split('T')[0];
    const hours = date.getUTCHours() + 7; // Convert to WIB (UTC+7)
    const minutes = date.getUTCMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} WIB`;

    // Path for attendance record
    const attendanceRef = ref(rtdb, `kp/magang/absen/${userId}/attendance/${formattedDate}`);
    const attendanceSnapshot = await get(attendanceRef);

    if (attendanceSnapshot.exists() && attendanceSnapshot.val().timot) {
        alert('Absensi pulang sudah tercatat sebelumnya.');
        return;
    }

    // Create or update record
    await update(attendanceRef, {
        timot: formattedTime,
        kegiatan: kegiatan
    });

    // console.log(`Attendance data for ${userId} on ${formattedDate} has been saved.`);

    
    const absensiId = sessionStorage.getItem('absensiId'); 
    // Save a copy based on username
    const absenhRef = ref(rtdb, `kp/magang/absenh/${formattedDate}/attendance/${absensiId}`);
    await update(absenhRef, {
        timot: formattedTime,
        kegiatan: kegiatan
    });

    // console.log(`Absenh data for ${userName} on ${formattedDate} has been updated.`);

    //alert('Absensi berhasil.');
    return absensiId;
  };

  const pulangVideo = async (absensiId, videoBlob) => {
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0];
    const videoFileName = `${absensiId}.mp4`;
    const videoStorageRef = storageRef(storage, `kp/magang/absenh/${formattedDate}/attendance/${absensiId}/bpulang/${videoFileName}`);

    try {
      await uploadBytes(videoStorageRef, videoBlob);
      const videoURL = await getDownloadURL(videoStorageRef);

      // Simpan URL video ke dalam absensi
      const attendanceRef = ref(rtdb, `kp/magang/absenh/${formattedDate}/attendance/${absensiId}/bpulang`);
      await set(attendanceRef, videoURL);
      // console.log('Video berhasil di-upload dan URL disimpan.');
    } catch (error) {
      // console.error('Gagal upload video:', error);
    }
  };

  const handleOutOfTownAttendance = async (userId, userName) => {
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0];
    const hours = date.getUTCHours() + 7; // Convert to WIB (UTC+7)
    const minutes = date.getUTCMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} WIB`;

    // Menambahkan 7 jam ke waktu absensi untuk timot
    const timeOutDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const timotHours = timeOutDate.getUTCHours() + 7; // Convert to WIB (UTC+7)
    const timotMinutes = timeOutDate.getUTCMinutes();
    const formattedTimeOut = `${timotHours.toString().padStart(2, '0')}:${timotMinutes.toString().padStart(2, '0')} WIB`;

    const attendanceRef = ref(rtdb, `kp/magang/absen/${userId}/attendance/${formattedDate}`);
    const attendanceSnapshot = await get(attendanceRef);

    if (attendanceSnapshot.exists()) {
        alert('Anda sudah melakukan absensi untuk hari ini.');
        return;
    }

    const attendanceData = {
        date: formattedDate,
        timein: formattedTime, // Time saat absensi
        timot: formattedTimeOut, // Time saat pulang (7 jam setelah absensi)
        kegiatan: 'dinas luar kota',
        ip: ipAddress,
        location,
    };

    await set(attendanceRef, attendanceData);

    // Simpan data absenh di tabel absenh
    const absenhRef = ref(rtdb, `kp/magang/absenh/${formattedDate}/attendance/${userName}`);
    await set(absenhRef, {
        name: userName,
        idabsen: userId,
        location,
        date: formattedDate,
        timein: formattedTime,
        timot: formattedTimeOut, // Nilai ini sudah diisi otomatis
        kegiatan: 'dinas luar kota', // Kegiatan diisi otomatis sebagai dinas luar kota
        ip: ipAddress,
    });

    alert('Absensi luar kota berhasil disimpan!');
  };


  // Placeholder function for handleRegister
  const handleRegister = async (userNim) => {
    setLoading(true);
    const video = document.getElementById('video');
    const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();

    if (detections.length === 0) {
        alert('Wajah tidak terdeteksi.');
        return;
    }

    const userDescriptor = detections[0].descriptor;
    const kpAbsenRef = ref(rtdb, 'kp/magang/absen');
    const snapshot = await get(kpAbsenRef);
    const absenData = snapshot.val();
    let descriptorExists = false;
    let existingUserId = null;

    if (absenData) {
        for (const key in absenData) {
            const userData = absenData[key];
            if (userData && userData.descriptor) {
                const storedDescriptor = new Float32Array(userData.descriptor);
                const distance = faceapi.euclideanDistance(userDescriptor, storedDescriptor);

                if (distance < 0.6) { // Sesuaikan threshold jika perlu
                    descriptorExists = true;
                    existingUserId = key; // Simpan ID user yang sudah ada
                    break;
                }
            }
        }
    }

    if (descriptorExists) {
        alert('Wajah sudah terdaftar. Silakan coba lagi nanti.');
       } else {
        const userName = prompt('Masukkan nama Anda:');
        const kpUsersRef = ref(rtdb, 'kp/magang/users');
        const usersSnapshot = await get(kpUsersRef);
        const usersData = usersSnapshot.val();
        let nameExists = false;
        let isUserActive = false;

        for (const key in usersData) {
            const userData = usersData[key];
            if (userData && userData.name === userName) {
                nameExists = true;
                existingUserId = key;
                if (userData.status === 'ACTIVE') {
                    isUserActive = true;
                }
                break;
            }
        }

        //const newUserRef = push(kpUsersRef); // Firebase akan otomatis memberikan ID unik di sini

        if (nameExists) {
          if (isUserActive) {
            const newUser = {
                id: generateId(),
                name: userName,
                // nim: userNim,
                descriptor: Array.from(userDescriptor),
                ip: ipAddress,
                location,
            };
          

            const kpUsersRef = ref(rtdb, `kp/magang/absen/${newUser.id}`);
            await set(kpUsersRef, newUser);

            alert('Registrasi berhasil dan data disimpan untuk absen!');
            setIsRegistered(true);
        } else {
            alert('Nama tidak ditemukan di sistem. Silakan hubungi admin.');
          }
      }else {
        alert('Nama tidak ditemukan di sistem. Silakan hubungi admin.');
      }
    }
    setLoading(false);
  };
  

  return (
    <>
      
      <video id="video" autoPlay muted width="720" height="560" />
      {!cameraStarted && (
        <span onClick={startVideo} disabled={loading} type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">{loading ? 'Loading...' : 'Start Kamera'}</span> 
      )}
      <br/>
      <span onClick={handleScan} disabled={loading} type="button" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">{loading ? 'Loading...' : 'Absensi Masuk'}</span>
      <br/>
      <span onClick={handleRegister} disabled={loading} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">{loading ? 'Loading...' : 'Registrasi'}</span>
      {isRegistered && <></>}
      <br/>
      <span onClick={handlePulang} disabled={loading} type="button" className="focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:focus:ring-yellow-900">{loading ? 'Loading...' : 'Absensi Pulang'}</span>

      
    </>
  );
};

export default Faces;

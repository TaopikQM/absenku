import React, { useState, useEffect, useRef } from 'react';
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

  
  const canvasRef = useRef(null);
  const videoRef = useRef(null); 
  const kominfoLocation = {
    lat: -6.99306,  // Latitude Kominfo Jateng
    lon: 110.42083, // Longitude Kominfo Jateng
  }

  const startVideo = async () => {
    setLoading(true);
    await loadModelsAndStartVideo();
    // setCameraStarted(true);
    setLoading(false);
  };
  // const startVideo = async () => {
  //   try {
  //     setLoading(true);
  //     await loadModelsAndStartVideo();
  //     setLoading(false);
  //   } catch (error) {
  //     console.error('Error starting video:', error);
  //     alert('Gagal memulai kamera, pastikan perangkat memiliki kamera dan izinkan akses.');
  //     setLoading(false);
  //   }
  // };

   // Fungsi untuk memulai video dan memuat model Face API
   const loadModelsAndStartVideo = async () => {
    // Load model Face API
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');

    // Akses video dari elemen yang ada
    // const video = document.getElementById('video');
    const video = videoRef.current;
    
    // Mulai video webcam
    // navigator.mediaDevices.getUserMedia({ video: {} })
    //   .then(stream => {
    //     video.srcObject = stream;
    //   })
    //   .catch(err => console.error("Error accessing webcam: ", err));
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
        setCameraStarted(true);

    // Saat video mulai diputar, jalankan deteksi wajah secara berkala
    video.addEventListener('play', () => {
      // Pastikan canvas dan video sudah siap
      if (canvasRef.current && video) {
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        
        // Sesuaikan dimensi canvas dengan video
        faceapi.matchDimensions(canvas, displaySize);
        
        setInterval(async () => {
          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks().withFaceDescriptors();

          // Bersihkan canvas sebelum menggambar
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Gambar deteksi wajah dan landmark di canvas
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

          // // Periksa kecocokan wajah dengan API
          // for (const detection of resizedDetections) {
          //   const userDescriptor = detection.descriptor;
          //   const descriptorResponse = await axios.post('/api/faces', {
          //     action: 'checkDescriptor',
          //     descriptor: Array.from(userDescriptor) // Mengonversi ke array
          //   });

          //   if (descriptorResponse.data.exists) {
          //     const matchedName = descriptorResponse.data.name;
          //     // Tampilkan nama di kanvas
          //     ctx.font = '24px Arial';
          //     ctx.fillStyle = 'red';
          //     ctx.fillText(matchedName, detection.detection.box.x, detection.detection.box.y);
          //   }
          // }
        }, 100);
      }
    });
  };

  const fetchIpAndLocation = async () => {
    try {
      const ipRes = await axios.get('https://api.ipify.org?format=json');
      setIpAddress(ipRes.data.ip);

      // Jika ingin menggunakan API eksternal untuk lokasi IP:
      // const locationRes = await axios.get(`https://ipapi.co/${ipRes.data.ip}/json/`);
      // setLocation({ latitude: locationRes.data.latitude, longitude: locationRes.data.longitude });
    } catch (error) {
      console.error('Failed to fetch IP and location', error);
    }
  };
   // Fungsi untuk mengambil lokasi berbasis GPS
   const fetchGpsLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          setLocation({latitude,longitude });
          setLatitude(latitude);
          setLongitude(longitude);
          
        },
        (error) => {
          console.error("Error fetching GPS location:", error);
          // Fallback jika gagal mendapat GPS, bisa Anda tambahkan logic lain di sini
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
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

  const checkLocationAndDistance = async () => {
    if (latitude && longitude) {
      const distanceToKominfo = calculateDistance(latitude, longitude, kominfoLocation.lat, kominfoLocation.lon);
    
      if (distanceToKominfo > 2) {
        alert('Lokasi Anda tidak sesuai dengan lokasi kantor.');
        setLoading(false); 
      }
      //  else {
      //   // alert('Lokasi Anda sesuai dengan lokasi kantor.');
      //   setLoading(false); // Jika loading sudah dilakukan
      // }
    }
  };

  // useEffect untuk menjalankan pengecekan setelah lokasi diperoleh
  useEffect(() => {
    fetchIpAndLocation();
    fetchGpsLocation();
    
    checkLocationAndDistance();
  }, [latitude, longitude]); // Jalankan saat latitude atau longitude berubah

  const isWithinAllowedTime = () => {
    const now = new Date();
    const hours = now.getUTCHours() + 7; // Convert to WIB (UTC+7)
    const minutes = now.getUTCMinutes();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

     return day >= 1 && day <= 5 && (hours >= 4 && (hours < 9 || (hours === 9 && minutes === 0)));
  }; 

  const isWithinAllowedTimeForPulang = () => {
    const now = new Date();
    const hours = now.getUTCHours() + 7; // Convert to WIB (UTC+7)
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Batasan waktu pulang
    if (day === 5) { // Jumat
      return hours >= 13 && hours < 18;
    } else if (day >= 1 && day <= 4) { // Senin - Kamis
      return hours >= 14 && hours < 18;
    }
    return false;
  };

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


  return (
    <>
    <div style={{ position: 'relative', width: '100%', maxWidth: '720px' }}>
      <video ref={videoRef} autoPlay muted style={{ width: '100%', height: 'auto', display: cameraStarted ? 'block' : 'none'  }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 'auto',display: cameraStarted ? 'block' : 'none'  }} />
    
    </div>
      
      {!cameraStarted && (
        <span onClick={startVideo} disabled={loading} type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">{loading ? 'Loading...' : 'Start Kamera'}</span> 
      )}
   
    </>
  );
};

export default Faces;

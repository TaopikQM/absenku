import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { ref, set, get, push } from 'firebase/database';
import { rtdb } from '../config/firebase';

const Faces = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    async function loadModels() {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    }
    loadModels();

    async function fetchIpAndLocation() {
      try {
        const ipRes = await axios.get('https://api.ipify.org?format=json');
        setIpAddress(ipRes.data.ip);

        const locationRes = await axios.get(`https://ipapi.co/${ipRes.data.ip}/json/`);
        setLocation({ lat: locationRes.data.latitude, lon: locationRes.data.longitude });
      } catch (error) {
        console.error('Failed to fetch IP and location', error);
      }
    }
    fetchIpAndLocation();
  }, []);

  const generateId = (length = 16) => {
    return btoa([...crypto.getRandomValues(new Uint8Array(length))].map(b => String.fromCharCode(b)).join(''));
  };

  const startVideo = async () => {
    const video = document.getElementById('video');
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        video.srcObject = stream;
      });
  };

  const isWithinAllowedTime = () => {
    const now = new Date();
    const hours = now.getUTCHours() + 7; // Convert to WIB (UTC+7)
    const minutes = now.getUTCMinutes();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Batasan waktu absensi dari jam 06:00 sampai 15:00 WIB di hari kerja (Senin - Jumat)
    return day >= 1 && day <= 5 && (hours >= 6 && (hours < 15 || (hours === 15 && minutes === 0)));
  };

  const handleScan = async () => {
    if (!isWithinAllowedTime()) {
      alert('Absensi hanya bisa dilakukan antara pukul 06:00 WIB dan 15:00 WIB pada hari Senin hingga Jumat.');
      return;
    }
  
    const video = document.getElementById('video');
    const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
  
    if (detections.length === 0) {
      alert('Wajah tidak terdeteksi.');
      return;
    }
  
    const userDescriptor = detections[0].descriptor;
  
    const kpRef = ref(rtdb, 'kp/absen/');
    const snapshot = await get(kpRef);
    const usersData = snapshot.val();
    let found = false;
  
    // Pastikan kita dapat iterasi pada data yang ada
    if (usersData) {
      // Mengubah objek menjadi array key-value
      for (const key in usersData) {
        const userData = usersData[key];
        if (userData && userData.descriptor) {
          const storedDescriptor = new Float32Array(userData.descriptor);
          const distance = faceapi.euclideanDistance(userDescriptor, storedDescriptor);
  
          if (distance < 0.6) { // Adjust threshold as needed
            found = true;
            const userId = key;
            setCurrentUser(userData);
            await saveAttendance(userId, userData.name); // Ensure saveAttendance is async
            alert(`Absensi berhasil untuk: ${userData.name}`);
            break; // Exit loop once a match is found
          }
        }
      }
    }
  
    if (!found) {
      alert('Pengguna tidak ditemukan. Silakan registrasi terlebih dahulu.');
      setIsRegistered(false);
    } else {
      setIsRegistered(true);
    }
  };
  

  const saveAttendance = async (userId, userName) => {
    const date = new Date();
    const timestamp = date.toISOString();

    // Format tanggal dalam format yyyy-mm-dd
    const formattedDate = date.toISOString().split('T')[0];

    // Format waktu dalam format hh:mm WIB
    const hours = date.getUTCHours() + 7; // Convert to WIB (UTC+7)
    const minutes = date.getUTCMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} WIB`;

    // Periksa apakah absensi sudah ada
    const attendanceRef = ref(rtdb, `kp/absen/${userId}/attendance/${formattedDate}`);
    const attendanceSnapshot = await get(attendanceRef);

    if (attendanceSnapshot.exists()) {
      alert('Anda sudah melakukan absensi untuk hari ini.');
      return;
    }

    // Jika absensi belum ada, simpan absensi baru
    const attendanceData = {
      date: formattedDate,
      time: formattedTime,
      ip: ipAddress,
      location,
    };

    await set(attendanceRef, attendanceData);

    // Simpan salinan absen di `kp/absenh/`
    const absenhRef = ref(rtdb, `kp/absenh/${formattedDate}/attendance/${formattedTime}`);
    const absenhData = {
      name: userName,
      location,
      date: formattedDate,
      time: formattedTime,
      ip: ipAddress,
      location,
    };
    await set(absenhRef, absenhData);

    alert('Absensi berhasil disimpan!');
  };

 
  const handleRegister = async () => {
    const video = document.getElementById('video');
    const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
  
    if (detections.length === 0) {
      alert('Wajah tidak terdeteksi.');
      return;
    }
  
    const userDescriptor = detections[0].descriptor;
  
    const kpRef = ref(rtdb, 'kp/absen/');
    const snapshot = await get(kpRef);
    const usersData = snapshot.val();
    let descriptorExists = false;
  
    if (usersData) {
      // Mengubah objek menjadi array key-value
      for (const key in usersData) {
        const userData = usersData[key];
        if (userData && userData.descriptor) {
          const storedDescriptor = new Float32Array(userData.descriptor);
          const distance = faceapi.euclideanDistance(userDescriptor, storedDescriptor);
  
          if (distance < 0.6) { // Adjust threshold as needed
            descriptorExists = true;
            alert('Data sudah ada. Silakan coba dengan wajah lain.');
            break;
          }
        }
      }
    }
  
    if (!descriptorExists) {
      const userId = generateId();
      const userName = prompt('Masukkan nama Anda:');
      const newUser = {
        id: userId,
        name: userName,
        descriptor: Array.from(userDescriptor),
        ip: ipAddress,
        location,
      };
  
      const newUserRef = ref(rtdb, `kp/absen/${userId}`);
      await set(newUserRef, newUser);
  
      // Menyimpan salinan absen ke `kp/absenh/`
      const formattedDate = new Date().toISOString().split('T')[0];
      const formattedTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) + ' WIB';
  
      // const absenshRef = ref(rtdb, `kp/absenh/${userId}`);
      // await set(absenshRef, {
      //   name: userName,
      //   location,
      //   time: formattedTime,
      // });
  
      alert('Registrasi berhasil!');
      setIsRegistered(true);
    }
  };
  

  return (
    <div>
      <div>
        
        <button onClick={startVideo}>Mulai Kamera</button>
        
        <video id="video" width="720" height="560" autoPlay muted></video>
        <br />
        <button onClick={handleScan}>Absen</button>
        <br />
        {!isRegistered && <button onClick={handleRegister}>Registrasi</button>}
        
      </div>
    </div>
  );
};

export default Faces;


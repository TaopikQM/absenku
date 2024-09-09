import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { ref, push, set, update, get, onValue } from 'firebase/database';
import { rtdb } from '../config/firebase';

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

  const startVideo = async () => {
    setLoading(true);
    const video = document.getElementById('video');
    // navigator.mediaDevices.getUserMedia({ video: {} })
    //   .then(stream => {
        
    //     video.srcObject = stream;
    //     setCameraStarted(true); // Kamera telah dimulai
    //     setLoading(false);
    //   });

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
        setCameraStarted(true);
      } 
      // catch (error) {
      //   console.error('Failed to start the camera', error);
      // } 
      finally {
        setLoading(false);
      }


      // video.addEventListener('play', () => {
      //   const canvas = faceapi.createCanvasFromMedia(video);
      //   document.body.append(canvas); // Tambahkan canvas ke body atau ke elemen div tertentu
      //   faceapi.matchDimensions(canvas, { width: video.width, height: video.height });
  
      //   const displaySize = { width: video.width, height: video.height };
      //   faceapi.matchDimensions(canvas, displaySize);
  
      //   const detectFaces = async () => {
      //     const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
      //     const resizedDetections = faceapi.resizeResults(detections, displaySize);
      //     canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); // Bersihkan canvas
      //     faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      //     requestAnimationFrame(detectFaces); // Panggil lagi untuk deteksi berikutnya
      //   };
  
      //   detectFaces(); // Mulai deteksi wajah
      // });
    //   setLoading(false);
    // }
  };

  const isWithinAllowedTime = () => {
    const now = new Date();
    const hours = now.getUTCHours() + 7; // Convert to WIB (UTC+7)
    const minutes = now.getUTCMinutes();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Batasan waktu absensi dari jam 06:00 sampai 15:00 WIB di hari kerja (Senin - Jumat)
    return day >= 1 && day <= 5 && (hours >= 5 && (hours < 9 || (hours === 9 && minutes === 0)));
  };

  const isWithinAllowedTimeForPulang = () => {
    const now = new Date();
    const hours = now.getUTCHours() + 7; // Convert to WIB (UTC+7)
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Batasan waktu pulang
    if (day === 5) { // Jumat
      return hours >= 13 && hours < 17;
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
        alert('Absensi hanya bisa dilakukan antara pukul 06:00 WIB dan 15:00 WIB pada hari Senin hingga Jumat.');
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


                  //   if (distanceToKominfo > 3) { // Radius batas jarak dalam kilometer
                  //     alert('Lokasi Anda tidak sesuai.');
                  //     setLoading(false);
                  //     return;
                  // }
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
                // Call saveAttendance function
                await saveAttendance(currentUserId, matchedName);
                alert(`Absensi berhasil untuk: ${matchedName}`);
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
    const absenhRef = ref(rtdb, `kp/magang/absenh/${formattedDate}/attendance/${userName}`);
    await set(absenhRef, {
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

    alert('Absensi berhasil disimpan!');
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
              // Check if user has already clocked out
              const attendanceRef = ref(rtdb, `kp/magang/absen/${currentUserId}/attendance/${formattedDate}`);
              const attendanceSnapshot = await get(attendanceRef);

              if (attendanceSnapshot.exists() && attendanceSnapshot.val().timot) {
                  alert('Anda sudah melakukan absensi pulang hari ini.');
              } else {
                  const kegiatanInput = prompt('Masukkan kegiatan hari ini:');
                  if (kegiatanInput) {
                      await saveAttendance1(currentUserId, matchedName, kegiatanInput);
                      alert('Absensi pulang berhasil.');
                  } else {
                      alert('Kegiatan tidak boleh kosong.');
                  }
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

    // Save a copy based on username
    const absenhRef = ref(rtdb, `kp/magang/absenh/${formattedDate}/attendance/${userName}`);
    await update(absenhRef, {
        timot: formattedTime,
        kegiatan: kegiatan
    });

    // console.log(`Absenh data for ${userName} on ${formattedDate} has been updated.`);

    alert('Absensi berhasil.');
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

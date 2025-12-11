import React, { useState, useEffect, useRef } from 'react';
import Scene from './components/Scene';
import Controls from './components/Controls';
import { ShapeType, HandData, GestureState } from './types';
import { initializeHandLandmarker, detectHands } from './services/handTracking';

const App: React.FC = () => {
  const [shape, setShape] = useState<ShapeType>(ShapeType.TREE);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [handData, setHandData] = useState<HandData | null>(null);
  const [debugGesture, setDebugGesture] = useState<GestureState>(GestureState.FIST);
  const [isLoading, setIsLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  // Fix: Initialize with 0 to match expected 1 argument for useRef<number>
  const requestRef = useRef<number>(0);

  // Initialize MediaPipe
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await initializeHandLandmarker();
      setIsLoading(false);
    };
    init();
  }, []);

  // Camera Logic
  useEffect(() => {
    if (isCameraActive) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata', predictWebcam);
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setIsCameraActive(false);
          alert("Could not access camera. Please allow permissions.");
        }
      };
      startCamera();
    } else {
      // Stop Camera
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      setHandData(null);
    }
  }, [isCameraActive]);

  const predictWebcam = () => {
    if (videoRef.current && videoRef.current.readyState === 4) { // ENOUGH_DATA
       const data = detectHands(videoRef.current, performance.now());
       if (data) {
         setHandData(data);
       } else {
         setHandData(null); 
       }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  // Derived Status Text
  const getHandStatus = () => {
    if (!handData) return "";
    if (handData.isFist) return "FIST DETECTED: FORMING TREE";
    if (handData.isPinching) return "PINCH DETECTED: ZOOMING";
    if (handData.isOpen) return "OPEN HAND: SCATTERING";
    return "HAND DETECTED";
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Hidden Video Element for processing */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="absolute top-0 left-0 w-32 h-24 opacity-0 pointer-events-none z-0" 
      />
      
      {/* Camera Preview (Optional small overlay) */}
      {isCameraActive && (
         <div className="absolute top-20 right-6 w-32 h-24 border border-white/20 rounded-lg overflow-hidden z-20 shadow-lg bg-black">
             {/* We mirror the video for better UX */}
             <video 
               ref={(ref) => {
                 if(ref && videoRef.current) ref.srcObject = videoRef.current.srcObject
               }}
               autoPlay
               muted
               className="w-full h-full object-cover transform scale-x-[-1]"
             />
         </div>
      )}

      {/* 3D Scene */}
      <Scene 
        shape={shape} 
        handData={handData} 
        debugGesture={debugGesture}
      />

      {/* UI Overlay */}
      <Controls 
        currentShape={shape} 
        setShape={setShape} 
        isCameraActive={isCameraActive}
        toggleCamera={() => setIsCameraActive(!isCameraActive)}
        debugGesture={debugGesture}
        setDebugGesture={setDebugGesture}
        handStatus={getHandStatus()}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-mono">Initializing Vision Engine...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
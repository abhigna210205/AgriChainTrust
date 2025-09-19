import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Failed to access camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleSimulateScan = () => {
    // For demonstration purposes, simulate a successful QR scan
    const mockQRData = `FARMCHAIN_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    onScan(mockQRData);
    stopCamera();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">QR Code Scanner</h3>
        <Button variant="ghost" size="sm" onClick={handleClose} data-testid="button-close-scanner">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="qr-scanner relative">
        {isScanning ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-lg"
            data-testid="video-camera-feed"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <p>Position QR code within the frame</p>
            </div>
          </div>
        )}
        
        {/* QR Code overlay frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 border-2 border-accent rounded-lg"></div>
        </div>
      </div>

      {error && (
        <div className="text-destructive text-sm text-center" data-testid="text-scanner-error">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {!isScanning ? (
          <Button 
            onClick={startCamera} 
            className="flex-1"
            data-testid="button-start-camera"
          >
            <Camera className="w-4 h-4 mr-2" />
            Start Camera
          </Button>
        ) : (
          <>
            <Button 
              onClick={stopCamera} 
              variant="outline" 
              className="flex-1"
              data-testid="button-stop-camera"
            >
              Stop Camera
            </Button>
            <Button 
              onClick={handleSimulateScan} 
              className="flex-1"
              data-testid="button-simulate-scan"
            >
              Simulate Scan
            </Button>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Note: This demo uses simulated QR scanning. In production, this would use a real QR code scanning library.
      </p>
    </div>
  );
}

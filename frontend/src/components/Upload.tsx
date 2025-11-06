import { makeGambit } from '../utils/make_gambit'
import { undoGambit } from '../utils/undo_gambit'
import { useState } from 'react';
import LoadingState from './LoadingState';
import api from '../api';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultData, setResultData] = useState<string | ArrayBuffer | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile: File | undefined = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResultData(null);
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
      }
    }
  };

  const logConversion = async (fileName: string, mode: 'encode' | 'decode'): Promise<void> => {
    try {
      await api.post('/conversions/log-conversion', {
        fileName,
        mode
      });
    } catch (error) {
      console.error('Error logging conversion:', error);
    }
  };

  const logDownload = async (fileName: string, mode: 'encode' | 'decode'): Promise<void> => {
    try {
      await api.post('/conversions/log-download', {
        fileName,
        mode
      });
    } catch (error) {
      console.error('Error logging download:', error);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);

    try {
      const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
      
      if (mode === 'encode') {
        const result: string = await makeGambit(arrayBuffer, (prog: number) => {
          setProgress(prog);
        });
        
        setResultData(result);
        
        const blob: Blob = new Blob([result], { type: 'text/plain' });
        const url: string = URL.createObjectURL(blob);
        setDownloadUrl(url);
        
        // Log to backend after successful encoding
        await logConversion(file.name, 'encode');
      } else {
        const result: ArrayBuffer = await undoGambit(arrayBuffer, (prog: number) => {
          setProgress(prog);
        });
        
        setResultData(result);
        
        const blob: Blob = new Blob([result]);
        const url: string = URL.createObjectURL(blob);
        setDownloadUrl(url);
        
        // Log to backend after successful decoding
        await logConversion(file.name, 'decode');
      }
      
      setProgress(100);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file: ' + (error as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  // Preload background image
  const backgroundUrl = 'https://media.istockphoto.com/id/1280096529/photo/close-up-of-chessmen-on-chessboard.jpg?s=612x612&w=0&k=20&c=SWP4H8luD-Wrgz-FThOVp00-zOtGOwaNs6GTwZU-QoI=';
  
  if (typeof window !== 'undefined' && !imageLoaded) {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = backgroundUrl;
  }

  if (!imageLoaded) {
    return <LoadingState />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
        }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <h1 className="text-4xl font-bold mb-8 text-white drop-shadow-lg">Chess Gambit Encoder</h1>
        
        <div className="mb-4">
          <button
            onClick={() => {
              setMode(mode === 'encode' ? 'decode' : 'encode');
              setFile(null);
              setResultData(null);
              if (downloadUrl) {
                URL.revokeObjectURL(downloadUrl);
                setDownloadUrl(null);
              }
              setProgress(0);
            }}
            className="text-sm text-white/70 hover:text-white underline transition-colors"
          >
            Switch to {mode === 'encode' ? 'Decode' : 'Encode'} Mode
          </button>
        </div>
        
        {!resultData ? (
          <>
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer mb-6 px-8 py-12 border-2 border-dashed border-white/40 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 hover:border-white/70 transition-all duration-300 hover:scale-105"
            >
              <div className="flex flex-col items-center text-white">
                <svg className="w-12 h-12 mb-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-lg font-semibold mb-1">
                  {file ? file.name : 'Click to upload'}
                </span>
                <span className="text-sm text-white/70">
                  {mode === 'encode' 
                    ? 'Select a file to encode into chess games'
                    : 'Select a PGN file to decode'}
                </span>
              </div>
            </label>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden"
              onChange={handleFileChange}
            />
            
            <button 
              onClick={handleUpload}
              disabled={!file || processing}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {processing 
                ? (mode === 'encode' ? 'Encoding...' : 'Decoding...') 
                : (mode === 'encode' ? 'Encode to PGN' : 'Decode from PGN')}
            </button>

            {processing && (
              <div className="mt-6 w-64">
                <div className="bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-white text-center mt-2 text-sm">{progress.toFixed(1)}%</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-6 px-8 py-6 bg-black/60 backdrop-blur-sm rounded-lg border border-white/40">
              <p className="text-white text-center mb-2">
                ✓ {mode === 'encode' ? 'Encoding' : 'Decoding'} complete!
              </p>
              <p className="text-white/70 text-sm text-center">
                {mode === 'encode' 
                  ? 'Your file has been encoded into chess games'
                  : 'Your file has been decoded from chess games'}
              </p>
            </div>
            
            <a
              href={downloadUrl || undefined}
              download={mode === 'encode' 
                ? `${file?.name || 'encoded'}.pgn`
                : `${file?.name.replace('.pgn', '') || 'decoded'}`}
              onClick={() => {
                if (file) {
                  logDownload(file.name, mode);
                }
              }}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 active:scale-95 mb-4"
            >
              Download {mode === 'encode' ? 'PGN' : 'Decoded'} File
            </a>

            <button
              onClick={() => {
                setFile(null);
                setResultData(null);
                if (downloadUrl) {
                  URL.revokeObjectURL(downloadUrl);
                  setDownloadUrl(null);
                }
                setProgress(0);
              }}
              className="px-6 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-all duration-300"
            >
              {mode === 'encode' ? 'Encode' : 'Decode'} Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
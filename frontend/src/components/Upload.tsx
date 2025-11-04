export default function UploadPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Optional background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://media.istockphoto.com/id/1280096529/photo/close-up-of-chessmen-on-chessboard.jpg?s=612x612&w=0&k=20&c=SWP4H8luD-Wrgz-FThOVp00-zOtGOwaNs6GTwZU-QoI=)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-8 text-white drop-shadow-lg">Upload File</h1>
        
        {/* Custom file upload area */}
        <label 
          htmlFor="file-upload" 
          className="cursor-pointer mb-6 px-8 py-12 border-2 border-dashed border-white/40 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 hover:border-white/70 transition-all duration-300 hover:scale-105"
        >
          <div className="flex flex-col items-center text-white">
            <svg className="w-12 h-12 mb-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-lg font-semibold mb-1">Click to upload</span>
            <span className="text-sm text-white/70">or drag and drop files here</span>
          </div>
        </label>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
        />
        
        <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-95">
          Upload
        </button>
      </div>
    </div>
  );
}

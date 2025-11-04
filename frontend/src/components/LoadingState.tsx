export default function LoadingState() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        {/* Chess pieces animation */}
        <div className="relative w-24 h-24">
          {/* Outer ring */}
          <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
          
          {/* Inner rotating pieces */}
          <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '2s' }}>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            </div>
          </div>
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-white/80 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="text-white/70 text-sm font-light tracking-wider">
          Loading
          <span className="animate-pulse">.</span>
          <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
          <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
        </div>
      </div>
    </div>
  );
}
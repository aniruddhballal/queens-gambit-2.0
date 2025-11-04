export default function ChessBackground() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://media.istockphoto.com/id/1280096529/photo/close-up-of-chessmen-on-chessboard.jpg?s=612x612&w=0&k=20&c=SWP4H8luD-Wrgz-FThOVp00-zOtGOwaNs6GTwZU-QoI=)'
        }}
      />
    </div>
  );
}
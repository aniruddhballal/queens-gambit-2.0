import { Chess } from 'chess.js';

interface Game {
  moves: string[];
}

const parsePGN = (pgnString: string): Game[] => {
  const games: Game[] = [];
  const gameBlocks = pgnString.split(/\n\n+/);
  
  for (const block of gameBlocks) {
    if (!block.trim()) continue;
    
    // Extract moves (skip metadata lines that start with [)
    const lines = block.split('\n');
    let moveText = '';
    
    for (const line of lines) {
      if (!line.startsWith('[') && line.trim()) {
        moveText += line + ' ';
      }
    }
    
    if (moveText.trim()) {
      // Remove move numbers and result indicators
      const cleanMoves = moveText
        .replace(/\d+\./g, '') // Remove move numbers like "1."
        .replace(/\{[^}]*\}/g, '') // Remove comments
        .replace(/1-0|0-1|1\/2-1\/2|\*/g, '') // Remove results
        .trim()
        .split(/\s+/)
        .filter(m => m.length > 0);
      
      if (cleanMoves.length > 0) {
        games.push({ moves: cleanMoves });
      }
    }
  }
  
  return games;
};

export const undoGambit = async (
  pgnData: ArrayBuffer,
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer> => {
  const bittify = 8;
  
  // Convert ArrayBuffer to string
  const decoder = new TextDecoder('utf-8');
  const pgnString = decoder.decode(pgnData);
  
  // Parse PGN into list of games
  const gamesList = parsePGN(pgnString);
  const totalGames = gamesList.length;
  
  let decData = '';
  const byteValues: number[] = [];
  
  for (let pgnGameNum = 0; pgnGameNum < gamesList.length; pgnGameNum++) {
    const game = gamesList[pgnGameNum];
    const chess = new Chess();
    
    // Update progress
    if (onProgress) {
      const progress = ((pgnGameNum + 1) / totalGames) * 100;
      onProgress(Math.min(100, progress));
    }
    
    for (let moveIndex = 0; moveIndex < game.moves.length; moveIndex++) {
      const moveStr = game.moves[moveIndex];
      
      // Get all legal moves
      const legalMoves = chess.moves({ verbose: true });
      const moveStrings = legalMoves.map(m => m.from + m.to + (m.promotion || ''));
      
      // Find the index of the current move
      let moveIndexInList = -1;
      
      // Try to match the move
      for (let i = 0; i < legalMoves.length; i++) {
        const legalMove = legalMoves[i];
        const legalMoveStr = legalMove.from + legalMove.to + (legalMove.promotion || '');
        
        // Try matching with SAN notation
        if (legalMove.san === moveStr || legalMoveStr === moveStr) {
          moveIndexInList = i;
          break;
        }
      }
      
      if (moveIndexInList === -1) {
        console.warn(`Move ${moveStr} not found in legal moves`);
        continue;
      }
      
      // Convert index to binary
      const gameOver = (pgnGameNum === gamesList.length - 1);
      const lastMove = (moveIndex === game.moves.length - 1);
      
      let bitsReq: number;
      if (gameOver && lastMove) {
        const movesCount = moveStrings.length;
        const logLength = Math.floor(Math.log2(movesCount));
        const remainingBits = bittify - (decData.length % bittify);
        bitsReq = Math.min(logLength, remainingBits);
      } else {
        const movesCount = moveStrings.length;
        bitsReq = Math.floor(Math.log2(movesCount));
      }
      
      // Pad the binary representation
      const indexedBin = moveIndexInList.toString(2);
      const padding = Math.max(0, bitsReq - indexedBin.length);
      const paddedBin = '0'.repeat(padding) + indexedBin;
      
      // Make the move
      try {
        chess.move(moveStr);
      } catch (e) {
        console.warn(`Failed to make move ${moveStr}:`, e);
        continue;
      }
      
      // Add binary data
      decData += paddedBin;
      
      // Convert complete bytes to output
      while (decData.length >= bittify) {
        const chunk = decData.substring(0, bittify);
        decData = decData.substring(bittify);
        
        let byteValue = 0;
        for (const bit of chunk) {
          byteValue = byteValue * 2 + parseInt(bit);
        }
        
        byteValues.push(byteValue);
      }
    }
    
    // Yield control periodically
    if (pgnGameNum % 10 === 0) {
      await new Promise<void>(resolve => setTimeout(resolve, 0));
    }
  }
  
  // Convert byte values to ArrayBuffer
  const resultArray = new Uint8Array(byteValues);
  
  if (onProgress) {
    onProgress(100);
  }
  
  return resultArray.buffer;
};
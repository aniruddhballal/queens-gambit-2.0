import { Chess } from 'chess.js';

interface Metadata {
  Event: string;
  Site: string;
  Date: string;
  Round: string;
  White: string;
  Black: string;
  ExpectedOpening: string;
  WhiteElo: string;
  BlackElo: string;
  Result: string;
  Annotator: string;
  Variation: string;
  EventDate: string;
  TimeControl: string;
}

const noToBinStr = (num: number, bits: number): string => {
  return num.toString(2).padStart(bits, '0');
};

const randomUserId = (): string => {
  return String(Math.floor(Math.random() * 900000) + 100000);
};

const randomMetadata = (): Metadata => {
  const events: string[] = [
    "Friendly Match", "Tournament", "Casual Game", "Championship", 
    "Club Championship", "Simultaneous Exhibition", "Charity Match", 
    "Blitz Tournament", "Rapid Championship", "Online Invitational"
  ];
  const locations: string[] = [
    "Local Club", "Online", "City Park", "University Hall", "Community Center", 
    "Chess Cafe", "Mountain Retreat", "Coastal Town", "National Stadium", 
    "Historical Landmark"
  ];
  const expectedOpenings: string[] = [
    "Sicilian Defense", "French Defense", "Caro-Kann", "Ruy Lopez", "Italian Game", 
    "English Opening", "King's Indian Defense", "Queen's Gambit", 
    "Nimzo-Indian Defense", "Pirc Defense", "Grünfeld Defense"
  ];

  const whiteElo: number = Math.floor(Math.random() * 2801) + 200;
  const lowerBound: number = Math.floor(whiteElo * 0.9);
  const upperBound: number = Math.floor(whiteElo * 1.1);
  const blackElo: number = Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;

  const results: string[] = ["1-0", "0-1", "1/2-1/2", "*"];

  const metadata: Metadata = {
    Event: events[Math.floor(Math.random() * events.length)],
    Site: locations[Math.floor(Math.random() * locations.length)],
    Date: `${Math.floor(Math.random() * 34) + 1990}.${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}.${String(Math.floor(Math.random() * 31) + 1).padStart(2, '0')}`,
    Round: String(Math.floor(Math.random() * 15) + 1),
    White: randomUserId(),
    Black: randomUserId(),
    ExpectedOpening: expectedOpenings[Math.floor(Math.random() * expectedOpenings.length)],
    WhiteElo: String(whiteElo),
    BlackElo: String(blackElo),
    Result: results[Math.floor(Math.random() * results.length)],
    Annotator: randomUserId(),
    Variation: ["Main Line", "Alternative Line", "Quiet Move", "Aggressive Line", "Theoretical Novelty"][Math.floor(Math.random() * 5)],
    EventDate: `${Math.floor(Math.random() * 34) + 1990}.${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}.${String(Math.floor(Math.random() * 31) + 1).padStart(2, '0')}`,
    TimeControl: ["3+2", "5+0", "10+0", "15+10", "30+0", "60+0", "90+30"][Math.floor(Math.random() * 7)]
  };

  const keys: (keyof Metadata)[] = Object.keys(metadata) as (keyof Metadata)[];
  const numToHide: number = Math.floor(Math.random() * (keys.length / 2)) + 1;
  const keysToHide: (keyof Metadata)[] = keys.sort(() => 0.5 - Math.random()).slice(0, numToHide);
  
  keysToHide.forEach((key: keyof Metadata) => {
    metadata[key] = "Hidden";
  });

  return metadata;
};

export const makeGambit = async (
  fileData: ArrayBuffer,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const bittify: number = 8;
  const file01: Uint8Array = new Uint8Array(fileData);
  const bits: number = bittify * file01.length;
  const pgnList: string[] = [];
  let currentPos: number = 0;
  let chess: Chess = new Chess();

  while (true) {
    const moves = chess.moves({ verbose: true });
    const logLength: number = Math.floor(Math.log2(moves.length));
    const remainingBits: number = bits - currentPos;
    const bitsReq: number = Math.min(logLength, remainingBits);

    if (bitsReq <= 0 || moves.length === 0) break;

    const bitsMapSetOfMoves: Record<string, string> = {};
    moves.forEach((move, i: number) => {
      const binStr: string = noToBinStr(i, bitsReq);
      if (binStr.length <= bitsReq) {
        bitsMapSetOfMoves[move.from + move.to + (move.promotion || '')] = binStr;
      }
    });

    const nextByteI: number = Math.floor(currentPos / bittify);
    let strs: string = '';

    for (let j: number = nextByteI; j < Math.min(nextByteI + 2, file01.length); j++) {
      strs += noToBinStr(file01[j], bittify);
    }

    const startIndex: number = currentPos % bittify;
    let nextStr: string = '';

    for (let i: number = 0; i < bitsReq; i++) {
      if (startIndex + i < strs.length) {
        nextStr += strs[startIndex + i];
      }
    }

    currentPos += bitsReq;

    let moveFound: boolean = false;
    for (const moveKey in bitsMapSetOfMoves) {
      if (bitsMapSetOfMoves[moveKey] === nextStr) {
        chess.move(moveKey);
        moveFound = true;
        break;
      }
    }

    if (!moveFound) break;

    if (onProgress) {
      onProgress(Math.min(100, (currentPos / bits) * 100));
    }

    if (chess.moves().length <= 1 || currentPos >= bits) {
      const metadata: Metadata = randomMetadata();
      let pgnStr: string = '';
      
      for (const [key, value] of Object.entries(metadata)) {
        pgnStr += `[${key} "${value}"]\n`;
      }
      
      pgnStr += '\n' + chess.pgn() + '\n';
      pgnList.push(pgnStr);
      chess.reset();
    }

    if (currentPos >= bits) break;

    if (currentPos % 1000 === 0) {
      await new Promise<void>(resolve => setTimeout(resolve, 0));
    }
  }

  return pgnList.join('\n\n');
};
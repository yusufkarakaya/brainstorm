export interface Session {
  id: string;
  created_at: number;
  updated_at: number;
}

export interface Card {
  id: string;
  session_id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  z_index: number;
  created_at: number;
  updated_at: number;
}

export interface CursorState {
  socketId: string;
  sessionId: string;
  userName: string;
  userColor: string;
  x: number;
  y: number;
}

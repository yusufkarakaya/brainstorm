import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../socket';
import { useSocketEvents } from '../hooks/useSocketEvents';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';

const COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc', '#f472b6'];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

const NAMES = ['Spark', 'Nova', 'Blaze', 'River', 'Echo', 'Frost', 'Dawn', 'Dusk', 'Haze', 'Mist'];
function randomName() {
  return NAMES[Math.floor(Math.random() * NAMES.length)] + Math.floor(Math.random() * 99 + 1);
}

export default function Board() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [userName] = useState(() => randomName());
  const [userColor] = useState(() => randomColor());

  useSocketEvents();

  useEffect(() => {
    if (!id) return;

    // Validate session exists
    fetch(`/api/sessions/${id}`).then((res) => {
      if (!res.ok) {
        navigate('/?notFound=1', { replace: true });
      }
    });

    socket.connect();

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('session:join', { sessionId: id, userName, userColor });
    });

    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [id, navigate, userName, userColor]);

  return (
    <div className="board">
      <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? 'Live' : 'Connecting...'}
      </div>
      <Canvas sessionId={id!} userName={userName} userColor={userColor} />
      <Toolbar sessionId={id!} userColor={userColor} />
    </div>
  );
}

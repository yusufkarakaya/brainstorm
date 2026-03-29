import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import sessionsRouter from './routes/sessions';
import { registerSocketHandlers } from './socket';

const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '10kb' }));
app.use('/api/sessions', sessionsRouter);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] },
  maxHttpBufferSize: 64 * 1024, // 64 KB max per socket message
});

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

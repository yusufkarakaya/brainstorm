import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import sessionsRouter from './routes/sessions';
import { registerSocketHandlers } from './socket';

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/sessions', sessionsRouter);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
});

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

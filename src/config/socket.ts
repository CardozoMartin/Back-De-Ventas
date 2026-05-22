import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';

export let io: SocketServer;

export const initSocket = (server: Server, allowedOrigins: string[]) => {
  io = new SocketServer(server, {
    cors: {
      origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado por WebSocket: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

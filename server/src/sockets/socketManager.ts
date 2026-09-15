import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/token';
import { IUserPayload } from '../types';

interface AuthenticatedSocket extends Socket {
  user?: IUserPayload;
}

let ioInstance: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  ioInstance = new Server(httpServer, {
    cors: {
      origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication error: Token required'));
      const payload = verifyAccessToken(token);
      socket.user = payload;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  ioInstance.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.user?.id;
    if (userId) socket.join(`user:${userId}`);

    socket.on('join:workspace', (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);
    });

    socket.on('leave:workspace', (workspaceId: string) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });
  });

  return ioInstance;
};

export const getIO = (): Server => {
  if (!ioInstance) throw new Error('Socket.IO not initialized');
  return ioInstance;
};

export const emitToWorkspace = (workspaceId: string, event: string, data: any): void => {
  if (ioInstance) ioInstance.to(`workspace:${workspaceId}`).emit(event, data);
};

export const emitToProject = (projectId: string, event: string, data: any): void => {
  if (ioInstance) ioInstance.to(`project:${projectId}`).emit(event, data);
};

export const emitToUser = (userId: string, event: string, data: any): void => {
  if (ioInstance) ioInstance.to(`user:${userId}`).emit(event, data);
};
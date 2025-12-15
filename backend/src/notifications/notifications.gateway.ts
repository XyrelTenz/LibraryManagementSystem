import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const role = client.handshake.query.role as string;

    if (userId) {
      client.join(userId);
      this.logger.log(`Client connected: ${userId}`);
    }
    if (role) {
      client.join(role);
    }
  }

  handleDisconnect(client: Socket) {
    // Socket.io handles cleanup automatically
  }

  sendToUser(userId: string, payload: any) {
    this.server.to(userId).emit('notification', payload);
  }

  sendToRole(role: string, payload: any) {
    this.server.to(role).emit('notification', payload);
  }
}

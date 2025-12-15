import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../shared/enums/role.enum';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Constructor for JWT Service
  constructor(private readonly jwtService: JwtService) { }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY || "JWT",
      });

      client.data.user = {
        userId: payload.sub,
        role: payload.role
      };

      // Put the user in a private room named after their ID
      await client.join(payload.sub);

      // Useful for sending blasts to all librarians or admins
      if (payload.role) {
        await client.join(payload.role);
      }

      console.log(`User ${payload.sub} connected as ${payload.role}`);

    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): Socket<DefaultEventsMap> {
    return client;
  }

  // Helper to send a message to a specific person
  sendToUser(userId: string, payload: any) {
    this.server.to(userId).emit('notification', payload);
  }

  // Helper to send a message to everyone in a specific role group
  sendToRole(role: UserRole, payload: any) {
    this.server.to(role).emit('notification', payload);
  }

  private extractToken(client: Socket): string | undefined {
    const [type, token] = client.handshake.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : client.handshake.query.token as string;
  }
}

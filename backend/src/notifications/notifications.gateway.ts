import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../shared/enums/role.enum';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) { }

  async handleConnection(client: Socket) {
    try {
      // Let's try to find the token in the headers or the query string
      const token = this.extractToken(client);

      if (!token) {
        // No token means no entry, kick them out
        client.disconnect();
        return;
      }

      // Check if the token is legit using the same secret as your strategy
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY || "JWT",
      });

      // Attach the user info to this connection so we know who it is later
      client.data.user = {
        userId: payload.sub,
        role: payload.role
      };

      // Put the user in a private room named after their ID
      // This way, we can send messages just to them
      await client.join(payload.sub);

      // If they have a specific role, add them to that group too
      // Useful for sending blasts to all librarians or admins
      if (payload.role) {
        await client.join(payload.role);
      }

      console.log(`User ${payload.sub} connected as ${payload.role}`);

    } catch (error) {
      // If anything goes wrong during auth, just disconnect them
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Socket.io handles the cleanup automatically, so we're good here
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

  // Just a little helper to grab the token from wherever the client sent it
  private extractToken(client: Socket): string | undefined {
    const [type, token] = client.handshake.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : client.handshake.query.token as string;
  }
}

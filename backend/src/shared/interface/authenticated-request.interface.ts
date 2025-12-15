import { Request } from 'express';
import { UserRole } from '../enums/role.enum';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: UserRole;
    email: string;
  };
}

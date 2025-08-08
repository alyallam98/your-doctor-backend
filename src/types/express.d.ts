import { Types } from 'mongoose';
import { User } from 'src/modules/user/schemas/user.schema';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface JwtPayload {
  sub: string;
  email: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}

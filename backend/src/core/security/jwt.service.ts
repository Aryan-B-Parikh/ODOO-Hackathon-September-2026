import jwt from 'jsonwebtoken';
import { JwtPayload } from 'shared/types';

import { Config } from '../../config/index.js';

export class JwtService {
  sign(payload: JwtPayload): string {
    return jwt.sign(payload, Config.JWT_SECRET, {
      expiresIn: Config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, Config.JWT_SECRET) as JwtPayload;
  }
}

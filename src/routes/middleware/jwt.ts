import jwt from 'jsonwebtoken';
import { HandleResponse, HandleResponseErrors } from '../../helper/response';
import { log } from 'node:console';
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return HandleResponseErrors(res, 401, 'Failed', ['Access denied. No token provided']);

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
    if (err) return HandleResponseErrors(res, 403, 'Failed', ['Invalid token']);
    req.user = user;
    next();
  });
};
export { authenticateToken };
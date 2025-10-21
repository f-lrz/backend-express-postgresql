// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

interface DecodedToken {
  id: string;
  name: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Tentativa de acesso sem token.');
    return res.status(401).json({ message: 'Token de autenticação não fornecido ou mal formatado.' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    logger.error('Chave secreta JWT não encontrada.');
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }

  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    // Anexa os dados do usuário ao objeto de requisição para uso posterior
    (req as any).user = { id: decoded.id, name: decoded.name };
    next();
  } catch (error) {
    logger.error('Token JWT inválido ou expirado.', error);
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};
// src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './database/connection';
import authRoutes from './routes/authRoutes';
import movieRoutes from './routes/movieRoutes'; // <--- 1. IMPORTAR
import logger from './utils/logger';

// ... (dotenv.config() e app = express()) ...
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para o Express entender JSON
app.use(express.json());

// Rotas da Aplicação
app.use('/api/auth', authRoutes); 
app.use('/api/movies', movieRoutes); // <--- 2. REGISTRAR

// Rota raiz para verificação
app.get('/', (req, res) => {
  // <--- 3. ATUALIZAR MENSAGEM ---
  res.send('API de Autenticação com JWT (e Filmes) está rodando!');
});

// ... (Middleware de tratamento de erros e startServer() permanecem iguais) ...
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    logger.error('Requisição com JSON mal formatado recebida.', err);
    return res.status(400).json({ error: 'JSON mal formatado.' });
  }
  next();
});

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    logger.info(`Servidor rodando em http://localhost:${PORT}`);
  });
};

startServer();
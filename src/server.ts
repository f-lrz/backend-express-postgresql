// src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './database/connection';
import authRoutes from './routes/authRoutes';
import movieRoutes from './routes/movieRoutes';
import logger from './utils/logger';

// Carrega as variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para o Express entender JSON
app.use(express.json());

// Rotas da Aplicação
app.use('/api/auth', authRoutes); 
app.use('/api/movies', movieRoutes);

// Rota raiz para verificação
app.get('/', (req, res) => {
  res.send('API de Autenticação com JWT (e Filmes) está rodando!');
});

// Middleware de tratamento de erros de JSON mal formatado
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    logger.error('Requisição com JSON mal formatado recebida.', err);
    return res.status(400).json({ error: 'JSON mal formatado.' });
  }
  next();
});

// --- ALTERAÇÃO PARA VERCEL ---

// Função assíncrona para garantir que a base de dados conecta ANTES de tudo
const startDatabase = async () => {
  await connectDB();
};

// Inicia a conexão com a base de dados
startDatabase();

// O app.listen() só deve ser chamado em ambiente de desenvolvimento (local)
// A Vercel (produção) gere o servidor por si só.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    logger.info(`Servidor rodando em http://localhost:${PORT}`);
  });
}

// Exporta o 'app' para que a Vercel o possa usar
export default app;
// src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
// Modifique esta linha
import { connectDB } from './database/connection'; // Importa a função
import authRoutes from './routes/authRoutes';
import logger from './utils/logger';

// ... (o resto do arquivo é igual até o app.listen) ...
//

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para o Express entender JSON
app.use(express.json());

// Rotas da Aplicação
app.use('/api/auth', authRoutes); 

// Rota raiz para verificação
app.get('/', (req, res) => {
  res.send('API de Autenticação com JWT (PostgreSQL) está rodando!');
});

// Middleware de tratamento de erros de JSON mal formatado
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    logger.error('Requisição com JSON mal formatado recebida.', err);
    return res.status(400).json({ error: 'JSON mal formatado.' });
  }
  next();
});

// Inicia o servidor APÓS conectar ao banco
const startServer = async () => {
  await connectDB(); // Conecta e sincroniza o banco
  
  app.listen(PORT, () => {
    logger.info(`Servidor rodando em http://localhost:${PORT}`);
  });
};

startServer();
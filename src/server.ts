// src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './database/connection';
import authRoutes from './routes/authRoutes';
import movieRoutes from './routes/movieRoutes';
import logger from './utils/logger';

// Carrega as variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


const allowedOrigins = [
  'http://localhost:5173', // Para desenvolvimento local
  'https://frontend-react-postgresql.filipe2025.tech' // Seu frontend hospedado (ajuste se for outro)
  // Adicione a URL do frontend do PostgreSQL aqui se for diferente
  // 'https://frontend-react-postgresql.filipe2025.tech'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('Blocked by CORS:', { origin: origin });
      callback(new Error('Not allowed by CORS'));
    }
  }
}));


// Middleware para o Express entender JSON
app.use(express.json());

// Rotas da Aplicação
app.use('/api/auth', authRoutes); 
app.use('/api/movies', movieRoutes);

// Rota raiz para verificação
app.get('/', (req, res) => {
  res.send('API de Autenticação com JWT (e Filmes) está rodando!');
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    logger.error('Requisição com JSON mal formatado recebida.', err);
    return res.status(400).json({ error: 'JSON mal formatado.' });
  }
  // Tratar erros de CORS especificamente
  if (err.message === 'Not allowed by CORS') {
     return res.status(403).json({ error: 'Not allowed by CORS' });
  }
  next(err);
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
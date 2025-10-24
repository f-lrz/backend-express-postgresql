// src/database/connection.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger';

require('pg');

dotenv.config();

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_DIALECT, NODE_ENV, DATABASE_URL } = process.env;

let sequelize: Sequelize;

if (NODE_ENV === 'production' && DATABASE_URL) {
  // Configuração para produção (ex: Vercel)
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Ajuste conforme a necessidade do seu provedor de DB
      }
    },
    logging: false, // Desabilitar logs SQL em produção
  });
} else {
  // Configuração para desenvolvimento local
  if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME || !DB_DIALECT) {
    logger.error('Variáveis de ambiente do banco de dados local não definidas.');
    process.exit(1);
  }
  
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    dialect: DB_DIALECT as any,
    logging: (msg) => logger.info(msg), // Usa o winston para logs SQL
  });
}

import User from '../models/User';
import Movie from '../models/Movie';

User.hasMany(Movie, {
  foreignKey: 'userId',
  as: 'movies',
});
Movie.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Conexão com o PostgreSQL estabelecida com sucesso.');
    
    // Sincroniza os modelos com o banco (cria tabelas se não existirem)
    // Em produção, é melhor usar Migrations, mas para este projeto .sync() é suficiente.
    await sequelize.sync({ alter: true }); // 'alter: true' atualiza tabelas se houver mudanças
    logger.info('Modelos sincronizados com o banco de dados.');

  } catch (error) {
    logger.error('Erro ao conectar ou sincronizar com o PostgreSQL:', error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
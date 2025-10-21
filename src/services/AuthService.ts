// src/services/AuthService.ts
import User, { IUserAttributes } from '../models/User';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

class AuthService {
  public async register(userData: Partial<IUserAttributes>): Promise<IUserAttributes> {
    try {
      // Verifica se o email já existe
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new Error('Este e-mail já está em uso.');
      }

      // O hook 'beforeCreate' no modelo User.ts cuidará do hash da senha
      const user = await User.create(userData as any); // 'as any' para bater com a criação
      logger.info(`Usuário registrado com sucesso: ${user.email}`);

      // O 'defaultScope' no modelo User.ts cuidará de não retornar a senha
      return user.toJSON();

    } catch (error: any) {
      logger.error(`Erro ao registrar usuário: ${error.message}`);
      // Se for um erro de validação do Sequelize
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(error.errors[0].message || error.message);
      }
      throw error;
    }
  }

  public async login(email: string, password: string): Promise<string> {
    try {
      // Usa o scope 'withPassword' para buscar o usuário INCLUINDO a senha
      const user = await User.scope('withPassword').findOne({ where: { email } });
      if (!user) {
        throw new Error('Credenciais inválidas.');
      }

      // O método 'comparePassword' foi definido no modelo User.ts
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Credenciais inválidas.');
      }
      
      const secret = process.env.JWT_SECRET;
      const expiresIn = process.env.JWT_EXPIRES_IN;

      if (!secret) throw new Error('Chave JWT não configurada.');
      
      const token = jwt.sign({ id: user.id, name: user.name }, secret, { expiresIn });
      logger.info(`Login bem-sucedido para o usuário: ${email}`);
      return token;

    } catch (error: any) {
      logger.error(`Erro no login: ${error.message}`);
      throw error;
    }
  }
}

export default new AuthService();
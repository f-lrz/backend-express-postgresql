// src/models/User.ts
import { Model, DataTypes, Optional } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../database/connection';

// Interface para os atributos do usuário
interface IUserAttributes {
  id: number;
  name: string;
  email: string;
  password?: string; // Opcional, pois não será retornado por padrão
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para os dados de criação (password é obrigatório)
interface IUserCreationAttributes extends Optional<IUserAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  password: string;
}

// Definindo a classe do Modelo
class User extends Model<IUserAttributes, IUserCreationAttributes> implements IUserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Método para comparar a senha
  public async comparePassword(password: string): Promise<boolean> {
    if (!this.password) {
      return Promise.resolve(false);
    }
    return bcrypt.compare(password, this.password);
  }
}

// Inicializando o Modelo (definindo o schema da tabela)
User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O nome é obrigatório.',
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Garante que o e-mail seja único
    validate: {
      isEmail: {
        msg: 'Por favor, insira um e-mail válido.',
      },
      notEmpty: {
        msg: 'O e-mail é obrigatório.',
      },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'A senha é obrigatória.',
      },
      // Validação para conter pelo menos um número
      isNumericPassword(value: string) {
        if (!/\d/.test(value)) {
          throw new Error('A senha deve conter pelo menos um número.');
        }
      },
    },
  },
}, {
  sequelize,
  tableName: 'users',
  timestamps: true,
  // Define um "scope" padrão para NUNCA retornar a senha
  defaultScope: {
    attributes: { exclude: ['password'] },
  },
  // Define um "scope" para ser usado QUANDO precisarmos da senha (ex: login)
  scopes: {
    withPassword: {
      attributes: { include: ['password'] },
    },
  },
});

// Hook (Middleware) para fazer o hash da senha antes de Criar (save)
User.beforeCreate(async (user: User) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Hook para fazer o hash da senha antes de Atualizar (update)
User.beforeUpdate(async (user: User) => {
  // Verifica se a senha foi modificada
  if (user.changed('password') && user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Exporta a interface (opcional, mas bom para tipagem) e o modelo
export { IUserAttributes };
export default User;
// src/models/User.ts
import { Model, DataTypes, Optional } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../database/connection';

// ... (Interface IUserAttributes e IUserCreationAttributes permanecem iguais) ...
interface IUserAttributes {
  id: number;
  name: string;
  email: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
interface IUserCreationAttributes extends Optional<IUserAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  password: string;
}

// ... (A classe User permanece a mesma) ...
class User extends Model<IUserAttributes, IUserCreationAttributes> implements IUserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(password: string): Promise<boolean> {
    if (!this.password) {
      return Promise.resolve(false);
    }
    return bcrypt.compare(password, this.password);
  }
}

// ... (O User.init permanece o mesmo) ...
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
    unique: true,
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
  defaultScope: {
    attributes: { exclude: ['password'] },
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] },
    },
  },
});

// ... (Os Hooks beforeCreate e beforeUpdate permanecem os mesmos) ...
User.beforeCreate(async (user: User) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});
User.beforeUpdate(async (user: User) => {
  if (user.changed('password') && user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});


export { IUserAttributes };
export default User;
// src/models/Movie.ts
import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

// Interface para os atributos do Filme
export interface IMovieAttributes {
  id: number;
  title: string;
  director?: string;
  genre?: string;
  year?: number;
  rating?: number;
  watched: boolean;
  userId: number; // Chave estrangeira para o User
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para dados de criação (alguns campos são opcionais)
interface IMovieCreationAttributes extends Optional<IMovieAttributes, 'id' | 'director' | 'genre' | 'year' | 'rating' | 'watched' | 'createdAt' | 'updatedAt'> {}

// Definindo a classe do Modelo
class Movie extends Model<IMovieAttributes, IMovieCreationAttributes> implements IMovieAttributes {
  public id!: number;
  public title!: string;
  public director?: string;
  public genre?: string;
  public year?: number;
  public rating?: number;
  public watched!: boolean;
  public userId!: number; // Chave estrangeira

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inicializando o Modelo (definindo o schema da tabela)
Movie.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O título é obrigatório.',
      },
    },
  },
  director: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  rating: {
    type: DataTypes.FLOAT, // Usar FLOAT ou DECIMAL para notas
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'A nota não pode ser menor que 0.',
      },
      max: {
        args: [10],
        msg: 'A nota não pode ser maior que 10.',
      },
    },
  },
  watched: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Nome da tabela de usuários
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', // Se um usuário for deletado, seus filmes também serão.
  },
}, {
  sequelize,
  tableName: 'movies',
  timestamps: true,
});


export default Movie;
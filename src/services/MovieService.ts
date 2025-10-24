  // src/services/MovieService.ts
  import Movie, { IMovieAttributes } from '../models/Movie';
  import logger from '../utils/logger';
  import { Op } from 'sequelize'; // Importa operadores do Sequelize

  // Interface para os dados de criação/atualização
  type MovieData = Partial<Omit<IMovieAttributes, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

  // Classe para encapsular a lógica de negócios
  class MovieService {

    /**
     * Cria um novo filme associado ao usuário.
     */
    public async create(movieData: MovieData, userId: number): Promise<IMovieAttributes> {
      try {
        // Adiciona o ID do usuário aos dados do filme
        const movie = await Movie.create({ ...movieData, userId });
        logger.info(`Novo filme criado: ${movie.title} (ID: ${movie.id}) pelo usuário ${userId}`);
        return movie.toJSON();
      } catch (error: any) {
        logger.error(`Erro ao criar filme: ${error.message}`, { error });
        throw error;
      }
    }

    /**
     * Lista todos os filmes de um usuário específico, com filtros.
     */
    public async findAll(userId: number, filters: any): Promise<IMovieAttributes[]> {
      try {
        // Objeto de consulta base: sempre filtra pelo usuário
        const where: any = { userId: userId };

        // Adiciona filtros dinâmicos da query string
        if (filters.genre) {
          where.genre = { [Op.iLike]: `%${filters.genre}%` }; // Case-insensitive LIKE
        }
        if (filters.watched) {
          where.watched = filters.watched === 'true'; // Converte string para boolean
        }
        if (filters.rating) {
          where.rating = { [Op.gte]: Number(filters.rating) }; // Maior ou igual
        }

        logger.info(`Buscando filmes para o usuário ${userId} com filtros: ${JSON.stringify(filters)}`);
        const movies = await Movie.findAll({ where });
        return movies.map(movie => movie.toJSON());
      } catch (error: any) {
        logger.error(`Erro ao buscar filmes: ${error.message}`, { error });
        throw error;
      }
    }

    /**
     * Busca um filme específico pelo ID, garantindo que pertença ao usuário.
     */
    public async findById(movieId: number, userId: number): Promise<IMovieAttributes | null> {
      try {
        // Busca pelo ID do filme E pelo ID do usuário
        const movie = await Movie.findOne({ where: { id: movieId, userId: userId } });

        if (!movie) {
          logger.warn(`Filme ${movieId} não encontrado ou não pertence ao usuário ${userId}`);
          return null;
        }

        logger.info(`Filme ${movieId} encontrado para o usuário ${userId}`);
        return movie.toJSON();
      } catch (error: any) {
        logger.error(`Erro ao buscar filme por ID: ${error.message}`, { error });
        throw error;
      }
    }

    /**
     * Atualiza PARCIALMENTE um filme (PATCH).
     * Garante que o filme pertença ao usuário antes de atualizar.
     */
    public async partialUpdate(movieId: number, movieData: MovieData, userId: number): Promise<IMovieAttributes | null> {
      try {
        const movie = await Movie.findOne({ where: { id: movieId, userId: userId } });
        
        if (!movie) {
          logger.warn(`Falha ao atualizar (PATCH): Filme ${movieId} não encontrado ou não pertence ao usuário ${userId}`);
          return null;
        }

        // O .update do Sequelize faz uma atualização parcial (PATCH)
        const updatedMovie = await movie.update(movieData);
        
        logger.info(`Filme ${movieId} atualizado (PATCH) pelo usuário ${userId}`);
        return updatedMovie.toJSON();
      } catch (error: any) {
        logger.error(`Erro ao atualizar (PATCH) filme: ${error.message}`, { error });
        throw error;
      }
    }

    /**
     * SUBSTITUI um filme (PUT).
     * Garante que o filme pertença ao usuário antes de substituir.
     */
    public async replace(movieId: number, movieData: MovieData, userId: number): Promise<IMovieAttributes | null> {
      try {
        const movie = await Movie.findOne({ where: { id: movieId, userId: userId } });

        if (!movie) {
          logger.warn(`Falha ao substituir (PUT): Filme ${movieId} não encontrado ou não pertence ao usuário ${userId}`);
          return null;
        }

        // Para simular um "replace", zeramos os campos opcionais que não vieram no body
        // O 'title' é garantido pelo controller
        movie.title = movieData.title!;
        movie.director = movieData.director || undefined;
        movie.genre = movieData.genre || undefined;
        movie.year = movieData.year || undefined;
        movie.rating = movieData.rating || undefined;
        movie.watched = movieData.watched || false; // default
        
        const replacedMovie = await movie.save(); // Salva o objeto modificado

        logger.info(`Filme ${movieId} substituído (PUT) pelo usuário ${userId}`);
        return replacedMovie.toJSON();
      } catch (error: any) {
        logger.error(`Erro ao substituir (PUT) filme: ${error.message}`, { error });
        throw error;
      }
    }


    /**
     * Remove um filme, garantindo que pertença ao usuário.
     */
    public async delete(movieId: number, userId: number): Promise<boolean> {
      try {
        const movie = await Movie.findOne({ where: { id: movieId, userId: userId } });
        
        if (!movie) {
          logger.warn(`Falha ao deletar: Filme ${movieId} não encontrado ou não pertence ao usuário ${userId}`);
          return false;
        }
        
        await movie.destroy(); // Deleta a instância encontrada
        logger.info(`Filme ${movieId} deletado pelo usuário ${userId}`);
        return true;
      } catch (error: any) {
        logger.error(`Erro ao deletar filme: ${error.message}`, { error });
        throw error;
      }
    }
  }

  export default new MovieService();
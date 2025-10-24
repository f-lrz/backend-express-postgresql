// src/controllers/MovieController.ts
import { Request, Response } from 'express';
import MovieService from '../services/MovieService';

// Estende a interface Request para incluir o usuário (do authMiddleware)
interface AuthenticatedRequest extends Request {
  user?: { id: string; name: string };
}

class MovieController {

  public async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id; // Garantido pelo authMiddleware
      const movie = await MovieService.create(req.body, Number(userId));
      return res.status(201).json(movie);
    } catch (error: any) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  public async getAll(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      // Passa os query params (filtros) para o service
      const movies = await MovieService.findAll(Number(userId), req.query);
      return res.status(200).json(movies);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  public async getById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const movieId = req.params.id;
      const movie = await MovieService.findById(Number(movieId), Number(userId));

      if (!movie) {
        return res.status(404).json({ error: 'Filme não encontrado.' });
      }

      return res.status(200).json(movie);
    } catch (error: any) {
      // Erro de ID inválido (não numérico) pode ser pego aqui
      if (error.name === 'SequelizeDatabaseError') {
        return res.status(400).json({ error: 'ID do filme inválido.' });
      }
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Este método agora lida APENAS com PATCH
  public async update(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const movieId = req.params.id;
      
      const updatedMovie = await MovieService.partialUpdate(Number(movieId), req.body, Number(userId));

      if (!updatedMovie) {
        return res.status(404).json({ error: 'Filme não encontrado.' });
      }

      return res.status(200).json(updatedMovie);
    } catch (error: any) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: error.message });
      }
      if (error.name === 'SequelizeDatabaseError') {
        return res.status(400).json({ error: 'ID do filme inválido.' });
      }
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // NOVO MÉTODO para lidar com PUT
  public async replace(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const movieId = req.params.id;

      // Validação simples: PUT deve conter o 'title', que é obrigatório
      if (!req.body.title) {
         return res.status(400).json({ error: 'Requisição PUT deve conter o corpo completo do objeto, incluindo "title".' });
      }
      
      const replacedMovie = await MovieService.replace(Number(movieId), req.body, Number(userId));

      if (!replacedMovie) {
        return res.status(404).json({ error: 'Filme não encontrado.' });
      }

      return res.status(200).json(replacedMovie);
    } catch (error: any) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: error.message });
      }
      if (error.name === 'SequelizeDatabaseError') {
        return res.status(400).json({ error: 'ID do filme inválido.' });
      }
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }


  public async delete(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const movieId = req.params.id;
      const success = await MovieService.delete(Number(movieId), Number(userId));

      if (!success) {
        return res.status(404).json({ error: 'Filme não encontrado.' });
      }

      // 204 No Content é a resposta padrão para delete bem-sucedido
      return res.status(204).send();
    } catch (error: any) {
      if (error.name === 'SequelizeDatabaseError') {
        return res.status(400).json({ error: 'ID do filme inválido.' });
      }
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

export default new MovieController();
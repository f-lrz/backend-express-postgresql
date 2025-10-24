// src/routes/movieRoutes.ts
import { Router } from 'express';
import MovieController from '../controllers/MovieController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// --- Rotas Protegidas de Filmes ---

// Aplica o middleware de autenticação a TODAS as rotas deste arquivo
router.use(authMiddleware);

// POST /api/movies - Cria um novo filme
router.post('/', MovieController.create);

// GET /api/movies - Lista todos os filmes do usuário (com filtros)
// Ex: GET /api/movies?genre=Drama&watched=true
router.get('/', MovieController.getAll);

// GET /api/movies/:id - Retorna detalhes de um filme
router.get('/:id', MovieController.getById);

// PUT /api/movies/:id - ATUALIZA (SUBSTITUI) todos os dados de um item
router.put('/:id', MovieController.replace);

// PATCH /api/movies/:id - Atualiza parcialmente os dados de um item
router.patch('/:id', MovieController.update);

// DELETE /api/movies/:id - Remove um item
router.delete('/:id', MovieController.delete);

export default router;
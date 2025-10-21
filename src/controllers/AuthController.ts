// src/controllers/AuthController.ts
import { Request, Response } from 'express';
import AuthService from '../services/AuthService';

class AuthController {
  public async register(req: Request, res: Response): Promise<Response> {
    try {
      const user = await AuthService.register(req.body);
      return res.status(201).json({ message: 'Usuário criado com sucesso!', user });
    } catch (error: any) {
      if (error.message.includes('já está em uso')) {
        return res.status(409).json({ error: error.message }); // 409 Conflict
      }
      // Captura erros de validação do Sequelize
      if (error.message.includes('obrigatório') || error.message.includes('válido') || error.message.includes('número')) {
        return res.status(400).json({ error: error.message }); // 400 Bad Request
      }
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // ... O método login() e getProtected() permanecem IDÊNTICOS ...
  //
  public async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
      const token = await AuthService.login(email, password);
      return res.status(200).json({ message: 'Login bem-sucedido!', token });
    } catch (error: any) {
      if (error.message === 'Credenciais inválidas.') {
        return res.status(401).json({ error: error.message }); // 401 Unauthorized
      }
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  public getProtected(req: Request, res: Response): Response {
    // As informações do usuário autenticado podem ser acessadas via req.user (adicionado pelo middleware)
    return res.status(200).json({ message: 'Acesso autorizado a rota protegida!', user: (req as any).user });
  }
}

export default new AuthController();
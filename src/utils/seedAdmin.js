import { connectDB } from '../database/db.js';
import bcrypt from 'bcrypt';
import { logger } from '../config/logger.js';

/**
 * Cria um administrador padrão se não existir nenhum no sistema
 * Executado automaticamente na inicialização do servidor
 */
export async function seedAdmin() {
  try {
    const db = await connectDB();
    
    // Verifica se já existe algum administrador
    const adminExistente = await db.get(
      'SELECT id, email FROM usuarios WHERE role = "admin" LIMIT 1'
    );
    
    if (adminExistente) {
      logger.info(`✅ Admin já existe: ${adminExistente.email}`);
      return;
    }
    
    // Dados do admin padrão (use variáveis de ambiente para segurança)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sdebr.com';
    const adminSenha = process.env.ADMIN_SENHA || 'Admin123';
    const adminNome = process.env.ADMIN_NOME || 'Administrador SDEBR';
    
    // Hash da senha
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const senhaHash = await bcrypt.hash(adminSenha, saltRounds);
    
    // Criar administrador
    await db.run(
      `INSERT INTO usuarios (nome, email, senha, role, status, created_at)
       VALUES (?, ?, ?, 'admin', 'ativo', CURRENT_TIMESTAMP)`,
      [adminNome, adminEmail, senhaHash]
    );
    
    logger.warn(`
╔══════════════════════════════════════════════════════════════╗
║                    🔐 ADMIN CRIADO AUTOMATICAMENTE           ║
╠══════════════════════════════════════════════════════════════╣
║  Email: ${adminEmail.padEnd(44)}║
║  Senha: ${adminSenha.padEnd(44)}║
╠══════════════════════════════════════════════════════════════╣
║  ⚠️  ALTERE A SENHA APÓS O PRIMEIRO LOGIN!                   ║
╚══════════════════════════════════════════════════════════════╝
    `);
    
  } catch (err) {
    logger.error('Erro ao criar admin inicial:', err);
  }
}
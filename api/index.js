const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const moviesRoutes = require('./routes/movies');
const authRoutes = require('./routes/auth');

const app = express();

// Middlewares essenciais
app.use(cors());
// Limite aumentado para suportar upload de imagens em formato Base64 (Data URI)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Servir frontend estático durante desenvolvimento local
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Rota de verificação de status (Health Check)
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🎬 API do Sistema de Gerenciamento de Filmes ativa!',
    endpoints: {
      auth: '/api/auth',
      movies: '/api/movies',
    },
    version: '1.0.0',
  });
});

// Rotas da API de Autenticação e Filmes
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);

// Rota de fallback para SPA local
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'Rota da API não encontrada.',
    });
  }
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Tratamento global de erros não capturados
app.use((err, req, res, next) => {
  console.error('Erro global na API:', err);
  res.status(err.status || 500).json({
    success: false,
    message: 'Erro interno no servidor.',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

// Exporta para a Vercel executar como Serverless Function
module.exports = app;

// Se executado diretamente (localmente via node api/index.js)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando localmente em: http://localhost:${PORT}`);
    console.log(`📁 Frontend disponível em: http://localhost:${PORT}`);
    console.log(`📡 API disponível em: http://localhost:${PORT}/api/movies`);
  });
}

import http from 'http';
import path from 'path';
import { loadDoctrineFiles, loadAllowlist } from './loader.js';
import { validateDoctrine } from './validator.js';
import { logger } from './logger.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  
  if (req.url === '/report' && req.method === 'GET') {
    try {
      const docsDir = path.resolve(process.cwd(), 'docs');
      const files = await loadDoctrineFiles(docsDir);
      const allowlist = await loadAllowlist(docsDir);
      const result = await validateDoctrine(files, allowlist);
      
      res.writeHead(200);
      res.end(JSON.stringify(result, null, 2));
    } catch (error) {
      logger.error('Report generation failed', error);
      res.writeHead(500);
      res.end(JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error) 
      }));
    }
    return;
  }
  
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`THEFENCE server listening on http://localhost:${PORT}`);
  console.log(`  GET /health - Health check`);
  console.log(`  GET /report - Validation report`);
});

/**
 * dev-server.js
 * 
 * AIRMOD 로컬 통합 개발 서버 (Node.js 내장 http 모듈 기반)
 * 
 * 기능:
 * 1. 정적 웹 파일(index.html, src/, public/)을 브라우저에 서빙합니다.
 * 2. /api/models, /api/accessories, /api/recommend, /api/images API 요청을 직접 처리합니다.
 * 3. 별도의 복잡한 CLI 설치 없이 `node dev-server.js` 명령어 한 줄로 즉시 로컬 실행이 가능합니다!
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// .env 환경변수 로드
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// API 핸들러 동적 임포트
import modelsHandler from './api/models.js';
import accessoriesHandler from './api/accessories.js';
import recommendHandler from './api/recommend.js';
import imagesHandler from './api/images.js';

// MIME 타입 매핑
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Vercel Serverless Function 형태의 req, res 래퍼 생성
function wrapResponse(res) {
  res.status = function (statusCode) {
    res.statusCode = statusCode;
    return res;
  };
  res.json = function (data) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.end(JSON.stringify(data));
    return res;
  };
  return res;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // 1. API 라우팅 (/api/*)
  if (pathname.startsWith('/api/')) {
    wrapResponse(res);
    req.query = Object.fromEntries(parsedUrl.searchParams.entries());

    // POST 바디 파싱
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          req.body = body ? JSON.parse(body) : {};
        } catch {
          req.body = {};
        }

        try {
          if (pathname === '/api/models') await modelsHandler(req, res);
          else if (pathname === '/api/accessories') await accessoriesHandler(req, res);
          else if (pathname === '/api/recommend') await recommendHandler(req, res);
          else if (pathname === '/api/images') await imagesHandler(req, res);
          else res.status(404).json({ error: { message: '존재하지 않는 API입니다.' } });
        } catch (e) {
          console.error('[SERVER ERROR]', e);
          res.status(500).json({ error: { message: '서버 내부 오류가 발생했습니다.' } });
        }
      });
      return;
    }

    // GET 요청 처리
    try {
      if (pathname === '/api/models') await modelsHandler(req, res);
      else if (pathname === '/api/accessories') await accessoriesHandler(req, res);
      else if (pathname === '/api/recommend') await recommendHandler(req, res);
      else if (pathname === '/api/images') await imagesHandler(req, res);
      else res.status(404).json({ error: { message: '존재하지 않는 API입니다.' } });
    } catch (e) {
      console.error('[SERVER ERROR]', e);
      res.status(500).json({ error: { message: '서버 내부 오류가 발생했습니다.' } });
    }
    return;
  }

  // 2. 정적 파일 서빙 (HTML, CSS, JS, 에셋)
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 파일이 없으면 index.html로 fallback
      filePath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('파일 읽기 오류');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`  🚀 AIRMOD 개발 서버가 실행되었습니다!`);
  console.log(`  👉 브라우저 주소: http://localhost:${PORT}`);
  console.log(`  종료하려면 터미널에서 Ctrl + C 를 누르세요.`);
  console.log(`==================================================\n`);
});


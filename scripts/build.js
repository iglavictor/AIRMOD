/**
 * AIRMOD 정적 빌드 스크립트 (scripts/build.js)
 * 
 * 역할을 이해하기 쉽게 설명:
 * 1. 기존의 dist/ 폴더를 깨끗하게 지웁니다(초기화).
 * 2. index.html, public/ 에셋, src/ (CSS 및 프론트엔드 JS 모듈) 폴더를 dist/ 로 그대로 복사합니다.
 * 3. Vercel 배포 시 dist 폴더가 브라우저에 표시되는 최종 정적 파일 모음이 됩니다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// 1. 디렉터리 재귀 복사 유틸 함수
function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 2. 빌드 실행
function build() {
  console.log('[BUILD] 빌드 프로세스를 시작합니다...');

  // dist 폴더 초기화
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log('[BUILD] 기존 dist/ 폴더를 정리했습니다.');
  }
  fs.mkdirSync(distDir, { recursive: true });

  // index.html 복사
  const indexHtmlPath = path.join(rootDir, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    fs.copyFileSync(indexHtmlPath, path.join(distDir, 'index.html'));
    console.log('[BUILD] index.html 복사 완료');
  }

  // public/ 폴더 복사
  const publicPath = path.join(rootDir, 'public');
  if (fs.existsSync(publicPath)) {
    copyDirectoryRecursive(publicPath, path.join(distDir, 'public'));
    console.log('[BUILD] public/ 에셋 폴더 복사 완료');
  }

  // src/ 폴더 복사
  const srcPath = path.join(rootDir, 'src');
  if (fs.existsSync(srcPath)) {
    copyDirectoryRecursive(srcPath, path.join(distDir, 'src'));
    console.log('[BUILD] src/ (CSS 및 JS) 폴더 복사 완료');
  }

  console.log('[BUILD] 빌드가 성공적으로 완료되었습니다. (출력 디렉터리: dist/)');
}

build();


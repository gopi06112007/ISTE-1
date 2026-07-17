import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { test } from 'node:test';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const srcDir = join(root, 'src');

const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8');

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

test('public routes and dashboards are lazy-loaded', () => {
  const app = read('src/App.jsx');

  for (const page of [
    './pages/Home',
    './pages/Coordinators',
    './pages/Events',
    './pages/Gallery',
    './pages/Blog',
    './pages/Login',
    './pages/dashboard/CentralDashboard',
  ]) {
    assert.match(app, new RegExp(`lazy\\(\\(\\) => import\\('${page.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'\\)\\)`));
  }

  assert.match(app, /Suspense fallback=\{<PageLoader \/>\}/);
});

test('heavy visual/editor code is split behind lazy boundaries', () => {
  assert.match(read('src/components/home/HeroBackdrop.jsx'), /lazy\(\(\) => import\('\.\.\/HeroBackground3D'\)\)/);
  assert.match(read('src/components/LazyRichTextEditor.jsx'), /lazy\(\(\) => import\('\.\/RichTextEditor'\)\)/);
});

test('security-sensitive HTML rendering is constrained', () => {
  const files = walk(srcDir).filter((file) => file.endsWith('.jsx') || file.endsWith('.js'));
  const unsafe = files
    .filter((file) => readFileSync(file, 'utf8').includes('dangerouslySetInnerHTML'))
    .map((file) => normalize(file).replace(normalize(root), '').replace(/^[/\\]/, ''));

  assert.deepEqual(unsafe, ['src\\pages\\BlogDetail.jsx']);
  assert.match(read('src/pages/BlogDetail.jsx'), /sanitizeBlogContent\(blog\.content\)/);
  assert.doesNotMatch(read('src/pages/dashboard/CentralDashboard.jsx'), /dangerouslySetInnerHTML/);
});

test('blocking browser alerts are not used in app code', () => {
  const offenders = walk(srcDir)
    .filter((file) => /\.(jsx|js)$/.test(file))
    .filter((file) => /\balert\s*\(/.test(readFileSync(file, 'utf8')))
    .map((file) => normalize(file).replace(normalize(root), '').replace(/^[/\\]/, ''));

  assert.deepEqual(offenders, []);
});

test('mobile navigation exposes dialog semantics and focus controls', () => {
  const navbar = read('src/components/Navbar.jsx');

  assert.match(navbar, /role="dialog"/);
  assert.match(navbar, /aria-modal="true"/);
  assert.match(navbar, /aria-expanded=\{isMobileOpen\}/);
  assert.match(navbar, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(navbar, /event\.key === 'Escape'/);
});

test('responsive home sections keep mobile and desktop layouts', () => {
  const sections = read('src/components/home/HomeSections.jsx');

  assert.match(sections, /sm:hidden/);
  assert.match(sections, /hidden sm:flex/);
  assert.match(sections, /hidden sm:grid/);
  assert.match(sections, /focus-visible:ring/);
});

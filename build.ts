import { build as viteBuild } from 'vite';
import { build as esbuild } from 'esbuild';

async function buildExtension() {
  console.log('🔨 Building popup with Vite...');
  await viteBuild();

  console.log('🔨 Building content script...');
  await esbuild({
    entryPoints: ['src/content/content.ts'],
    bundle: true,
    outfile: 'dist/content.js',
    format: 'iife',
    target: 'chrome100',
    minify: true,
  });

  console.log('🔨 Building background service worker...');
  await esbuild({
    entryPoints: ['src/background/background.ts'],
    bundle: true,
    outfile: 'dist/background.js',
    format: 'iife',
    target: 'chrome100',
    minify: true,
  });

  console.log('✅ Extension built successfully!');
}

buildExtension().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});

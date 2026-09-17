import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { downloadArtifact } from '@electron/get';

const __dirname = dirname(fileURLToPath(import.meta.url));
const systemRoot = resolve(__dirname, '..');
const electronPackageRoot = join(systemRoot, 'node_modules', 'electron');
const electronPackage = JSON.parse(
  readFileSync(join(electronPackageRoot, 'package.json'), 'utf8')
);
const version = electronPackage.version;
const platformPath = getPlatformPath();
const distPath = join(electronPackageRoot, 'dist');
const versionPath = join(distPath, 'version');
const pathTxtPath = join(electronPackageRoot, 'path.txt');
const executablePath = join(distPath, platformPath);

if (isComplete()) {
  process.exit(0);
}

const zipPath = await downloadArtifact({
  version,
  artifactName: 'electron',
  platform: process.platform,
  arch: process.arch,
  checksums: JSON.parse(readFileSync(join(electronPackageRoot, 'checksums.json'), 'utf8'))
});

rmSync(distPath, { recursive: true, force: true });
mkdirSync(distPath, { recursive: true });
execFileSync('unzip', ['-q', '-o', zipPath, '-d', distPath], { stdio: 'inherit' });
writeFileSync(pathTxtPath, platformPath);
writeFileSync(versionPath, version);

if (!isComplete()) {
  throw new Error(
    `Electron dist repair failed: expected ${executablePath} plus ${versionPath}`
  );
}

console.log(`electron dist ready: ${version} (${platformPath})`);

function isComplete() {
  if (!existsSync(executablePath) || !existsSync(versionPath) || !existsSync(pathTxtPath)) {
    return false;
  }
  const installedVersion = readFileSync(versionPath, 'utf8').trim().replace(/^v/, '');
  const installedPath = readFileSync(pathTxtPath, 'utf8').trim();
  return installedVersion === version && installedPath === platformPath;
}

function getPlatformPath() {
  switch (process.platform) {
    case 'darwin':
      return 'Electron.app/Contents/MacOS/Electron';
    case 'freebsd':
    case 'openbsd':
    case 'linux':
      return 'electron';
    case 'win32':
      return 'electron.exe';
    default:
      throw new Error(`Electron builds are not available on platform: ${process.platform}`);
  }
}

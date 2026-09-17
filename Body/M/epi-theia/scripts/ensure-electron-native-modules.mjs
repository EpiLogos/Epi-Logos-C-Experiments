import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const systemRoot = resolve(__dirname, '..');
const electronPackageRoot = join(systemRoot, 'node_modules', 'electron');
const electronPackage = JSON.parse(readFileSync(join(electronPackageRoot, 'package.json'), 'utf8'));
const electronVersion = electronPackage.version;
const electronBinary = join(electronPackageRoot, 'dist', getPlatformPath());
const nodeGyp = join(systemRoot, 'node_modules', 'node-gyp', 'bin', 'node-gyp.js');
const drivelistRoot = join(systemRoot, 'node_modules', 'drivelist');
const drivelistNative = join(drivelistRoot, 'build', 'Release', 'drivelist.node');
const bundledNative = join(systemRoot, 'electron-app', 'lib', 'backend', 'native', 'drivelist.node');

if (!existsSync(electronBinary)) {
  throw new Error(`Electron binary is missing at ${electronBinary}; run ensure-electron-dist first.`);
}

if (loadsInElectron("require('drivelist')") && bundledNativeLoads()) {
  process.exit(0);
}

rebuildDrivelistForElectron();
copyFileSync(drivelistNative, bundledNative);

if (!loadsInElectron("require('drivelist')") || !bundledNativeLoads()) {
  throw new Error('Electron native module repair failed: drivelist still does not load in Electron.');
}

console.log(`electron native modules ready: drivelist for Electron ${electronVersion}`);

function rebuildDrivelistForElectron() {
  if (!existsSync(nodeGyp)) {
    throw new Error(`node-gyp is missing at ${nodeGyp}`);
  }
  if (!existsSync(join(drivelistRoot, 'binding.gyp'))) {
    throw new Error(`drivelist sources are missing at ${drivelistRoot}`);
  }

  const env = {
    ...process.env,
    npm_config_runtime: 'electron',
    npm_config_target: electronVersion,
    npm_config_disturl: 'https://electronjs.org/headers',
    npm_config_arch: process.arch
  };
  const sdkRoot = process.platform === 'darwin' ? macosSdkRoot() : undefined;
  if (sdkRoot) {
    env.SDKROOT = sdkRoot;
  }

  run(process.execPath, [nodeGyp, 'configure'], { cwd: drivelistRoot, env });
  if (sdkRoot) {
    patchDrivelistMakefile(sdkRoot);
  }
  run(process.execPath, [nodeGyp, 'build'], { cwd: drivelistRoot, env });
}

function patchDrivelistMakefile(sdkRoot) {
  const makefile = join(drivelistRoot, 'build', 'drivelist.target.mk');
  let contents = readFileSync(makefile, 'utf8');
  const sdkFlags = [
    `\t-isysroot ${sdkRoot}`,
    `\t-isystem ${sdkRoot}/usr/include/c++/v1`
  ];

  contents = prependMakeFlags(contents, 'CFLAGS_CC_Debug', sdkFlags);
  contents = prependMakeFlags(contents, 'CFLAGS_CC_Release', sdkFlags);
  contents = setMakeFlags(contents, 'CFLAGS_OBJCC_Debug', sdkFlags);
  contents = setMakeFlags(contents, 'CFLAGS_OBJCC_Release', sdkFlags);
  writeFileSync(makefile, contents);
}

function prependMakeFlags(contents, variable, flags) {
  const marker = `${variable} := \\`;
  if (!contents.includes(marker)) {
    throw new Error(`Expected ${variable} in drivelist makefile.`);
  }
  const markerIndex = contents.indexOf(marker);
  const nextVariableIndex = contents.indexOf('\n\n#', markerIndex);
  const variableBlock = contents.slice(
    markerIndex,
    nextVariableIndex === -1 ? contents.length : nextVariableIndex
  );
  if (variableBlock.includes(flags[0])) {
    return contents;
  }
  return contents.replace(marker, `${marker}\n${flags.map(flag => `${flag} \\`).join('\n')}`);
}

function setMakeFlags(contents, variable, flags) {
  const replacement = `${variable} := \\\n${flags.map((flag, index) => (
    index === flags.length - 1 ? flag : `${flag} \\`
  )).join('\n')}`;
  return contents.replace(new RegExp(`^${variable} :=$`, 'm'), replacement);
}

function bundledNativeLoads() {
  if (!existsSync(bundledNative)) {
    return true;
  }
  return loadsInElectron(`require(${JSON.stringify(bundledNative)})`);
}

function loadsInElectron(script) {
  const result = spawnSync(electronBinary, ['-e', script], {
    cwd: systemRoot,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    encoding: 'utf8'
  });
  return result.status === 0;
}

function macosSdkRoot() {
  if (process.platform !== 'darwin') {
    return '';
  }
  const result = spawnSync('xcrun', ['--show-sdk-path'], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`Unable to resolve macOS SDK path:\n${result.stderr}`);
  }
  return result.stdout.trim();
}

function run(command, args, options) {
  const result = spawnSync(command, args, {
    ...options,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed with ${result.status}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
  }
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

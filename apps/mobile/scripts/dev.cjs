#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

function startProcess(name, command, args, cwd) {
  const isWin = process.platform === 'win32';
  const proc = spawn(isWin ? 'cmd.exe' : '/bin/sh', isWin ? ['/c', command, ...args] : ['-c', `${command} ${args.join(' ')}`], {
    env: process.env,
    stdio: 'pipe',
    cwd: cwd || process.cwd(),
  });
  proc.stdout.on('data', d => process.stdout.write(`[${name}] ${d}`));
  proc.stderr.on('data', d => process.stderr.write(`[${name}] ${d}`));
  return proc;
}

async function main() {
  console.log('[DEV] 启动 API 服务器...');
  const apiProc = startProcess('API', 'pnpm', ['--filter', '@sonic-music/api', 'start'], path.resolve(__dirname, '../../..'));

  // 等待 API 启动并写入端口文件
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('[DEV] 启动 Mobile H5...');
  const mobileProc = startProcess('MOBILE', 'pnpm', ['run', 'dev:h5'], path.resolve(__dirname, '..'));

  const cleanup = () => {
    apiProc.kill();
    mobileProc.kill();
    process.exit(0);
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main();

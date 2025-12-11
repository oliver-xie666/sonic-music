#!/usr/bin/env node

/**
 * 开发环境启动脚本
 * 功能：
 * 1. 并行启动 API 服务器
 * 2. 启动 Vite 开发服务器并获取实际端口
 * 3. 将端口传递给 Electron 并启动
 */

const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(prefix, color, message) {
  console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

// 检查端口是否可用
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '127.0.0.1');
  });
}

// 查找可用端口
async function findAvailablePort(startPort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`无法在 ${startPort}-${startPort + maxAttempts - 1} 范围内找到可用端口`);
}

// 启动进程
function startProcess(name, command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd.exe' : '/bin/sh';
    const shellArgs = isWindows ? ['/c', command, ...args] : ['-c', `${command} ${args.join(' ')}`];

    const proc = spawn(shell, shellArgs, {
      env: { ...process.env, ...env },
      stdio: 'pipe',
      cwd: process.cwd(),
    });

    proc.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(`${colors.cyan}[${name}]${colors.reset} ${output}`);
    });

    proc.stderr.on('data', (data) => {
      const output = data.toString();
      process.stderr.write(`${colors.yellow}[${name}]${colors.reset} ${output}`);
    });

    proc.on('error', (error) => {
      log(name, colors.red, `启动失败: ${error.message}`);
      reject(error);
    });

    proc.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        log(name, colors.red, `进程退出，退出码: ${code}`);
      }
    });

    resolve(proc);
  });
}

async function main() {
  try {
    log('DEV', colors.green, '🚀 启动开发环境...\n');

    // 1. 启动 API 服务器
    log('API', colors.blue, '启动 API 服务器...');
    const apiProcess = await startProcess('API', 'pnpm', ['--filter', '@sonic-music/api', 'start']);

    // 等待 API 服务器启动
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. 查找可用端口并启动 Vite
    log('VITE', colors.magenta, '检查端口可用性...');
    const vitePort = await findAvailablePort(8080);

    if (vitePort !== 8080) {
      log('VITE', colors.yellow, `端口 8080 已被占用，使用端口 ${vitePort}`);
    } else {
      log('VITE', colors.green, `使用端口 ${vitePort}`);
    }

    log('VITE', colors.magenta, '启动 Vite 开发服务器...');
    const viteProcess = await startProcess('VITE', 'pnpm', ['run', 'serve'], {
      VITE_PORT: vitePort.toString(),
    });

    // 等待 Vite 启动
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. 启动 Electron
    log('ELECTRON', colors.cyan, '启动 Electron 应用...');
    const electronProcess = await startProcess('ELECTRON', 'pnpm', ['run', 'electron:serve'], {
      VITE_DEV_SERVER_PORT: vitePort.toString(),
    });

    log('DEV', colors.green, '\n✅ 所有服务已启动！\n');
    log('DEV', colors.green, `📡 API 服务器: http://localhost:6521`);
    log('DEV', colors.green, `🌐 Vite 服务器: http://localhost:${vitePort}`);
    log('DEV', colors.green, `🖥️  Electron 应用已启动\n`);

    // 处理退出信号
    const cleanup = () => {
      log('DEV', colors.yellow, '\n正在关闭所有服务...');

      if (electronProcess) electronProcess.kill();
      if (viteProcess) viteProcess.kill();
      if (apiProcess) apiProcess.kill();

      setTimeout(() => {
        process.exit(0);
      }, 1000);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);

  } catch (error) {
    log('DEV', colors.red, `❌ 启动失败: ${error.message}`);
    process.exit(1);
  }
}

main();

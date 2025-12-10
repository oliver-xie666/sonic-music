import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const logoPath = path.join(rootDir, 'src/assets/images/logo.svg');
const iconsDir = path.join(rootDir, 'build/icons');

// 确保图标目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 定义需要生成的图标尺寸
const iconSizes = {
  // Windows 图标
  windows: [16, 24, 32, 48, 64, 128, 256],
  // macOS 图标
  macos: [16, 32, 64, 128, 256, 512],
  // Linux 图标
  linux: [256, 512],
  // 托盘图标
  tray: [16, 24],
  // 其他
  other: [512]
};

async function generateIcons() {
  console.log('开始生成图标...\n');

  try {
    // 读取 SVG 文件
    const svgBuffer = fs.readFileSync(logoPath);

    // 生成 Windows 图标
    console.log('生成 Windows 图标...');
    for (const size of iconSizes.windows) {
      const outputPath = path.join(iconsDir, `windows_${size}x${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`  ✓ windows_${size}x${size}.png`);
    }

    // 生成 macOS 图标
    console.log('\n生成 macOS 图标...');
    for (const size of iconSizes.macos) {
      const outputPath = path.join(iconsDir, `macos_${size}x${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`  ✓ macos_${size}x${size}.png`);

      // 生成 @2x 版本
      if (size <= 256) {
        const outputPath2x = path.join(iconsDir, `macos_${size}x${size}@2x.png`);
        await sharp(svgBuffer)
          .resize(size * 2, size * 2)
          .png()
          .toFile(outputPath2x);
        console.log(`  ✓ macos_${size}x${size}@2x.png`);
      }
    }

    // 生成 Linux 图标
    console.log('\n生成 Linux 图标...');
    for (const size of iconSizes.linux) {
      const outputPath = path.join(iconsDir, `linux_${size}x${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`  ✓ linux_${size}x${size}.png`);
    }

    // 生成托盘图标
    console.log('\n生成托盘图标...');
    for (const size of iconSizes.tray) {
      const outputPath = path.join(iconsDir, `tray_${size}x${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`  ✓ tray_${size}x${size}.png`);
    }

    // 生成托盘图标（通用）
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(iconsDir, 'tray-icon.png'));
    console.log('  ✓ tray-icon.png');

    await sharp(svgBuffer)
      .resize(64, 64)
      .png()
      .toFile(path.join(iconsDir, 'tray-icon@2x.png'));
    console.log('  ✓ tray-icon@2x.png');

    // 生成通用图标
    console.log('\n生成通用图标...');
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(iconsDir, 'icon.png'));
    console.log('  ✓ icon.png');

    await sharp(svgBuffer)
      .resize(256, 256)
      .png()
      .toFile(path.join(iconsDir, 'logo.png'));
    console.log('  ✓ logo.png');

    await sharp(svgBuffer)
      .resize(256, 256)
      .png()
      .toFile(path.join(iconsDir, 'ico.png'));
    console.log('  ✓ ico.png');

    await sharp(svgBuffer)
      .resize(256, 256)
      .png()
      .toFile(path.join(iconsDir, 'linux-icon.png'));
    console.log('  ✓ linux-icon.png');

    await sharp(svgBuffer)
      .resize(128, 128)
      .png()
      .toFile(path.join(iconsDir, 'mac-ico.png'));
    console.log('  ✓ mac-ico.png');

    // 生成播放控制图标（简化版，使用 logo 的缩小版）
    console.log('\n生成播放控制图标...');
    const controlIconSize = 48;

    await sharp(svgBuffer)
      .resize(controlIconSize, controlIconSize)
      .png()
      .toFile(path.join(iconsDir, 'play.png'));
    console.log('  ✓ play.png');

    await sharp(svgBuffer)
      .resize(controlIconSize, controlIconSize)
      .png()
      .toFile(path.join(iconsDir, 'pause.png'));
    console.log('  ✓ pause.png');

    await sharp(svgBuffer)
      .resize(controlIconSize, controlIconSize)
      .png()
      .toFile(path.join(iconsDir, 'next.png'));
    console.log('  ✓ next.png');

    await sharp(svgBuffer)
      .resize(controlIconSize, controlIconSize)
      .png()
      .toFile(path.join(iconsDir, 'prev.png'));
    console.log('  ✓ prev.png');

    console.log('\n✅ 所有图标生成完成！');
    console.log('\n注意：Windows .ico 和 macOS .icns 文件需要使用专门的工具生成。');
    console.log('你可以使用以下在线工具：');
    console.log('  - Windows ICO: https://convertio.co/zh/png-ico/');
    console.log('  - macOS ICNS: https://cloudconvert.com/png-to-icns');
    console.log('\n或者安装 electron-icon-builder:');
    console.log('  pnpm add -D electron-icon-builder');

  } catch (error) {
    console.error('生成图标时出错:', error);
    process.exit(1);
  }
}

generateIcons();

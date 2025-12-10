import pngToIco from 'png-to-ico';
import png2icons from 'png2icons';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const iconsDir = path.join(rootDir, 'build/icons');

async function generateIcoAndIcns() {
  console.log('开始生成 .ico 和 .icns 文件...\n');

  try {
    // 生成 Windows .ico 文件（应用图标）
    console.log('生成 Windows .ico 文件...');
    const iconPngFiles = [
      path.join(iconsDir, 'windows_16x16.png'),
      path.join(iconsDir, 'windows_24x24.png'),
      path.join(iconsDir, 'windows_32x32.png'),
      path.join(iconsDir, 'windows_48x48.png'),
      path.join(iconsDir, 'windows_64x64.png'),
      path.join(iconsDir, 'windows_128x128.png'),
      path.join(iconsDir, 'windows_256x256.png')
    ];

    const iconIcoBuffer = await pngToIco(iconPngFiles);
    fs.writeFileSync(path.join(iconsDir, 'icon.ico'), iconIcoBuffer);
    console.log('  ✓ icon.ico');

    // 生成 Windows .ico 文件（托盘图标）
    const trayPngFiles = [
      path.join(iconsDir, 'tray_16x16.png'),
      path.join(iconsDir, 'tray_24x24.png')
    ];

    const trayIcoBuffer = await pngToIco(trayPngFiles);
    fs.writeFileSync(path.join(iconsDir, 'tray-icon.ico'), trayIcoBuffer);
    console.log('  ✓ tray-icon.ico');

    // 生成 macOS .icns 文件
    console.log('\n生成 macOS .icns 文件...');

    // 使用 512x512 的图标作为源
    const iconPngBuffer = fs.readFileSync(path.join(iconsDir, 'icon.png'));
    const icnsBuffer = await png2icons.createICNS(iconPngBuffer, png2icons.BILINEAR, 0);
    fs.writeFileSync(path.join(iconsDir, 'icon.icns'), icnsBuffer);
    console.log('  ✓ icon.icns');

    console.log('\n✅ 所有 .ico 和 .icns 文件生成完成！');

  } catch (error) {
    console.error('生成图标时出错:', error);
    process.exit(1);
  }
}

generateIcoAndIcns();

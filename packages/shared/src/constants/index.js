/**
 * 共享常量
 * 来源：apps/electron/src/utils/utils.js applyColorTheme()
 */

export const QUALITY_MAP = {
  standard: '标准',
  high: '高品质',
  lossless: '无损',
  hires: 'Hi-Res',
}

export const THEME_COLORS = {
  pink: {
    '--primary-color': '#FF69B4',
    '--secondary-color': '#FFB6C1',
    '--background-color': '#FFF0F5',
    '--background-color-secondary': '#FFE6F0',
    '--color-primary': '#ea33e4',
    '--color-primary-light': 'rgba(255, 105, 180, 0.1)',
    '--border-color': '#FFD9E6',
    '--hover-color': '#FFE9F2',
    '--color-box-shadow': 'rgba(255, 105, 180, 0.2)',
  },
  blue: {
    '--primary-color': '#4A90E2',
    '--secondary-color': '#AEDFF7',
    '--background-color': '#E8F4FA',
    '--background-color-secondary': '#D9EEFA',
    '--color-primary': '#2A6DAF',
    '--color-primary-light': 'rgba(74, 144, 226, 0.1)',
    '--border-color': '#C5E0F5',
    '--hover-color': '#D1E9F9',
    '--color-box-shadow': 'rgba(74, 144, 226, 0.2)',
  },
  green: {
    '--primary-color': '#34C759',
    '--secondary-color': '#A7F3D0',
    '--background-color': '#E5F9F0',
    '--background-color-secondary': '#D0F5E6',
    '--color-primary': '#28A745',
    '--color-primary-light': 'rgba(52, 199, 89, 0.1)',
    '--border-color': '#B8ECD7',
    '--hover-color': '#C9F2E2',
    '--color-box-shadow': 'rgba(52, 199, 89, 0.2)',
  },
  orange: {
    '--primary-color': '#ff6b6b',
    '--secondary-color': '#FFB6C1',
    '--background-color': '#FFF0F5',
    '--background-color-secondary': '#FFE6EC',
    '--color-primary': '#ea33e4',
    '--color-primary-light': 'rgba(255, 107, 107, 0.1)',
    '--border-color': '#FFDCE3',
    '--hover-color': '#FFE9EF',
    '--color-box-shadow': 'rgba(255, 105, 180, 0.2)',
  },
}

export const DEFAULT_API_URL = 'http://127.0.0.1:6521'

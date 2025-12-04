# Sonic Music 🎵

[English](./README.en.md) | [简体中文](./README.md) | [日本語](./README.ja.md) | 한국어

다중 소스를 지원하는 현대적인 크로스 플랫폼 음악 플레이어.

![Sonic Music](./assets/icons/icon.svg)

## ✨ 기능

- 🎨 현대적인 글래스모피즘 UI 디자인
- 🎵 다중 소스 지원 (Kugou, NetEase Cloud Music, 로컬 파일 등)
- 📱 크로스 플랫폼: Web, 데스크톱 (Electron), 모바일 (uni-app x)
- 🌈 앨범 아트워크 기반 동적 테마 색상
- 📝 문자 단위 하이라이트가 있는 스마트 가사
- 💾 로컬 음악 라이브러리 관리
- 🎧 고품질 오디오 재생
- 🌍 다국어 지원 (영어, 중국어, 일본어, 한국어)
- ⌨️ 전역 단축키
- 📻 데스크톱 가사 창
- 🔄 재생 모드 (셔플, 반복 등)

## 📦 설치

### 데스크톱 앱

[Releases](https://github.com/oliver-xie666/sonic-music/releases) 페이지에서 최신 버전을 다운로드하세요.

### 웹 버전

[Sonic Music Web](https://sonic-music.app) 방문 (곧 출시)

## 🛠️ 개발

### 사전 요구사항

- Node.js >= 20.0.0
- pnpm >= 8.0.0

### 설정

```bash
# 저장소 복제
git clone https://github.com/oliver-xie666/sonic-music.git
cd sonic-music

# pnpm 설치 (아직 설치하지 않은 경우)
npm install -g pnpm

# 의존성 설치
pnpm install

# 개발 모드 시작 (Electron + Web + API)
pnpm dev

# 웹만 시작
pnpm dev:web

# Electron만 시작
pnpm dev:electron
```

### 빌드

```bash
# 웹 버전 빌드
pnpm build:web

# Windows 앱 빌드
pnpm build:electron:win

# macOS 앱 빌드
pnpm build:electron:macos

# Linux 앱 빌드
pnpm build:electron:linux
```

## 📁 프로젝트 구조

```
sonic-music/
├── src/                  # Vue 3 소스 코드
│   ├── components/       # UI 컴포넌트
│   ├── views/           # 페이지 뷰
│   ├── stores/          # Pinia 스토어
│   ├── router/          # Vue Router
│   ├── utils/           # 유틸리티
│   └── language/        # i18n 번역
├── electron/            # Electron 메인 프로세스
├── api/                 # 음악 API 서버
├── public/              # 정적 자산
├── build/               # 빌드 리소스 (아이콘 등)
├── apps/
│   ├── electron/        # Electron 데스크톱 앱
│   └── mobile/          # uni-app x 모바일 앱 (개발 중)
└── packages/            # 공유 패키지 (개발 중)
```

## 🎯 기술 스택

- **프론트엔드**: Vue 3 + Pinia + Vue Router + Vue i18n
- **빌드 도구**: Vite 7
- **데스크톱**: Electron 39
- **모바일**: uni-app x (개발 중)
- **API**: Node.js + Express
- **스타일링**: CSS + 동적 테마

## 🤝 기여

기여를 환영합니다! 자세한 내용은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 읽어주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다 - 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

## ⚠️ 면책 조항

이 프로젝트는 교육 목적으로만 사용됩니다. 저작권을 존중하고 공식 음악 플랫폼을 지원해주세요.

## 🙏 감사의 말

이 프로젝트는 여러 우수한 오픈 소스 음악 플레이어를 기반으로 구축되고 영감을 받았습니다:

- **[MoeKoeMusic](https://github.com/Kaidesuyo/MoeKoeMusic)** - 이 프로젝트의 원래 기반, 핵심 아키텍처 및 UI 디자인 제공
- **[VutronMusic](https://github.com/jooy2/vutron)** - Electron + Vue 3 + Vite 통합 패턴
- **[AlgerMusicPlayer](https://github.com/algerkong/AlgerMusicPlayer)** - 음악 플레이어 아키텍처 및 기능 영감
- **[YesPlayMusic](https://github.com/qier222/YesPlayMusic)** - 아름다운 UI 디자인 및 사용자 경험 영감
- **[lx-music-desktop](https://github.com/lyswhut/lx-music-desktop)** - 데스크톱 음악 플레이어 모범 사례

특별한 감사:
- **[KuGouMusicApi](https://github.com/MakcRe/KuGouMusicApi)** - 음악 API 통합

이러한 프로젝트와 기여자들에게 감사드립니다!

## 📧 연락처

- 작성자: oliver-xie666
- 이메일: 153884673@qq.com
- GitHub: [@oliver-xie666](https://github.com/oliver-xie666)

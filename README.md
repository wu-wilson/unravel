## ⚡ Overview

**Unravel** is an interactive CLI tool that untangles your project's dependencies—see bundle sizes and track imports.

## 🎬 Video Demo

Coming Soon!

## 🚀 Stack

- [React-Ink](https://github.com/vadimdemedes/ink) (TS)

## 🛠️ Local Setup

#### 1. Clone the repository

```bash
git clone https://github.com/wu-wilson/unravel.git
cd unravel
```

#### 2. Build & link the CLI

```bash
npm install
npm run build
chmod +x dist/cli.js
npm link
```

#### 3. Analyze a project

This tool expects your project to have the following structure:

```
your-project/
├── package.json
└── src/
    └── ...
```

To analyze a project, run the following commands:

```bash
cd example-repo
unravel
```

## ⚡ Overview

**Unravel** is an interactive CLI tool that untangles your project's dependencies, showing gzipped npm package sizes and tracking imports.

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

Run the `unravel` command in your project root:

```bash
cd example-repo
unravel
```

## 🚧 Limitations

- Sizes reflect gzipped npm tarballs, not the final bundle.
- Only includes published package contents.
- Doesn’t show transitive dependency impact or runtime performance.

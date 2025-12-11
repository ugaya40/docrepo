# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Instructions

The following items are the most important instructions that apply to all tasks.

- **Do not modify code without permission for bug fixes. Always explain the proposed fix and get approval before editing code.**
- **Ad-hoc fixes are not allowed.**
- **Follow the rules in state-guideline.md**

## Project Overview

docRepo is a web application for viewing GitHub repositories (including private repositories) as a Markdown viewer. It supports formulas (KaTeX), GFM, and Mermaid.

## Development Commands

```bash
# Start development server
npm run dev

# TypeScript compile + production build
npm run build

# Code linting with ESLint
npm run lint

# Preview build artifacts
npm run preview
```

## Tech Stack

- **Framework**: React 19 + TypeScript 5.9
- **Build Tool**: Vite (rolldown-vite)
- **Styling**: Tailwind CSS 4 (via Vite plugin) + @tailwindcss/typography
- **State Management**: Zustand (persist middleware)
- **Authentication**: Supabase Auth (GitHub OAuth)
- **GitHub API**: Octokit
- **Markdown**: react-markdown + remark-gfm + remark-math + remark-github-blockquote-alert + remark-emoji
- **Diagram**: mermaid
- **Rehype**: rehype-raw + rehype-katex + rehype-highlight
- **Icons**: lucide-react + @icons-pack/react-simple-icons
- **Device Detection**: react-device-detect
- **Storage**: idb-keyval
- **Toast**: sonner
- **PWA**: vite-plugin-pwa
- **Linter**: ESLint 9 + typescript-eslint

## Code Conventions

- Error messages in code: English
- Code comments: Not required

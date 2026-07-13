# 🧲 Language Magnet Poetry App (Full-Stack Monorepo)

An interactive, selection-based language learning application designed to help novices and intermediate learners build, categorize, and save sentences without manual typing. 

## 🏗️ Architecture Overview

The project is structured as a scaffolded monorepo split into two distinct, decoupled layers communicating via a REST API. This setup allows for rapid feature iteration while keeping deployment overhead minimal.

```text
language-sentence-builder/
├── backend/                  # Django (REST API & Database Management)
│   ├── core/                 # Project configuration root (settings, urls, asgi/wsgi)
│   ├── accounts/              # User accounts app (auth, working sets)
│   └── words/                 # Word bank app (models, serializers, views for /api/words/)
└── frontend/                  # React + Vite (Interactive UI Single Page App)
    └── src/
        ├── components/        # UI components (word badges, panels, drop zones, etc.)
        ├── context/            # React context providers (auth, etc.)
        ├── lib/                # API clients and utilities
        ├── pages/              # Route-level pages (login, register, about, sandbox)
        └── types/              # Shared TypeScript types
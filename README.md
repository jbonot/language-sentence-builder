# 🧲 Language Magnet Poetry App (Full-Stack Monorepo)

An interactive, selection-based language learning application designed to help novices and intermediate learners build, categorize, and save sentences without manual typing. 

## 🏗️ Architecture Overview

The project is structured as a scaffolded monorepo split into two distinct, decoupled layers communicating via a REST API. This setup allows for rapid feature iteration while keeping deployment overhead minimal.

```text
my-language-app/
├── backend/                  # Django (REST API & Database Management)
│   ├── api/                  # Core logic (Models, Views, Serializers)
│   └── my_project/           # Project configuration root
└── frontend/                 # React + Vite (Interactive UI Single Page App)
    └── src/                  # Components, Hooks, State, and Routing
# NestJS + Prisma Starter

This is a ready-to-run NestJS 10 + Prisma 5 project with:
- JWT authentication (login/register)
- Users CRUD
- News CRUD
- Mailer (SMTP)
- Prisma (PostgreSQL)

## Quick Start
docker compose up -d
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

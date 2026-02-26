# procesamiento-pagos
Proyecto backend para el procesamiento de pagos mediante QR para Pymes

## 🚀 Start the Project (Development)
# install dependencies
npm install

# start in watch mode
npm run start:dev

## ▶️ Start the Project (Production mode)
# build the project
npm run build

# start compiled app
npm run start:prod

## 🧪 Run Tests

# Unit test
npm test

# Unit test - whatch mode
npm run test:watch

# End-to-End test
npm run test:e2e

# Coverage report
npm run test:cov

## 🗄️ Prisma – Database & Client
# Generate Prisma client (required after schema changes)
npx prisma generate

## Create a new migration (development)
npx prisma migrate dev --name <migration_name>

# Example
npx prisma migrate dev --name add_payment_intent


## Apply migrations (production / CI / tests)
npx prisma migrate deploy

## Reset database (development only ⚠️)
npx prisma migrate reset

This will:

drop the database

reapply migrations

re-generate Prisma client

## Open Prisma Studio (DB GUI)
npx prisma studio


## 🔁 Typical Development Workflow
# 1. Update schema
vim prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name update_schema

# 3. Generate client
npx prisma generate

# 4. Run tests
npm test

# 5. Start app
npm run start:dev
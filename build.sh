#!/bin/bash
set -e

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Preparing backend..."
cd backend
npm install
npx prisma generate
cd ..

echo "Build complete!"

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();

  const todo = await prisma.column.create({
    data: { title: 'To Do', position: 0, color: '#6366f1' },
  });
  const inProgress = await prisma.column.create({
    data: { title: 'In Progress', position: 1, color: '#f59e0b' },
  });
  const done = await prisma.column.create({
    data: { title: 'Done', position: 2, color: '#10b981' },
  });

  await prisma.task.createMany({
    data: [
      { title: 'Set up project repository', description: 'Initialize Git, configure CI/CD pipeline', priority: 'high', position: 0, columnId: todo.id },
      { title: 'Design database schema', description: 'Define tables, relations, and indexes for the application', priority: 'medium', position: 1, columnId: todo.id },
      { title: 'Write API documentation', priority: 'low', position: 2, columnId: todo.id },
      { title: 'Build authentication system', description: 'JWT-based login and registration flow', priority: 'high', position: 0, columnId: inProgress.id },
      { title: 'Create dashboard UI', description: 'Responsive layout with sidebar navigation', priority: 'medium', position: 1, columnId: inProgress.id },
      { title: 'Initial project setup', description: 'Vite + React + TypeScript scaffolding done', priority: 'low', position: 0, columnId: done.id },
    ],
  });

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

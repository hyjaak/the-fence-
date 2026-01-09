import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  await prisma.session.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.event.deleteMany();
  await prisma.guardrail.deleteMany();
  await prisma.config.deleteMany();
  await prisma.systemState.deleteMany();

  const adminHash = await bcrypt.hash('admin123', 10);
  const operatorHash = await bcrypt.hash('operator123', 10);
  const viewerHash = await bcrypt.hash('viewer', 10);

  await prisma.user.createMany({
    data: [
      { username: 'admin', passwordHash: adminHash, role: 'ADMIN' },
      { username: 'operator', passwordHash: operatorHash, role: 'OPERATOR' },
      { username: 'viewer', passwordHash: viewerHash, role: 'VIEWER' },
    ],
  });

  await prisma.event.createMany({
    data: [
      {
        type: 'METRIC_INGESTED',
        message: 'Performance metric captured',
      },
      {
        type: 'GUARDRAIL_CHECK',
        message: 'Safety envelope validated',
      },
      {
        type: 'AUDIT_LOG',
        message: 'Operator action recorded',
      },
      {
        type: 'SYSTEM_INIT',
        message: 'System initialized successfully',
      },
      {
        type: 'METRIC_INGESTED',
        message: 'Network latency recorded',
      },
      {
        type: 'GUARDRAIL_CHECK',
        message: 'Resource limits verified',
      },
      {
        type: 'CONFIG_UPDATE',
        message: 'Configuration reloaded',
      },
      {
        type: 'AUDIT_LOG',
        message: 'Admin action recorded',
      },
      {
        type: 'METRIC_INGESTED',
        message: 'CPU utilization sampled',
      },
      {
        type: 'GUARDRAIL_CHECK',
        message: 'Decision latency within bounds',
      },
    ],
  });

  await prisma.guardrail.createMany({
    data: [
      {
        name: 'Resource Utilization',
        status: 'PASSING',
        threshold: '< 80%',
        current: '45%',
      },
      {
        name: 'Decision Latency',
        status: 'PASSING',
        threshold: '< 500ms',
        current: '120ms',
      },
      {
        name: 'Audit Trail Continuity',
        status: 'PASSING',
        threshold: '100%',
        current: '100%',
      },
    ],
  });

  await prisma.config.createMany({
    data: [
      { key: 'DEMO_MODE', value: 'true' },
      { key: 'FENCE_MODE', value: 'demo' },
    ],
  });

  await prisma.systemState.create({
    data: {
      id: 1,
      state: 'GREEN',
      message: 'All systems nominal. MVP mode active.',
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

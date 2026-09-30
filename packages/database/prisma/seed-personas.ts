import { prisma } from '../src';

import { seedPersonaFixtures } from './personas/seed-persona-fixtures';

seedPersonaFixtures(prisma)
  .then(() =>
    console.info(
      'Persona seed complete: 7 profiles and their financial records.'
    )
  )
  .finally(async () => prisma.$disconnect())
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });

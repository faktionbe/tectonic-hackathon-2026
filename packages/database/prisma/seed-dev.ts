import { prisma } from '../src';

import { dump } from './utils/dump';
import { hash } from './utils/hash';

async function main() {
  await dump(prisma);
  await prisma.user.createMany({
    data: [
      {
        email: 'sw@faktion.com',
        password: await hash('password123'),
        first_name: 'SW',
        last_name: 'Faktion',
      },
      {
        email: 'ml@faktion.com',
        password: await hash('password123'),
        first_name: 'ML',
        last_name: 'Faktion',
      },
    ],
  });
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});

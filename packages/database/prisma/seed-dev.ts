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

  const account_id = 'acc_demo_001';

  const netflix = await prisma.party.create({
    data: {
      kind: 'MERCHANT',
      name: 'Netflix',
      category: 'ENTERTAINMENT',
      website: 'https://www.netflix.com',
      external_id: 'mrc_netflix',
      country_code: 'NL',
    },
  });

  const jane = await prisma.party.create({
    data: {
      kind: 'PERSON',
      name: 'Jane Doe',
      iban: 'BE68539007547034',
      country_code: 'BE',
    },
  });

  const netflixSubscription = await prisma.subscription.create({
    data: {
      account_id,
      counterparty_id: netflix.id,
      kind: 'DIRECT_DEBIT',
      mandate_id: 'NFLX-MND-55',
      creditor_id: 'NL91NETFLIX',
      status: 'ACTIVE',
      category: 'ENTERTAINMENT',
      cadence: 'MONTHLY',
      amount: 13.99,
      currency: 'EUR',
      next_payment_date: new Date('2026-10-28'),
      first_charged_at: new Date('2025-08-28'),
      last_charged_at: new Date('2026-09-28'),
      occurrence_count: 14,
      cancellable: true,
    },
  });

  await prisma.expense.createMany({
    data: [
      {
        account_id,
        amount: 13.99,
        currency: 'EUR',
        direction: 'DEBIT',
        booking_date: new Date('2026-09-28'),
        transaction_timestamp: new Date('2026-09-28T04:12:00Z'),
        type: 'SEPA_DIRECT_DEBIT',
        status: 'BOOKED',
        description: 'NETFLIX.COM AMSTERDAM',
        category: 'ENTERTAINMENT',
        sub_category: 'STREAMING',
        essentiality: 'DISCRETIONARY',
        channel: 'RECURRING',
        counterparty_id: netflix.id,
        subscription_id: netflixSubscription.id,
      },
      {
        account_id,
        amount: 42.5,
        currency: 'EUR',
        direction: 'DEBIT',
        booking_date: new Date('2026-09-27'),
        transaction_timestamp: new Date('2026-09-27T17:03:00Z'),
        type: 'CARD_PAYMENT',
        status: 'BOOKED',
        description: 'P2P transfer to Jane Doe',
        category: 'OTHER',
        essentiality: 'DISCRETIONARY',
        channel: 'MOBILE',
        counterparty_id: jane.id,
      },
    ],
  });
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});

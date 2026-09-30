# Financial contracts

This package defines Zod schemas and inferred TypeScript types for studied customer
profiles, financial holders, accounts, loans, credit cards, investments, insurance,
counterparties, transactions, and recurring payments. Profiles are independent of
authentication users. Financial holders can link to a profile or retain a supplied
name or label without one.

New financial records use explicit `null` for unknown scalar values and empty
participant arrays when ownership is unknown. Shared records hold one balance and
multiple participant references. Insurance coverage percentages describe insured
people, not ownership shares. Profile financial summaries remain declared snapshots
and must not be added to detailed account or product balances.

`expenseSchema` remains an unrefined object so existing DTOs can use `.omit()` and
`.partial()`. Use `validatedExpenseSchema` for full records: booked and reversed
transactions require a booking date; pending, attempted, blocked, and rejected
transactions require a transaction date or timestamp. A calendar date does not
imply a precise timestamp. Transaction amounts are positive magnitudes with a
separate debit/credit direction; account balances may be negative.

Unknown subscription amounts and cadences are omitted. New financial-record
fields, including the three Profile additions, require explicit `null` when
unknown. They have no defaults, so schemas derived with `.partial()` keep omitted
PATCH fields absent. Explicit `false`, `0`, and `null` retain their meanings.

## Verification

Run `nvm use` from the repository root, then:

```sh
pnpm --filter @repo/contracts typecheck
pnpm --filter @repo/contracts test
pnpm --filter @repo/contracts lint
pnpm --filter @repo/database exec prisma validate
```

The test command bundles TypeScript tests into the ignored `dist/test` directory
with the existing build tool and runs Node's built-in test runner.
Test typechecking reuses the Node types installed by the server workspace, so
verification expects the usual full-workspace dependency installation.

## Integration follow-up

CRUD mappings and generated clients still need adaptations for the added fields,
optional booking dates, and optional subscription amounts/cadences. Migrations,
Prisma generation, and seeding are separate from this schema change. Existing
account identifiers such as `acc_demo_001` need Account rows before applying the
new foreign keys; backfill must preserve identifiers and leave unknown owners and
metadata unset. No database changes are applied by the verification commands above.

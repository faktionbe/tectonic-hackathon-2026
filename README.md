# KBC Moments by team Faktion

KBC Moments is a proof of concept built for the KBC challenge: "How can KBC understand what each customer needs and respond at exactly the right moment?"

Imagine a bank that keeps pace with your life, sensing the changes where it can offer a helping hand.

When Lotte moves in with her partner, her app welcomes her home and reminds her she still needs the required fire insurance. When Eva starts freelancing, her app shows her how much of her balance is really hers, after VAT and social contributions. And when Dries falls behind on rent due to a bad gambling habit, his bank doesn't offer him a loan. It suggests a payment plan and a way to block payments for gambling himself.

That's KBC Moments. It understands the signals already in a customer's transactions and app activity, interprets the life moment behind them, and chooses the right response. Sometimes that means direct action. Sometimes it means asking first, protecting the customer from fraud. Sometimes it is simply an offer to help. Every suggestion comes with a clear context: "Why am I seeing this?", and the same information reaches the advisor, so no customer has to explain their story twice.

But understanding a moment is only half the story. KBC Moments also looks at how confident each customer is with money. Someone who never opens the budget screen, misses recurring bills or has never managed their own finances needs a different kind of help than a seasoned investor. When Kelly loses her husband, who always handled their money, she doesn't get product offers or financial jargon. She gets plain-language explanations, a simple weekly budget, and short lessons on what an inheritance is and what she needs to arrange. As her confidence grows, the app grows with her. We don't just tell customers what to do. We help them understand why.

KBC already offers everything people need at these crucial instants in life. KBC Moments makes sure they get it at the right time, the right moment.

## Table of contents

1. [The problem](#the-problem)
2. [How it works](#how-it-works)
3. [The personas](#the-personas)
4. [Design principles](#design-principles)
5. [Project structure](#project-structure)
6. [How to run it](#how-to-run-it)
7. [Limitations](#limitations)
8. [Next steps](#next-steps)

## The problem

Banks mostly react to what customers ask for, not to what is happening in their lives. KBC already offers almost every product people need at key moments: a rental guarantee account when you move, a child savings account when a baby arrives, a business account when you start freelancing. But customers often don't get these at the right time, and sometimes they get the wrong offer at the worst time, such as a loan offer to someone in financial distress.

## How it works

KBC Moments follows the three pillars of the challenge.

| Pillar | What KBC Moments does |
| --- | --- |
| Understand | An LLM analyses transactions and app activity, detects the life moment, explains the evidence, and assesses whether the customer is vulnerable. |
| Adapt | The KBC Mobile home screen reorganises itself: a tailored hero card, one-tap actions, and a "Why am I seeing this?" explanation. |
| Scale | The same signal feeds the advisor dashboard, so an advisor at KBC Live or in a branch sees a ready-made brief. |

```text
synthetic transactions ──► Understand engine (LLM) ──► moment.json
                                                     ├──► Customer app (Adapt)
                                                     └──► Advisor dashboard (Scale)
```

The engine chooses one of four stances for every customer:

| Stance | When | Behaviour |
| --- | --- | --- |
| Act | Clear, positive life moment | Show relevant products and actions directly |
| Ask first | Sensitive moment inferred from data | Stay neutral until the customer confirms |
| Protect | Fraud or confusion risk | Add friction, alert, offer a trusted-person option |
| Pause and support | Financial distress or grief | Suppress all sales and credit, offer help |

## The personas

The demo uses six synthetic customers. All data is fictional.

| Persona | Life moment | Key signals | Stance | What the app does |
| --- | --- | --- | --- | --- |
| Lotte, 29 – UX designer, Ghent | Moving in with her partner | Rental deposit, moving company, IKEA, new Engie contract, address change fee, shared-costs transfers | Act | Address update, tenant fire insurance, shared budget, savings rebuild |
| Jonas & Sarah, 33 – engineer and teacher, Mechelen | Expecting their first child | Recurring gynaecologist payments, Dreambaby, car seat, childcare registration | Ask first | Neutral "family finances check-up" until they confirm, then leave budget, hospitalization cover, child savings |
| Eva, 36 – freelance brand strategist, Antwerp | Started as self-employed | Last salary, KBO registration, social contributions, irregular client payments | Act | "Truly available" balance, VAT pot, Business Pro account, POZ pension |
| Dries, 34 – logistics worker, Genk | Financial distress with a gambling pattern | Night-time gambling deposits, payday spikes, overdraft at limit, failed rent payment | Pause and support | No credit offers, payment plan, self-set gambling block, anonymous help |
| Marc, 78 – retired widower, Bruges | Increasing vulnerability | "Hi grandpa" fraud attempt, rising cash withdrawals, double payments, login failures | Protect | Transfer held, fraud warning, simple app mode, trusted-person alert |
| Kelly, 39 – recent widow, Knokke | Loss of partner, no own income | Death notification, funeral payment, blocked accounts, spending at the old level, negative balance | Pause and support | Advisor, bereavement checklist, weekly budget, plain-language explanations |

### Products per persona

The engine maps each moment to existing KBC products and explicitly blocks unsuitable ones.

| Persona | Offer | Never offer |
| --- | --- | --- |
| Lotte | Fire insurance, family liability, group expenses tool, Goal Alert | Car loan |
| Jonas & Sarah | Hospitalization, family liability, growth savings account, advisor meeting | Pregnancy-specific offers before confirmation |
| Eva | Business Pro, Billit, POZ, business income protection | Mortgage or car loan while income is unstable |
| Dries | Payment plan, budget insights, Kate | Personal loan, Flex Budget, overdraft increase, investing |
| Marc | Internet fraud insurance, home assistance, Digital Vault, advisor call | Investment upsell |
| Kelly | Advisor, eBox, Digital Vault, savings with Goal Alert | Credit, funeral insurance, investing |

## Design principles

1. **Explainable.** Every recommendation has a "Why am I seeing this?" with plain-language evidence and a "Not relevant" button.
2. **Consent first.** Personalisation only runs for customers who opted in.
3. **Never sell at vulnerable moments.** Distress, grief and fraud risk switch off all commercial offers.
4. **Sensitive data stays hidden.** Medical transactions and adult-content spending are never shown to the customer or advisor. They only count as anonymous categories.
5. **Ask before assuming.** Inferred pregnancy or health-related moments require confirmation from the customer.
6. **Respect autonomy.** For older customers, the bank protects without taking over.
7. **No diagnoses.** The engine flags financial risk, not addiction or cognitive decline.

## Project structure

KBC Moments is a pnpm/Turborepo monorepo. Its active demo stack combines a React experience, a NestJS API, Mastra agents, and seeded synthetic banking data.

```text
tectonic-hackathon-2026/
├── apps/
│   ├── client/        # React/Vite customer experience: login and Kate chat
│   ├── server/        # NestJS REST/GraphQL API for profiles and financial data
│   ├── agents/        # Mastra "Understand" engine: expense insights and savings advice
│   └── py-api/        # FastAPI companion service
├── packages/
│   ├── database/      # Prisma schema, migrations and persona seeders
│   ├── contracts/     # Shared Zod schemas and TypeScript financial contracts
│   ├── kbc-products/  # KBC product catalogue used in recommendations
│   ├── openapi/       # Zod-to-OpenAPI utilities
│   ├── shared/        # Shared TypeScript utilities
│   └── py-contracts/  # Shared Pydantic contracts
├── infrastructure/    # Docker Compose for PostgreSQL and Redis
├── scripts/           # Bootstrap and developer scripts
└── docs/              # Domain and project documentation
```

```text
React client ──REST/GraphQL──► Nest API ──► PostgreSQL
     └────────chat/SSE──────► Mastra agents ──M2M──► Nest API
                                           └────────► KBC product catalogue
```

The database contains six synthetic customer scenarios, represented by seven seeded demo login profiles.

## How to run it

### Requirements

- Docker Desktop
- Node.js 26.9 and pnpm 12.5.1
- A valid `OPENROUTER_API_KEY` for the AI service

### Setup

From the repository root, run:

```bash
bash ./scripts/kickstart.sh
```

The bootstrap script installs the required tooling, dependencies and local `.env` files. Then configure:

- `apps/server/.env`: replace `JWT_SECRET`, `M2M_JWT` and `ENCRYPTION_KEY`
- `apps/agents/.env`: add `OPENROUTER_API_KEY` and use the exact same `M2M_JWT` as the server
- Keep `SERVER_API_URL=http://localhost:4000/api`

Start the database, apply migrations, seed the synthetic personas, and launch the demo:

```bash
nvm use
pnpm docker:up
pnpm --filter @repo/database db:deploy
pnpm --filter @repo/database seed:personas
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with a seeded demo account, for example:

```text
lotte.vermeulen@kbc.be
password123
```

The API is available at [http://localhost:4000](http://localhost:4000), Swagger at [http://localhost:4000/docs](http://localhost:4000/docs), and Mastra Studio at [http://localhost:4111](http://localhost:4111).

## Limitations

- All customer data is synthetic. Real transaction data would need proper governance, GDPR review and model validation.
- Detection relies on an LLM and can be wrong. In production, confidence thresholds, human review for sensitive cases and bias testing would be needed.
- Product names come from the public [kbc.be](https://www.kbc.be) catalogue. Conditions and eligibility were not verified.
- Features such as the gambling block, trusted-person alert and "truly available" balance are concepts, not existing KBC products.

## Next steps

- Connect detection to Kate so nudges can be delivered conversationally.
- Add a "best moment" model that learns when customers respond well.
- Extend the life-moment library: job loss, divorce, retirement, studying abroad.
- Measure impact: offer relevance, conversion, fewer repeated explanations in calls, and reduced harm for vulnerable customers.

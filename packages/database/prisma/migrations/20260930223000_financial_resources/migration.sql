BEGIN;

-- AlterTable
ALTER TABLE "expense" ADD COLUMN     "counterparty_account_id" TEXT,
ADD COLUMN     "failure_reason" TEXT,
ADD COLUMN     "original_expense_id" TEXT,
ADD COLUMN     "purpose" TEXT,
ADD COLUMN     "transaction_date" DATE,
ALTER COLUMN "booking_date" DROP NOT NULL;

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "investment_horizon_months" INTEGER,
ADD COLUMN     "liquidity_reserve_target" DECIMAL(14,2),
ADD COLUMN     "personalization_consent" BOOLEAN;

-- AlterTable
ALTER TABLE "subscription" ALTER COLUMN "cadence" DROP NOT NULL,
ALTER COLUMN "amount" DROP NOT NULL;

-- CreateTable
CREATE TABLE "financial_holder" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT,
    "display_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_holder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "provider_name" TEXT,
    "iban" TEXT,
    "kind" TEXT,
    "purpose" TEXT,
    "status" TEXT,
    "currency" CHAR(3),
    "balance" DECIMAL(14,2),
    "balance_as_of" TIMESTAMP(3),
    "overdraft_limit" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_holder" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "holder_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_holder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan" (
    "id" TEXT NOT NULL,
    "provider_name" TEXT,
    "product_name" TEXT,
    "kind" TEXT,
    "currency" CHAR(3),
    "outstanding_balance" DECIMAL(14,2),
    "repayment_amount" DECIMAL(14,2),
    "repayment_cadence" TEXT,
    "remaining_term_months" INTEGER,
    "repayment_account_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_borrower" (
    "id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "holder_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_borrower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_card" (
    "id" TEXT NOT NULL,
    "provider_name" TEXT,
    "product_name" TEXT,
    "currency" CHAR(3),
    "credit_limit" DECIMAL(14,2),
    "used_credit" DECIMAL(14,2),
    "billing_account_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_card_holder" (
    "id" TEXT NOT NULL,
    "credit_card_id" TEXT NOT NULL,
    "holder_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_card_holder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment" (
    "id" TEXT NOT NULL,
    "provider_name" TEXT,
    "product_name" TEXT,
    "kind" TEXT,
    "currency" CHAR(3),
    "current_value" DECIMAL(14,2),
    "valuation_date" DATE,
    "contribution_amount" DECIMAL(14,2),
    "contribution_cadence" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_holder" (
    "id" TEXT NOT NULL,
    "investment_id" TEXT NOT NULL,
    "holder_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_holder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance" (
    "id" TEXT NOT NULL,
    "provider_name" TEXT,
    "product_name" TEXT,
    "kind" TEXT,
    "is_employer_provided" BOOLEAN,
    "loan_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_policyholder" (
    "id" TEXT NOT NULL,
    "insurance_id" TEXT NOT NULL,
    "holder_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_policyholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_insured_person" (
    "id" TEXT NOT NULL,
    "insurance_id" TEXT NOT NULL,
    "holder_id" TEXT NOT NULL,
    "coverage_percentage" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_insured_person_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financial_holder_profile_id_key" ON "financial_holder"("profile_id");

-- CreateIndex
CREATE INDEX "account_holder_holder_id_idx" ON "account_holder"("holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_holder_account_id_holder_id_key" ON "account_holder"("account_id", "holder_id");

-- CreateIndex
CREATE INDEX "loan_repayment_account_id_idx" ON "loan"("repayment_account_id");

-- CreateIndex
CREATE INDEX "loan_borrower_holder_id_idx" ON "loan_borrower"("holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "loan_borrower_loan_id_holder_id_key" ON "loan_borrower"("loan_id", "holder_id");

-- CreateIndex
CREATE INDEX "credit_card_billing_account_id_idx" ON "credit_card"("billing_account_id");

-- CreateIndex
CREATE INDEX "credit_card_holder_holder_id_idx" ON "credit_card_holder"("holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "credit_card_holder_credit_card_id_holder_id_key" ON "credit_card_holder"("credit_card_id", "holder_id");

-- CreateIndex
CREATE INDEX "investment_holder_holder_id_idx" ON "investment_holder"("holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "investment_holder_investment_id_holder_id_key" ON "investment_holder"("investment_id", "holder_id");

-- CreateIndex
CREATE INDEX "insurance_loan_id_idx" ON "insurance"("loan_id");

-- CreateIndex
CREATE INDEX "insurance_policyholder_holder_id_idx" ON "insurance_policyholder"("holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_policyholder_insurance_id_holder_id_key" ON "insurance_policyholder"("insurance_id", "holder_id");

-- CreateIndex
CREATE INDEX "insurance_insured_person_holder_id_idx" ON "insurance_insured_person"("holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_insured_person_insurance_id_holder_id_key" ON "insurance_insured_person"("insurance_id", "holder_id");

-- CreateIndex
CREATE INDEX "expense_counterparty_account_id_idx" ON "expense"("counterparty_account_id");

-- CreateIndex
CREATE INDEX "expense_original_expense_id_idx" ON "expense"("original_expense_id");

-- CreateIndex
CREATE INDEX "subscription_account_id_idx" ON "subscription"("account_id");

-- Preserve legacy account identifiers before enforcing account references.
INSERT INTO "account" ("id", "updatedAt")
SELECT "account_id", CURRENT_TIMESTAMP FROM "expense"
UNION
SELECT "account_id", CURRENT_TIMESTAMP FROM "subscription"
ON CONFLICT ("id") DO NOTHING;

-- AddForeignKey
ALTER TABLE "financial_holder" ADD CONSTRAINT "financial_holder_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_holder" ADD CONSTRAINT "account_holder_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_holder" ADD CONSTRAINT "account_holder_holder_id_fkey" FOREIGN KEY ("holder_id") REFERENCES "financial_holder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan" ADD CONSTRAINT "loan_repayment_account_id_fkey" FOREIGN KEY ("repayment_account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_borrower" ADD CONSTRAINT "loan_borrower_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_borrower" ADD CONSTRAINT "loan_borrower_holder_id_fkey" FOREIGN KEY ("holder_id") REFERENCES "financial_holder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card" ADD CONSTRAINT "credit_card_billing_account_id_fkey" FOREIGN KEY ("billing_account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_holder" ADD CONSTRAINT "credit_card_holder_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_holder" ADD CONSTRAINT "credit_card_holder_holder_id_fkey" FOREIGN KEY ("holder_id") REFERENCES "financial_holder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_holder" ADD CONSTRAINT "investment_holder_investment_id_fkey" FOREIGN KEY ("investment_id") REFERENCES "investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_holder" ADD CONSTRAINT "investment_holder_holder_id_fkey" FOREIGN KEY ("holder_id") REFERENCES "financial_holder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance" ADD CONSTRAINT "insurance_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policyholder" ADD CONSTRAINT "insurance_policyholder_insurance_id_fkey" FOREIGN KEY ("insurance_id") REFERENCES "insurance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policyholder" ADD CONSTRAINT "insurance_policyholder_holder_id_fkey" FOREIGN KEY ("holder_id") REFERENCES "financial_holder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_insured_person" ADD CONSTRAINT "insurance_insured_person_insurance_id_fkey" FOREIGN KEY ("insurance_id") REFERENCES "insurance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_insured_person" ADD CONSTRAINT "insurance_insured_person_holder_id_fkey" FOREIGN KEY ("holder_id") REFERENCES "financial_holder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_counterparty_account_id_fkey" FOREIGN KEY ("counterparty_account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_original_expense_id_fkey" FOREIGN KEY ("original_expense_id") REFERENCES "expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;

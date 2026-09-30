-- CreateTable
CREATE TABLE "party" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iban" TEXT,
    "country_code" TEXT,
    "category" TEXT,
    "logo_url" TEXT,
    "website" TEXT,
    "external_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "counterparty_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "mandate_id" TEXT,
    "creditor_id" TEXT,
    "status" TEXT NOT NULL,
    "category" TEXT,
    "cadence" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "next_payment_date" DATE,
    "first_charged_at" DATE,
    "last_charged_at" DATE,
    "occurrence_count" INTEGER,
    "cancellable" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "iban" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "direction" TEXT NOT NULL,
    "booking_date" DATE NOT NULL,
    "value_date" DATE,
    "transaction_timestamp" TIMESTAMP(3),
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "structured_reference" TEXT,
    "mcc" TEXT,
    "channel" TEXT,
    "balance_after" DECIMAL(14,2),
    "city" TEXT,
    "country_code" TEXT,
    "category" TEXT,
    "sub_category" TEXT,
    "essentiality" TEXT,
    "counterparty_id" TEXT,
    "subscription_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_account_id_idx" ON "expense"("account_id");

-- CreateIndex
CREATE INDEX "expense_counterparty_id_idx" ON "expense"("counterparty_id");

-- CreateIndex
CREATE INDEX "expense_subscription_id_idx" ON "expense"("subscription_id");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_counterparty_id_fkey" FOREIGN KEY ("counterparty_id") REFERENCES "party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_counterparty_id_fkey" FOREIGN KEY ("counterparty_id") REFERENCES "party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

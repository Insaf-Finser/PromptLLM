-- CreateEnum
CREATE TYPE "EvalRunStatus" AS ENUM ('pending', 'running', 'completed', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_versions" (
    "id" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "template_text" TEXT NOT NULL,
    "variable_names" TEXT[],
    "model" TEXT NOT NULL,
    "system_prompt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_cases" (
    "id" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variable_values" JSONB NOT NULL,
    "expected_criteria" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eval_runs" (
    "id" TEXT NOT NULL,
    "prompt_version_id" TEXT NOT NULL,
    "status" "EvalRunStatus" NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eval_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eval_results" (
    "id" TEXT NOT NULL,
    "eval_run_id" TEXT NOT NULL,
    "test_case_id" TEXT NOT NULL,
    "output_text" TEXT,
    "latency_ms" INTEGER,
    "pass" BOOLEAN,
    "grader_notes" TEXT,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eval_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "prompts_user_id_idx" ON "prompts"("user_id");

-- CreateIndex
CREATE INDEX "prompt_versions_prompt_id_idx" ON "prompt_versions"("prompt_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_versions_prompt_id_version_number_key" ON "prompt_versions"("prompt_id", "version_number");

-- CreateIndex
CREATE INDEX "test_cases_prompt_id_idx" ON "test_cases"("prompt_id");

-- CreateIndex
CREATE INDEX "eval_runs_prompt_version_id_idx" ON "eval_runs"("prompt_version_id");

-- CreateIndex
CREATE INDEX "eval_results_eval_run_id_idx" ON "eval_results"("eval_run_id");

-- CreateIndex
CREATE INDEX "eval_results_test_case_id_idx" ON "eval_results"("test_case_id");

-- CreateIndex
CREATE UNIQUE INDEX "eval_results_eval_run_id_test_case_id_key" ON "eval_results"("eval_run_id", "test_case_id");

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eval_runs" ADD CONSTRAINT "eval_runs_prompt_version_id_fkey" FOREIGN KEY ("prompt_version_id") REFERENCES "prompt_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eval_results" ADD CONSTRAINT "eval_results_eval_run_id_fkey" FOREIGN KEY ("eval_run_id") REFERENCES "eval_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eval_results" ADD CONSTRAINT "eval_results_test_case_id_fkey" FOREIGN KEY ("test_case_id") REFERENCES "test_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

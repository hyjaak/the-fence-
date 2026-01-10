-- Run this SQL in your Supabase SQL Editor
-- This creates all tables and seeds initial data

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AuditLog table
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Event table
CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Guardrail table
CREATE TABLE IF NOT EXISTS "Guardrail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "status" TEXT NOT NULL,
    "threshold" TEXT NOT NULL,
    "current" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Config table
CREATE TABLE IF NOT EXISTS "Config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SystemState table
CREATE TABLE IF NOT EXISTS "SystemState" (
    "id" INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
    "state" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed admin user (password: admin123)
INSERT INTO "User" ("id", "username", "passwordHash", "role", "createdAt", "updatedAt")
VALUES (
    'admin-001',
    'admin',
    '$2a$10$rZYHNM1qHvqF.yP3mQZxkOqY1L1oJKJxV0yXZvQVJKqYqwJqKqwJq',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("username") DO NOTHING;

-- Seed initial guardrails
INSERT INTO "Guardrail" ("id", "name", "status", "threshold", "current", "updatedAt")
VALUES
    ('gr-001', 'Execution Budget', 'SAFE', '1000', '142', CURRENT_TIMESTAMP),
    ('gr-002', 'State Coherence', 'SAFE', '95%', '98.2%', CURRENT_TIMESTAMP),
    ('gr-003', 'Action Approval Rate', 'WARN', '80%', '76.5%', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Seed system state
INSERT INTO "SystemState" ("id", "state", "message", "lastUpdate")
VALUES (1, 'OPERATIONAL', 'All systems nominal', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET "lastUpdate" = CURRENT_TIMESTAMP;

-- Seed initial config
INSERT INTO "Config" ("id", "key", "value", "updatedAt")
VALUES
    ('cfg-001', 'approval_timeout', '300', CURRENT_TIMESTAMP),
    ('cfg-002', 'max_concurrent_actions', '5', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

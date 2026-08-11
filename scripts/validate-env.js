#!/usr/bin/env node
/**
 * Simple validation script for .env files.
 *
 * It checks that all variables prefixed with NEXT_PUBLIC_ or required
 * server‑only variables are present.  If any are missing, the script
 * exits with code 1 and prints a helpful message.
 *
 * Usage (automatically called by npm scripts):
 *   node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// Load .env file if it exists (optional, does not override process.env)
if (fs.existsSync('.env')) {
  require('dotenv').config({ path: '.env' });
}

// Helper to read .env files (dotenv does not load .env.example automatically)
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  content.split('\n').forEach((line) => {
    const lineStripped = line.trim();
    if (!lineStripped || lineStripped.startsWith('#')) return;
    const [key, ...valParts] = lineStripped.split('=');
    if (!key) return;
    const value = valParts.join('=');
    process.env[key] = value.replace(/^['"]+|['"]+$/g, '');
  });
}

// Load .env (local) and .env.example (template) if present
loadEnvFile('.env');
loadEnvFile('.env.example');

// List of required variables – split into public (exposed to client) and server‑only
const REQUIRED_PUBLIC = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const REQUIRED_PRIVATE = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  // Add any other secrets you need here
];

// Function to check presence
function assertDefined(varName, list) {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    console.error(`   Please add it to .env.local or .env.example`);
    process.exit(1);
  }
}

// Validate public vars
REQUIRED_PUBLIC.forEach((key) => assertDefined(key, REQUIRED_PUBLIC));

// Validate private vars
REQUIRED_PRIVATE.forEach((key) => assertDefined(key, REQUIRED_PRIVATE));

console.log('✅ All required environment variables are present.');
process.exit(0);
-- Migration: add verification_status to companies
-- Run this in: Supabase → SQL Editor → New Query → Run
-- Safe to re-run (IF NOT EXISTS / WHERE clause guards)

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';

-- Grandfather all existing claimed companies as verified so they aren't locked out
UPDATE companies
  SET verification_status = 'verified'
  WHERE claimed = true
    AND (verification_status IS NULL OR verification_status <> 'verified');

-- Ensure unclaimed companies are set to pending
UPDATE companies
  SET verification_status = 'pending'
  WHERE (claimed = false OR claimed IS NULL)
    AND verification_status IS NULL;

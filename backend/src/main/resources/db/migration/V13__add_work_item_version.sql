-- Add version column for optimistic locking on work_items
ALTER TABLE work_items ADD COLUMN version BIGINT DEFAULT 0;

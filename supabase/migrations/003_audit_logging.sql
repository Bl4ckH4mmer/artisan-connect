-- =====================================================
-- ADMIN AUDIT LOGGING
-- =====================================================
-- This migration creates a comprehensive audit logging system
-- to track all admin actions for accountability and debugging.

-- Create audit log table
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Action details
  action_type VARCHAR(50) NOT NULL, -- 'approve_artisan', 'reject_review', 'edit_artisan', etc.
  target_type VARCHAR(50), -- 'artisan', 'review', 'contact', etc.
  target_id UUID, -- ID of the affected entity
  
  -- Additional context
  details JSONB DEFAULT '{}', -- Flexible field for action-specific data
  ip_address INET, -- IP address of admin
  user_agent TEXT, -- Browser/device info
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_audit_admin ON admin_audit_logs(admin_user_id);
CREATE INDEX idx_audit_action ON admin_audit_logs(action_type);
CREATE INDEX idx_audit_target ON admin_audit_logs(target_type, target_id);
CREATE INDEX idx_audit_created ON admin_audit_logs(created_at DESC);

-- Create composite index for common queries
CREATE INDEX idx_audit_admin_action_date ON admin_audit_logs(admin_user_id, action_type, created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE admin_audit_logs IS 'Tracks all admin actions for accountability and audit purposes';
COMMENT ON COLUMN admin_audit_logs.action_type IS 'Type of action performed (e.g., approve_artisan, reject_review)';
COMMENT ON COLUMN admin_audit_logs.details IS 'JSONB field containing action-specific metadata';

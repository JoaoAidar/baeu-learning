-- Create audit logs table for comprehensive security logging
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    details JSONB,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    path VARCHAR(255),
    method VARCHAR(10),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_level ON audit_logs(level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Create RLS policies for audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only allow service role to insert audit logs
CREATE POLICY "Allow service role to insert audit logs" ON audit_logs
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Only allow admins to read audit logs
CREATE POLICY "Allow admins to read audit logs" ON audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Add cleanup function to remove old audit logs (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_audit_logs() 
RETURNS void AS $$
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT cleanup_audit_logs();');

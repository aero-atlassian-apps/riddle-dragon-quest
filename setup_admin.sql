-- =====================================================
-- TEMPORARY ADMIN SETUP SCRIPT
-- =====================================================
-- This script ensures the current authenticated user has admin privileges
-- Run this in your Supabase SQL editor to fix the 409 universe creation error
-- =====================================================

-- First, let's check if there are any existing admin users
SELECT 
    ur.user_id, 
    ur.role, 
    ur.created_at,
    au.email
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'admin';

-- If no admin users exist, we need to create one
-- Replace 'your-user-email@example.com' with the actual email you're using to log in

-- Method 1: If you know your user ID, insert directly
-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('your-user-id-here', 'admin');

-- Method 2: Insert admin role for a specific email (safer approach)
-- This will work if the user exists in auth.users
INSERT INTO user_roles (user_id, role)
SELECT au.id, 'admin'::app_role
FROM auth.users au
WHERE au.email = 'a.roucadi@attijariwafa.com'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = au.id AND ur.role = 'admin'
);

-- Verify the admin role was created
SELECT 
    ur.user_id, 
    ur.role, 
    ur.created_at,
    au.email
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'admin';

-- =====================================================
-- ALTERNATIVE: Temporarily disable RLS for testing
-- =====================================================
-- If you want to test without admin roles, you can temporarily disable RLS
-- WARNING: This removes security restrictions - only use for testing!

-- Uncomment the following lines to disable RLS temporarily:
-- ALTER TABLE universes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE universe_troupes DISABLE ROW LEVEL SECURITY;

-- Remember to re-enable RLS after testing:
-- ALTER TABLE universes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE universe_troupes ENABLE ROW LEVEL SECURITY;
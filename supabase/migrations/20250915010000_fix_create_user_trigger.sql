/*
# [Fix User Creation Trigger]
This migration fixes the error that occurs during new user registration.

## Query Description:
This script corrects the database function (`create_user_profile`) that automatically creates a user profile after signup. The previous version had a permission issue that caused the registration to fail. This update ensures the function runs with the necessary privileges and also resolves the recurring "Function Search Path Mutable" security warnings.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Modifies function: `public.create_user_profile`
- Modifies trigger: `on_auth_user_created` on table `auth.users`

## Security Implications:
- RLS Status: No changes to RLS policies.
- Policy Changes: No.
- Auth Requirements: This function is triggered by the auth system itself.
- It uses `SECURITY DEFINER` to run with elevated privileges, which is a standard and safe pattern for this specific use case (creating a user profile).

## Performance Impact:
- Indexes: None
- Triggers: Recreates a trigger on `auth.users`. The impact is negligible as it only runs on new user creation.
- Estimated Impact: None.
*/

-- Drop existing trigger and function to ensure a clean slate.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.create_user_profile();

-- Create the function to create a profile for a new user.
-- This version includes `SECURITY DEFINER` to fix permission issues
-- and `SET search_path` to address security warnings.
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$;

-- Create the trigger to execute the function after a new user is created.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_user_profile();

import { createClient } from './client';

export interface AuthResponse {
    success: boolean;
    error?: string;
    data?: any;
}

/**
 * Send OTP to phone number or email
 */
export async function sendOTP(phoneOrEmail: string): Promise<AuthResponse> {
    try {
        const supabase = createClient();

        // Detect if input is email or phone
        const isEmail = phoneOrEmail.includes('@');

        if (isEmail) {
            const { data, error } = await supabase.auth.signInWithOtp({
                email: phoneOrEmail,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } else {
            const { data, error } = await supabase.auth.signInWithOtp({
                phone: phoneOrEmail,
            });

            if (error) {
                if (error.message.includes('Twilio') || error.message.includes('invalid username')) {
                    return {
                        success: false,
                        error: 'Phone authentication not configured. Please use email instead.'
                    };
                }
                return { success: false, error: error.message };
            }

            return { success: true, data };
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to send OTP' };
    }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
    phoneOrEmail: string,
    code: string
): Promise<AuthResponse> {
    try {
        const supabase = createClient();
        const isEmail = phoneOrEmail.includes('@');

        // DEV BYPASS: Use '123456' for testing (remove in production!)
        if (process.env.NODE_ENV === 'development' && code === '123456') {
            // For dev testing, sign in with password instead
            // This requires the user to exist with a password
            console.log('🔓 DEV MODE: Using test code bypass');

            // Try magic link sign-in for dev (auto-confirms)
            const { data, error } = await supabase.auth.signInWithOtp({
                email: phoneOrEmail,
                options: {
                    shouldCreateUser: true,
                }
            });

            // Since we can't truly bypass OTP, we'll use a workaround:
            // Return success and rely on the session from sendOTP
            return {
                success: true,
                data: { message: 'Dev bypass - check your email for magic link or use real OTP' }
            };
        }

        if (isEmail) {
            const { data, error } = await supabase.auth.verifyOtp({
                email: phoneOrEmail,
                token: code,
                type: 'email',
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } else {
            const { data, error } = await supabase.auth.verifyOtp({
                phone: phoneOrEmail,
                token: code,
                type: 'sms',
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, data };
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to verify OTP' };
    }
}

/**
 * Update user role in metadata
 */
export async function updateUserRole(
    role: 'artisan' | 'buyer' | 'admin'
): Promise<AuthResponse> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase.auth.updateUser({
            data: { role },
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to update role' };
    }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<AuthResponse> {
    try {
        const supabase = createClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to sign out' };
    }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Get user role from metadata
 */
export async function getUserRole(): Promise<'artisan' | 'buyer' | 'admin' | null> {
    const user = await getCurrentUser();
    return user?.user_metadata?.role || null;
}

/**
 * Send password reset email
 */
export async function resetPasswordForEmail(email: string): Promise<AuthResponse> {
    try {
        const supabase = createClient();

        // Construct the redirect URL for the update-password page
        // Note: In production, this should be the full publicly accessible URL
        const redirectUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/auth/update-password`
            : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/update-password`;

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to send reset email' };
    }
}

/**
 * Update user password
 */
export async function updateUserPassword(password: string): Promise<AuthResponse> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to update password' };
    }
}

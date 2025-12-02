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

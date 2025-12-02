import { createClient } from '@/lib/supabase/client';

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
    file: File,
    bucket: 'profiles' | 'portfolios'
): Promise<{ url?: string; error?: string }> {
    try {
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${bucket}/${fileName}`;

        // Upload file
        const { error: uploadError } = await supabase.storage
            .from('artisan-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            return { error: uploadError.message };
        }

        // Get public URL
        const { data } = supabase.storage
            .from('artisan-images')
            .getPublicUrl(filePath);

        return { url: data.publicUrl };
    } catch (error: any) {
        return { error: error.message || 'Failed to upload image' };
    }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
    files: File[],
    bucket: 'profiles' | 'portfolios'
): Promise<{ urls: string[]; errors: string[] }> {
    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
        const result = await uploadImage(file, bucket);
        if (result.url) {
            urls.push(result.url);
        } else if (result.error) {
            errors.push(result.error);
        }
    }

    return { urls, errors };
}

/**
 * Delete image from storage
 */
export async function deleteImage(filePath: string): Promise<{ error?: string }> {
    try {
        const supabase = createClient();

        const { error } = await supabase.storage
            .from('artisan-images')
            .remove([filePath]);

        if (error) {
            return { error: error.message };
        }

        return {};
    } catch (error: any) {
        return { error: error.message || 'Failed to delete image' };
    }
}

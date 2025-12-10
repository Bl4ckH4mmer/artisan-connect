'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface ImageUploadProps {
    bucket: string;
    onUpload: (url: string) => void;
    defaultImage?: string;
    label?: string;
    className?: string;
}

export default function ImageUpload({ bucket, onUpload, defaultImage, label, className }: ImageUploadProps) {
    const [image, setImage] = useState<string | null>(defaultImage || null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

            setImage(data.publicUrl);
            onUpload(data.publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={className}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

            <div className="flex items-center gap-4">
                <div
                    className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {image ? (
                        <Image
                            src={image}
                            alt="Uploaded image"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                            <Upload className="w-6 h-6 mb-1" />
                            <span className="text-xs">Upload</span>
                        </div>
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    )}
                </div>

                <div className="text-sm text-gray-500">
                    <p>Click to upload a profile picture.</p>
                    <p className="text-xs mt-1">JPG, PNG or GIF (Max 2MB)</p>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>
        </div>
    );
}

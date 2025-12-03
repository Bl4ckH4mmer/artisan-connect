'use client'

import { useState } from 'react'
import { Upload, File, X, CheckCircle } from 'lucide-react'

interface DocumentUploadProps {
    documents: Record<string, string>
    onChange: (documents: Record<string, string>) => void
}

const documentTypes = [
    { key: 'nin', label: 'National ID (NIN)', accept: 'image/*,application/pdf' },
    { key: 'license', label: 'Business License', accept: 'image/*,application/pdf' },
    { key: 'certificate', label: 'Certificate/Diploma', accept: 'image/*,application/pdf' },
    { key: 'other', label: 'Other Document', accept: 'image/*,application/pdf' }
]

export default function DocumentUpload({ documents, onChange }: DocumentUploadProps) {
    const [uploading, setUploading] = useState<string | null>(null)

    const handleFileUpload = async (docType: string, file: File) => {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB')
            return
        }

        setUploading(docType)

        try {
            // Convert to base64 for storage
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                onChange({
                    ...documents,
                    [docType]: base64String
                })
                setUploading(null)
            }
            reader.onerror = () => {
                alert('Failed to read file')
                setUploading(null)
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error('Error uploading document:', error)
            alert('Failed to upload document')
            setUploading(null)
        }
    }

    const handleRemoveDocument = (docType: string) => {
        const newDocs = { ...documents }
        delete newDocs[docType]
        onChange(newDocs)
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentTypes.map(docType => {
                    const hasDocument = !!documents[docType.key]
                    const isUploading = uploading === docType.key

                    return (
                        <div
                            key={docType.key}
                            className="border border-gray-300 rounded-lg p-4 hover:border-orange-400 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">
                                        {docType.label}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        PDF or Image (max 5MB)
                                    </p>
                                </div>
                                {hasDocument && (
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                )}
                            </div>

                            {hasDocument ? (
                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <File className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        <span className="text-sm text-green-700 truncate">
                                            Document uploaded
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveDocument(docType.key)}
                                        className="ml-2 text-red-600 hover:text-red-800 flex-shrink-0"
                                        title="Remove document"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="block">
                                    <input
                                        type="file"
                                        accept={docType.accept}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                handleFileUpload(docType.key, file)
                                            }
                                        }}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-orange-400 transition-colors">
                                        {isUploading ? (
                                            <>
                                                <div className="animate-spin w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full" />
                                                <span className="text-sm text-gray-600">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-600">Upload File</span>
                                            </>
                                        )}
                                    </div>
                                </label>
                            )}
                        </div>
                    )
                })}
            </div>

            {Object.keys(documents).length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        <strong>{Object.keys(documents).length}</strong> document(s) uploaded.
                        These will be stored securely and are only visible to admins.
                    </p>
                </div>
            )}
        </div>
    )
}

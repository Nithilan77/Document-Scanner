
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react'

export default function FileUpload({ onFileSelect, selectedFile, error }) {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles?.length > 0) {
            onFileSelect(acceptedFiles[0])
        }
    }, [onFileSelect])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: 1,
        multiple: false
    })

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`relative h-64 border-2 border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center p-6 group
          ${isDragActive ? 'border-green-500 bg-green-50' : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'}
          ${selectedFile ? 'border-green-500/50 bg-green-50/50' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
            >
                <input {...getInputProps()} />

                {selectedFile ? (
                    <div className="text-center space-y-3 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-neutral-100">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                            <p className="font-serif font-medium text-neutral-800 truncate max-w-[200px] mx-auto text-lg">
                                {selectedFile.name}
                            </p>
                            <p className="text-sm text-neutral-500 mt-1">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onFileSelect(null)
                            }}
                            className="text-sm text-neutral-400 hover:text-red-600 transition-colors py-1 px-3 hover:bg-red-50 rounded-full font-medium"
                        >
                            Change file
                        </button>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-105
              ${isDragActive ? 'bg-green-100' : 'bg-neutral-100'}`}>
                            <Upload className={`w-8 h-8 ${isDragActive ? 'text-green-600' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                        </div>
                        <div>
                            <p className="text-xl font-serif text-neutral-700">
                                {isDragActive ? 'Drop it here' : 'Place your document here'}
                            </p>
                            <p className="text-sm text-neutral-400 mt-2">
                                PDF, photo, or scan
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-3 flex items-center space-x-2 text-red-600 text-sm animate-in slide-in-from-top-1 bg-red-50 p-2 rounded-lg">
                    <XCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}

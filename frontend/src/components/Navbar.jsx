import { FileText } from 'lucide-react'

export default function Navbar({ t }) {
    return (
        <nav className="w-full bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Brand */}
                <div className="flex items-center space-x-2.5">
                    <div className="bg-green-600 p-1.5 rounded-lg text-white">
                        <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-serif font-bold text-neutral-900 tracking-tight">
                        {t.appTitle}
                    </span>
                </div>

                {/* Optional: could add links or small actions here */}
                <div className="text-sm font-medium text-neutral-500">
                    {/* v1.0 or similar if needed, typically empty for clean look */}
                </div>
            </div>
        </nav>
    )
}

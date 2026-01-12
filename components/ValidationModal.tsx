'use client';

interface ValidationModalProps {
    isOpen: boolean;
    onClose: () => void;
    missingFields: string[];
    onFix: (step: number) => void;
}

export default function ValidationModal({ isOpen, onClose, missingFields, onFix }: ValidationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden scale-100 animate-scaleIn">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Action Required</h3>
                        <p className="text-sm text-gray-500">Please fill the following fields to submit.</p>
                    </div>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50/50">
                    <ul className="space-y-3">
                        {missingFields.map((field, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                                <span className="text-red-500 mt-1">•</span>
                                {field}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="w-full px-5 py-2.5 bg-[#0B2C4A] text-white font-bold rounded-xl hover:bg-[#09223a] transition-all shadow-md hover:shadow-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

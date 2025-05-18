import React from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
    if (!isOpen) return null;

    const modalSizes = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-7xl'
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
                role="dialog"
                aria-modal="true"
            >
                <div className={`relative p-4 w-full ${modalSizes[size]}`}>
                    <div className="relative bg-white rounded-lg shadow">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {title}
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 bg-transparent hover:bg-gray-100 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                                aria-label="Tutup"
                            >
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4 md:p-5 space-y-4">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="flex items-center justify-end p-4 md:p-5 border-t border-gray-200 rounded-b">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
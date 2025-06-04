import React from 'react';
import {
    XMarkIcon
} from "@heroicons/react/24/outline";

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
            <div 
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
                role="dialog"
                aria-modal="true"
            >
                <div className={`relative p-4 w-full ${modalSizes[size]} animate-modal-slide-in`}>
                    <div className="relative bg-white rounded-xl shadow-2xl border border-gray-100">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b rounded-t border-gray-100">
                            <h3 className="text-2xl font-serif font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                                {title}
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 bg-transparent hover:bg-gray-50 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center transition-all duration-200"
                                aria-label="Tutup"
                            >
                                <XMarkIcon className='w-6 h-6'/>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="flex items-center justify-end p-6 border-t border-gray-100 rounded-b">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
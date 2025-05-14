import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h5 className="text-xl font-semibold text-gray-900">{title}</h5>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-lg p-1.5 inline-flex items-center"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 20 20">
                                <path 
                                    className="fill-current"
                                    fillRule="evenodd" 
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                                    clipRule="evenodd" 
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
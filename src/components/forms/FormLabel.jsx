import React from 'react';

export default function FormLabel({
    htmlFor,
    children,
    required = false,
    className = ""
}) {
    return (
        <label
            htmlFor={htmlFor}
            className={`block text-xs font-medium text-gray-900 dark:text-gray-100 mb-1 ${className}`}
        >
            <span className="inline-flex items-center gap-1 align-middle">
                {children}
                {required && <span className="text-red-500">*</span>}
            </span>
        </label>
    );
} 
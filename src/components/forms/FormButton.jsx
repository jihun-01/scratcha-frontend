import React from 'react';

export default function FormButton({
    children,
    type = "button",
    variant = "primary",
    disabled = false,
    className = "",
    ...props
}) {
    const baseClasses = "font-semibold rounded-md py-3 transition";

    const variants = {
        primary: "bg-blue-600 text-white hover:opacity-90",
        secondary: "border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700",
        outline: "border border-blue-600 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-700"
    };

    return (
        <button
            type={type}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
} 
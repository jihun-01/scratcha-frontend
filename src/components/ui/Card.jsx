import React from 'react';

export default function Card({
    children,
    className = "",
    padding = "p-6",
    title,
    subtitle
}) {
    return (
        <div 
            className={`rounded-lg theme-card ${padding} ${className}`}
        >
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && (
                        <h3 className="text-lg font-semibold theme-text-primary">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-sm mt-1 theme-text-secondary">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
} 
import React from 'react';

export default function ProgressBar({
    percentage,
    size = "md",
    showLabel = true,
    showPercentage = true,
    className = ""
}) {
    const sizeClasses = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4'
    };

    const getColor = (percentage) => {
        if (percentage >= 90) return 'theme-progress-red';
        if (percentage >= 70) return 'theme-progress-yellow';
        return 'theme-progress-green';
    };

    const getTextColor = (percentage) => {
        if (percentage >= 90) return 'theme-progress-text-red';
        if (percentage >= 70) return 'theme-progress-text-yellow';
        return 'theme-progress-text-green';
    };

    return (
        <div className={`w-full ${className} `}>
            {showLabel && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm theme-text-primary">사용량</span>
                    {showPercentage && (
                        <span className={`text-sm font-medium ${getTextColor(percentage)}`}>
                            {percentage}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full theme-progress-bg rounded-full ${sizeClasses[size]}`}>
                <div
                    className={`${getColor(percentage)} ${sizeClasses[size]} rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    );
} 
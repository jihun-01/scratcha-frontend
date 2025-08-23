import React from 'react';

export default function StatusBadge({
    status,
    size = "sm",
    showIcon = false,
    className = ""
}) {
    const statusConfig = {
        active: {
            label: '활성',
            color: 'theme-badge-active',
            icon: '●'
        },
        inactive: {
            label: '비활성',
            color: 'theme-badge-inactive',
            icon: '○'
        },
        pending: {
            label: '대기중',
            color: 'theme-badge-pending',
            icon: '◐'
        },
        error: {
            label: '오류',
            color: 'theme-badge-error',
            icon: '✕'
        },
        success: {
            label: '성공',
            color: 'theme-badge-success',
            icon: '✓'
        }
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
        <span className={`inline-flex items-center gap-1 border rounded-full font-medium ${config.color} ${sizeClasses[size]} ${className}`}>
            {showIcon && <span className="text-xs">{config.icon}</span>}
            {config.label}
        </span>
    );
} 
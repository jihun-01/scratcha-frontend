import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navigation({ isMobile = false }) {
    const baseClasses = "transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap";
    const { isAuthenticated } = useAuth();

    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: 'auto' }); // 즉시 이동
    };

    if (isMobile) {
        return (
            <nav className="flex gap-4 font-medium theme-text-primary text-sm">
                <Link to="/overview" className={baseClasses} onClick={handleClick}>개요</Link>
                <Link to="/pricing" className={baseClasses} onClick={handleClick}>요금제</Link>
                <Link to="/demo" className={baseClasses} onClick={handleClick}>데모</Link>
                {isAuthenticated && (
                    <Link to="/dashboard" className={baseClasses} onClick={handleClick}>대시보드</Link>
                )}
            </nav>
        );
    }

    return (
        <nav className="flex gap-8 md:gap-10 font-medium theme-text-primary text-base md:text-lg">
            <Link
                to="/overview"
                className={baseClasses}
                onClick={handleClick}
            >
                개요
            </Link>
            <Link
                to="/pricing"
                className={baseClasses}
                onClick={handleClick}
            >
                요금제
            </Link>
            <Link
                to="/demo"
                className={baseClasses}
                onClick={handleClick}
            >
                데모
            </Link>
            {isAuthenticated && (
                <Link
                    to="/dashboard"
                    className={baseClasses}
                    onClick={handleClick}
                >
                    대시보드
                </Link>
            )}
        </nav>
    );
} 
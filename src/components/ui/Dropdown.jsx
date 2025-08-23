import React, { useState, useRef, useEffect } from 'react';

export default function Dropdown({
    trigger,
    children,
    position = "bottom-right",
    className = "",
    disabled = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const positionClasses = {
        'bottom-right': 'top-full right-0 mt-1',
        'bottom-left': 'top-full left-0 mt-1',
        'top-right': 'bottom-full right-0 mb-1',
        'top-left': 'bottom-full left-0 mb-1'
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            >
                {trigger}
            </div>

            {isOpen && (
                <div className={`absolute z-50 ${positionClasses[position]} min-w-48 theme-card rounded-lg shadow-lg py-1`}>
                    {children}
                </div>
            )}
        </div>
    );
}

export function DropdownItem({
    children,
    onClick,
    disabled = false,
    className = ""
}) {
    return (
        <div
            onClick={() => !disabled && onClick?.()}
            className={`px-4 py-2 text-sm theme-dropdown-item cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {children}
        </div>
    );
}

export function DropdownDivider() {
    return <div className="theme-dropdown-divider my-1" />;
} 
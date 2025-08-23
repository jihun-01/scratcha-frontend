import React from 'react';

export default function Table({
    children,
    className = "",
    striped = false
}) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className={`w-full ${striped ? 'striped' : ''} `}>
                {children}
            </table>
        </div>
    );
}

export function TableHead({ children, className = "" }) {
    return (
        <thead className={className}>
            {children}
        </thead>
    );
}

export function TableBody({ children, className = "" }) {
    return (
        <tbody className={className}>
            {children}
        </tbody>
    );
}

export function TableRow({ children, className = "", onClick }) {
    return (
        <tr
            className={`theme-table-row ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </tr>
    );
}

export function TableHeader({ children, className = "", align = "left" }) {
    const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    return (
        <th 
            className={`py-3 px-4 font-medium theme-text-primary ${alignClasses[align]} ${className}`}
        >
            {children}
        </th>
    );
}

export function TableCell({ children, className = "", align = "left" }) {
    const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    return (
        <td 
            className={`py-3 px-4 theme-text-primary ${alignClasses[align]} ${className}`}
        >
            {children}
        </td>
    );
} 
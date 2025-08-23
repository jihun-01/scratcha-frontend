import React from 'react';
import { Link } from 'react-router-dom';

export default function MenuLink({ item, isActive }) {

    return (
        <Link
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition ${isActive
                ? 'bg-blue-600 text-white'
                : 'theme-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
        >
            {item.icon}
            {item.name}
        </Link>
    );
} 
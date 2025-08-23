import React from 'react';

export default function StatCard({
    title,
    value,
    change,
    changeType = 'neutral', // 'positive', 'negative', 'neutral'
    icon,
    color = 'blue'
}) {
    const colorClasses = {
        blue: 'theme-stat-icon-blue',
        green: 'theme-stat-icon-green',
        purple: 'theme-stat-icon-purple',
        yellow: 'theme-stat-icon-yellow',
        red: 'theme-stat-icon-red'
    };

    const changeColorClasses = {
        positive: 'text-green-400 dark:text-green-300',
        negative: 'text-red-400 dark:text-red-300',
        neutral: 'text-gray-400 dark:text-gray-500'
    };

    return (
        <div className="p-6 rounded-lg theme-card">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm theme-text-secondary">{title}</p>
                    <p className="text-2xl font-bold theme-text-primary">{value}</p>
                </div>
                <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            {change && (
                <p className={`text-sm mt-2 ${changeColorClasses[changeType]}`}>
                    {change}
                </p>
            )}
        </div>
    );
} 
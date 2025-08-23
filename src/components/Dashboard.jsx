import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './dashboard/Sidebar';
import DashboardHeader from './dashboard/DashboardHeader';

export default function Dashboard() {
    return (
        <div className="dashboard-layout h-screen flex flex-col theme-layout overflow-hidden">
            <DashboardHeader />
            <div className="flex flex-1 overflow-hidden w-full max-w-7xl mx-auto">
                <div className="w-64 flex-shrink-0">
                    <Sidebar />
                </div>
                <main className="flex-1 p-10 overflow-y-auto theme-layout">
                    <Outlet />
                </main>
            </div>
        </div>
    );
} 
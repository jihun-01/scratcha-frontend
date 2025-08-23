import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { menu } from './MenuData.jsx';
import UserInfo from './UserInfo';
import MenuLink from './MenuLink';

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="w-64 theme-layout border-r theme-divide-gray-200 flex flex-col px-6 py-8 mt-10">
            {/* 유저 정보 */}
            <UserInfo />

            {/* 메뉴 */}
            <nav className="flex flex-col gap-3 mt-8">
                {menu.map(item => (
                    <MenuLink
                        key={item.name}
                        item={item}
                        isActive={
                            item.path === ''
                                ? location.pathname === '/dashboard'
                                : location.pathname.endsWith(item.path)
                        }
                    />
                ))}
            </nav>
        </aside>
    );
} 
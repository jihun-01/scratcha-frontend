import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import Navigation from './Navigation';
import useDarkModeStore from '../../stores/darkModeStore';
import { useAuth } from '../../hooks/useAuth';



export default function Header() {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const userDropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const { isDark, toggle } = useDarkModeStore();

    const {
        isAuthenticated,
        getUserDisplayName,
        getUserInitial,
        logout
    } = useAuth();

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            setIsUserDropdownOpen(false);
            navigate('/');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleDashboardClick = () => {
        setIsUserDropdownOpen(false);
        navigate('/dashboard');
    };

    const handleMainPageClick = () => {
        setIsUserDropdownOpen(false);
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'auto' });
    };

    return (
        <header className={`w-full sticky z-40 transition-all duration-200 top-0 theme-layout border-b theme-border-primary`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 relative">
                <Logo />
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                    <Navigation />
                </div>
                <div className="flex gap-2 items-center">
                    {/* 모바일 네비게이션 */}
                    <div className="md:hidden">
                        <Navigation isMobile={true} />
                    </div>
                    {/* 다크모드 토글 버튼 */}
                    <button
                        onClick={toggle}
                        className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-110 theme-button-secondary"
                    >
                        {isDark ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                            </svg>
                        )}
                    </button>



                    {/* 로그인 상태에 따른 UI */}
                    {isAuthenticated ? (
                        <div className="relative" ref={userDropdownRef}>
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="flex items-center gap-1 px-2 py-1 rounded font-semibold border transition bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 border-blue-600 dark:border-blue-500 h-10"
                            >
                                <div className="w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {getUserInitial()}
                                </div>
                                <svg
                                    className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* 사용자 드롭다운 메뉴 */}
                            {isUserDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 theme-card rounded-lg shadow-lg z-50">
                                    <div className="p-4 theme-border-primary border-b">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {getUserInitial()}
                                            </div>
                                            <div>
                                                <p className="font-semibold theme-text-primary">
                                                    {getUserDisplayName().split('@')[0]}
                                                </p>
                                                <p className="text-sm theme-text-secondary">
                                                    {getUserDisplayName()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-2">
                                        {location.pathname.startsWith('/dashboard') && (
                                            <button
                                                onClick={handleMainPageClick}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded text-left transition theme-text-primary hover:theme-hover-bg"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                                메인화면
                                            </button>
                                        )}
                                        <button
                                            onClick={handleDashboardClick}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded text-left transition theme-text-primary hover:theme-hover-bg"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            대시보드
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsUserDropdownOpen(false);
                                                navigate('/dashboard/app');
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded text-left transition theme-text-primary hover:theme-hover-bg"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            APP 관리
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded text-left hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 transition theme-text-primary"
                                            disabled={isLoggingOut}
                                        >
                                            {isLoggingOut ? (
                                                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.644 9m0 0H9m11 11v-5h-.581m-15.356 0A8.001 8.001 0 0019.356 9m0 0H14m-2-2V4.644M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                            )}
                                            로그아웃
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/signin"
                            className="inline-block px-3 md:px-4 py-2 rounded font-semibold border transition bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 border-blue-600 dark:border-blue-500 text-sm md:text-base"
                        >
                            로그인
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
} 
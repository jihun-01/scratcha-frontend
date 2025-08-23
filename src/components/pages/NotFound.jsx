import React from 'react';
import { Link } from 'react-router-dom';
import useDarkModeStore from '../../stores/darkModeStore';

const NotFound = () => {
    const { isDark, toggle } = useDarkModeStore();

    return (
        <div className="min-h-screen flex items-center justify-center relative theme-layout">
            {/* 다크모드 토글 버튼 */}
            <button
                onClick={toggle}
                className="absolute top-6 right-6 p-3 rounded-lg transition-all duration-200 hover:scale-110 theme-button-secondary"
                title={isDark ? '라이트모드로 전환' : '다크모드로 전환'}
            >
                {isDark ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m6.01-6.01l.707-.707m12.728 12.728l.707.707M6.01 6.01l-.707-.707m12.728-12.728l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                )}
            </button>

            <div className="text-center px-4">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold mb-4 theme-blue-accent">
                        404
                    </h1>
                    <h2 className="text-3xl font-semibold mb-4 theme-text-primary">
                        페이지를 찾을 수 없습니다
                    </h2>
                    <p className="text-lg mb-8 theme-text-secondary">
                        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        to="/"
                        className="inline-block px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 theme-button-primary"
                    >
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound; 
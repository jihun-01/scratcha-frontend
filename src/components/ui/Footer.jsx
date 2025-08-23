import React from 'react';
import { Link } from 'react-router-dom';
import SocialLinks from './SocialLinks';

export default function Footer() {
    return (
        <footer className="w-full pt-12 pb-8 mt-12 theme-footer">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:justify-between gap-12">
                {/* 좌측: 로고, 소셜 */}
                <div className="flex flex-col gap-4 min-w-[180px] text-left">
                    <div className="font-bold text-xl theme-text-primary">
                        SCRATCHA
                    </div>
                    <p className="text-sm theme-text-secondary">
                        더 쉽고, 더 안전하고, 더 강력한 사용자 인증
                    </p>
                    <SocialLinks />
                    <span className="text-xs mt-4 theme-text-tertiary">
                        © 2025 SCRATCHA. All rights reserved.
                    </span>
                </div>

                {/* 우측: 링크 */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-2 gap-8 text-sm text-left">
                    <div>
                        <div className="font-semibold mb-2 text-gray-900 dark:text-white">
                            제품
                        </div>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                            <li><Link to="/overview" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">개요</Link></li>
                            <li><Link to="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">요금제</Link></li>
                            <li><Link to="/demo" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">데모</Link></li>
                            <li><span className="text-gray-400 dark:text-gray-500 cursor-not-allowed">API 문서</span></li>
                        </ul>
                    </div>
                    <div>
                        <div className="font-semibold mb-2 text-gray-900 dark:text-white">
                            개발자
                        </div>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                            <li><span className="text-gray-400 dark:text-gray-500 cursor-not-allowed">SDK</span></li>
                            <li><span className="text-gray-400 dark:text-gray-500 cursor-not-allowed">플러그인</span></li>
                            <li><span className="text-gray-400 dark:text-gray-500 cursor-not-allowed">통합 가이드</span></li>
                            <li><span className="text-gray-400 dark:text-gray-500 cursor-not-allowed">커뮤니티</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
} 
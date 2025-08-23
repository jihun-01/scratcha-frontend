import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import mainSelectImage from '../../assets/images/main-select.png';
import mainScratchaImage from '../../assets/images/main-scratcha.png';

// SVG 아이콘들을 상수로 분리 (재렌더링 방지)
const ARROW_ICON = (
    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
);

const AI_BLOCK_ICON = (
    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const SPEED_ICON = (
    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const SECURITY_ICON = (
    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

export default function MainPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleDemoClick = useCallback(() => {
        navigate('/demo');
    }, [navigate]);

    const handleFreeStartClick = useCallback(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/signup');
        }
    }, [navigate, isAuthenticated]);

    return (
        <div className="min-h-screen theme-layout">
            {/* 히어로 섹션 */}
            <section className="relative overflow-hidden py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-left max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 theme-text-primary">
                            SCRATCHA.
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-3xl theme-text-secondary">
                            Scratch는 이미지를 긁어 확인하고 정답을 맞추는 2단계 인증으로,<br />
                            기존 CAPTCHA를 뛰어넘는 강력한 보안을 제공합니다
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-start">
                            <button
                                onClick={handleDemoClick}
                                className="px-8 py-4 font-bold rounded-lg text-lg hover:opacity-90 transition bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
                            >
                                데모 체험하기 →
                            </button>
                            <button
                                onClick={handleFreeStartClick}
                                className="px-8 py-4 border font-bold rounded-lg text-lg hover:opacity-90 transition theme-button-secondary"
                            >
                                무료로 시작하기 →
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 문제점 제시 및 솔루션 개요 섹션 */}
            <section className="py-24 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-left max-w-4xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                            기존 CAPTCHA, AI 공격에 더 이상 안전하지 않습니다.
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            최신 AI는 문자형·클릭형 CAPTCHA를 손쉽게 우회합니다.<br />
                            잘못된 인증으로 사용자 경험이 나빠지고, 보안은 점차 취약해집니다.<br />
                            봇 트래픽, 계정 생성 남용, 스팸 공격을 막는 새로운 대안이 필요합니다.
                        </p>
                    </div>

                    <div className="text-left max-w-4xl mx-auto mb-12">
                        <h3 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                            Scratcha, 사람은 쉽게 / 봇은 불가능하게
                        </h3>
                    </div>

                    {/* 2단계 인증 다이어그램 */}
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
                            <div className="flex-1">
                                <div className="text-center mb-4">
                                    <div className="w-[400px] h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                                        <img
                                            src={mainScratchaImage}
                                            alt="스크래치 캡차 스크래치"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">1</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        숨겨진 그림을 확인
                                    </h4>
                                </div>
                            </div>

                            <div className="flex items-center">
                                {ARROW_ICON}
                            </div>

                            <div className="flex-1">
                                <div className="text-center mb-4">
                                    <div className="w-[400px] h-[400px] bg-white dark:bg-black rounded-lg mx-auto flex items-center justify-center">
                                        <img
                                            src={mainSelectImage}
                                            alt="스크래치 캡차 정답선택"
                                            className="w-full object-cover"
                                        /></div>
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">2</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        그림을 보고 정답 선택
                                    </h4>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                                AI가 처리하기 어려운 인지 판단 과정을 요구해 봇을 차단하고,<br />
                                사용자는 직관적으로 인증을 완료할 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 주요 기능 섹션 */}
            <section className="py-24 theme-layout">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="text-center p-6">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 theme-ai-block-icon">
                                {AI_BLOCK_ICON}
                            </div>
                            <h3 className="text-xl font-bold mb-2 theme-text-primary">
                                AI 차단 특화
                            </h3>
                            <p className="theme-text-secondary">
                                최신 이미지 언어 모델도<br />
                                해결할 수 없는 보안 구조
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 theme-speed-icon">
                                {SPEED_ICON}
                            </div>
                            <h3 className="text-xl font-bold mb-2 theme-text-primary">
                                초고속 인증
                            </h3>
                            <p className="theme-text-secondary">
                                평균 1.2초 응답으로<br />
                                사용자 이탈률 감소
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 theme-security-icon">
                                {SECURITY_ICON}
                            </div>
                            <h3 className="text-xl font-bold mb-2 theme-text-primary">
                                높은 정확도
                            </h3>
                            <p className="theme-text-secondary">
                                99.8% 봇 차단.<br />
                                실제 사용자만 접근 허용
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 클로징 / 행동 유도 섹션 */}
            <section className="py-24 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-left max-w-4xl mx-auto">
                        <h2 className="text-center text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                            이제, CAPTCHA는 Scratcha로 바꿔보세요.
                        </h2>
                        <p className="text-center text-xl text-gray-600 dark:text-gray-300 mb-8">
                            더 쉽고, 더 안전하고, 더 강력한 사용자 인증을 경험하세요.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
} 
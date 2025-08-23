import React from 'react';

export default function Overview() {
    return (
        <div className="min-h-screen theme-layout">
            {/* Hero Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-left max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 theme-text-primary">
                            긁고 맞춰보세요.
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-bold mb-8 theme-text-primary">
                            AI가 뚫을 수 없는 새로운 CAPTCHA.
                        </h2>
                        <p className="text-lg theme-text-secondary mb-12 text-left">
                            Scratcha는 이미지를 긁어 숨겨진 그림을 확인하고, 정답을 맞추는 2단계 인증 방식으로<br />
                            기존 문자 입력·그림 클릭 CAPTCHA보다 빠르고 안전한 보안을 제공합니다.
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold theme-text-primary mb-2">
                                99.8%
                            </div>
                            <div className="text-sm theme-text-secondary">
                                AI 봇 차단률
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold theme-text-primary mb-2">
                                3.2초
                            </div>
                            <div className="text-sm theme-text-secondary">
                                평균 인증 소요시간
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold theme-text-primary mb-2">
                                50M+
                            </div>
                            <div className="text-sm theme-text-secondary">
                                연간 처리 요청수
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold theme-text-primary mb-2">
                                24/7
                            </div>
                            <div className="text-sm theme-text-secondary">
                                실시간 모니터링 지원
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 theme-layout">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold theme-text-primary mb-8">
                            주요 특징
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="text-center p-4">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 theme-ai-block-icon">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 theme-text-primary">
                                AI 차단 특화
                            </h3>
                            <p className="theme-text-secondary">
                                스크래치 + 정답 선택 2단계 인증으로<br />
                                AI 공격을 효과적으로 방어합니다.
                            </p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 theme-speed-icon">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 theme-text-primary">
                                초고속 인증
                            </h3>
                            <p className="theme-text-secondary">
                                평균 d.d초 이내 인증 완료<br />
                                사용자 이탈률을 최소화합니다.
                            </p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-purple-600">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 theme-text-primary">
                                직관적 & 재미있는 UX
                            </h3>
                            <p className="theme-text-secondary">
                                긁고 확인하고 맞추는 간단한 인증<br />
                                사용자의 거부감을 줄입니다.
                            </p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-teal-500">
                                <svg
                                    className="w-12 h-12 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 theme-text-primary">
                                반응형 디자인
                            </h3>
                            <p className="theme-text-secondary">
                                모바일, 데스크톱 어디서든<br />
                                동일한 경험을 제공합니다.
                            </p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-orange-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-12 h-12 text-white"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 theme-text-primary">
                                쉬운 API 연동
                            </h3>
                            <p className="theme-text-secondary">
                                간단한 코드로 기존 웹사이트에<br />
                                빠르게 적용할 수 있습니다.
                            </p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-blue-600">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 theme-text-primary">
                                실시간 분석
                            </h3>
                            <p className="theme-text-secondary">
                                인증 결과와 트래픽 데이터를<br />
                                대시보드에서 한눈에 확인하세요
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works Section */}
            <section className="py-24 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                            Scratcha 작동 방식
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Scratcha는 행동 데이터와 정답 결과를 함께 검증해<br />
                            봇을 차단합니다.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gray-600">
                                <span className="text-2xl font-bold text-white">1</span>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                                스크래치 영역 생성
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                덮개가 씌워진 이미지가 나타나며,<br />
                                사용자가 해당 이미지를 드래그로 긁어서<br />
                                내용을 확인하도록 유도합니다.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gray-600">
                                <span className="text-2xl font-bold text-white">2</span>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                                스크래치 동작 분석
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                사용자가 덮개 이미지를 긁는 속도,<br />
                                경로, 패턴을 분석해 실제 사람인지<br />
                                식별합니다.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gray-600">
                                <span className="text-2xl font-bold text-white">3</span>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                                이미지 정답 선택
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                덮개 이미지를 긁어서 드러난 이미지 보고<br />
                                정답을 선택하면 인증이 완료 됩니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
} 
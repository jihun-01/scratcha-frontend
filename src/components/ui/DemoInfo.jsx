import React from 'react';

export default function DemoInfo({ isCompleted }) {
    return (
        <div className="p-8 rounded-2xl theme-card">
            <h2 className="text-2xl font-bold theme-text-primary mb-6">스크래치 캡차란?</h2>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold theme-text-primary mb-3">🎯 AI가 해결할 수 없는 캡차</h3>
                    <p className="theme-text-secondary leading-relaxed">
                        기존의 텍스트 기반 캡차는 AI 기술의 발전으로 해킹 위험이 증가하고 있습니다.
                        스크래치 캡차는 시각적 패턴 인식이 필요한 인터랙티브 방식으로,
                        AI가 쉽게 해결할 수 없는 강력한 보안을 제공합니다.
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold theme-text-primary mb-3">🚀 사용자 친화적</h3>
                    <p className="theme-text-secondary leading-relaxed">
                        복잡한 텍스트 입력 대신 직관적인 스크래치 동작만으로 검증이 가능합니다.
                        모바일에서도 터치로 쉽게 사용할 수 있어 접근성이 뛰어납니다.
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold theme-text-primary mb-3">🛡️ 강력한 보안</h3>
                    <p className="theme-text-secondary leading-relaxed">
                        봇의 자동화된 공격을 효과적으로 차단합니다.
                        스크래치 패턴, 속도, 정확도 등 다양한 요소를 종합적으로 분석하여
                        실제 사용자와 봇을 정확히 구분합니다.
                    </p>
                </div>

                {isCompleted && (
                    <div className="mt-8 p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-green-800 dark:text-green-200">스크래치 완료!</h4>
                                <p className="text-green-700 dark:text-green-300 text-sm">캡차 검증이 성공적으로 완료되었습니다.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 
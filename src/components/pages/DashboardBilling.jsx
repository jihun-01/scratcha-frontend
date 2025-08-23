import React, { useState } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Modal from '../ui/Modal';
import ProgressBar from '../ui/ProgressBar';
import { useDashboardStore } from '../../stores/dashboardStore';

export default function DashboardBilling() {
    // Typography scale for consistency
    const T = {
        sectionTitle: 'text-xl font-semibold',
        label: 'text-sm'
    };
    const {
        currentPlan,
        planUsageData,
        changePlan,
        calculateOverageCost,
        calculateTotalCost
    } = useDashboardStore();
    const [isPlanChangeModalOpen, setIsPlanChangeModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('Starter');

    // 요금제 옵션 (메인페이지 Pricing과 동일)
    const planOptions = [
        {
            id: 'free',
            name: 'Free',
            price: '₩0',
            period: '/월',
            limit: 1000,
            description: '월 1,000 토큰 무료제공',
            overageRate: 0,
            features: [
                '기본 API 통계',
                '광고 포함'
            ]
        },
        {
            id: 'starter',
            name: 'Starter',
            price: '₩29,900',
            period: '/월',
            limit: 50000,
            description: '월 50,000 토큰 제공',
            overageRate: 2.0,
            features: [
                '기본 API & 통계',
                '광고 제거',
                '이메일 지원'
            ]
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '₩79,900',
            period: '/월',
            limit: 200000,
            description: '월 200,000 토큰 제공',
            overageRate: 2.0,
            features: [
                'Starter의 모든 혜택',
                '커스텀 UI 스킨 지원',
                '고급 분석 리포트'
            ]
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: '맞춤 견적',
            period: '',
            limit: 999999999,
            description: '월 무제한 또는 대규모 토큰 패키지',
            overageRate: 0,
            features: [
                'Pro의 모든 혜택',
                '전용 인프라/보안 강화',
                'SLA 보장',
                '24/7 모니터링'
            ]
        }
    ];

    // 통합 사용량 데이터 사용
    const realtimeUsage = planUsageData.current;
    const lastMonthUsage = planUsageData.lastMonth;

    // 초과분 요금 계산 (토큰 기준)
    const overageCost = calculateOverageCost(realtimeUsage.tokens.used, currentPlan.limit, currentPlan.overageRate);
    const totalCost = calculateTotalCost(realtimeUsage.tokens.used, currentPlan.limit, currentPlan.price, currentPlan.overageRate);

    // 요금제 변경 처리
    const handlePlanChange = () => {
        changePlan(selectedPlan);
        setIsPlanChangeModalOpen(false);
        alert(`${selectedPlan} 요금제로 변경되었습니다!`);
    };

    return (
        <DashboardLayout
            title="요금"
            subtitle="요금제 및 청구 내역을 관리하세요"
        >
            <div className="space-y-6">
                {/* 현재 요금제 */}
                <div className="theme-card p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className={`${T.sectionTitle} text-gray-900 dark:text-gray-100`}>현재 요금제</h3>
                        <button
                            onClick={() => setIsPlanChangeModalOpen(true)}
                            className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            요금제 변경
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 요금제 정보 */}
                        <div className="lg:col-span-2">
                            <div className="p-6 theme-card rounded-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold theme-text-primary">{currentPlan.name}</h4>
                                    <span className="text-2xl font-bold theme-text-primary">{currentPlan.price}</span>
                                </div>
                                <p className="text-sm theme-text-secondary mb-4">{currentPlan.description}</p>

                                {/* 사용량 진행률 */}
                                <div className="mb-4">
                                    {/* 개요와 동일한 임계값 색상 규칙 적용 */}
                                    {(() => {
                                        const p = realtimeUsage.tokens.percentage;
                                        const color = p < 30 ? 'bg-green-500' : p < 60 ? 'bg-yellow-500' : 'bg-red-500';
                                        return (
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div className={`h-2 rounded-full transition-all duration-300 ${color}`} style={{ width: `${Math.min(p, 100)}%` }} />
                                            </div>
                                        );
                                    })()}
                                    <div className="flex items-center justify-between text-xs mt-1">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            토큰: {realtimeUsage.tokens.used.toLocaleString()} / {realtimeUsage.tokens.limit.toLocaleString()}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            API 호출: {realtimeUsage.requests.count.toLocaleString()}회
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        평균 {realtimeUsage.requests.avgTokensPerRequest} 토큰/회
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 요금제 특징 */}
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">포함 기능</h4>
                            <ul className="space-y-2">
                                {currentPlan.features?.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                )) || [
                                        <li key="default-1" className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            기본 API & 통계
                                        </li>,
                                        <li key="default-2" className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            광고 제거
                                        </li>,
                                        <li key="default-3" className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            이메일 지원
                                        </li>
                                    ]}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 요금 청구 내역 */}
                <div className="theme-card p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className={`${T.sectionTitle} text-gray-900 dark:text-gray-100 mb-6`}>요금 청구 내역</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 실시간 사용량 금액 */}
                        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">실시간 사용량</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">이번 달 현재</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">기본 요금</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">{currentPlan.price}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">초과 사용량</span>
                                    <span className={`font-medium ${overageCost > 0 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {overageCost > 0 ? `₩${overageCost.toLocaleString()}` : '₩0'}
                                    </span>
                                </div>
                                {overageCost > 0 && (
                                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-red-50 p-2 rounded">
                                        초과 토큰: {(realtimeUsage.tokens.used - realtimeUsage.tokens.limit).toLocaleString()} 토큰 × ₩{currentPlan.overageRate}/1,000토큰
                                    </div>
                                )}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">총 금액</span>
                                        <span className={`font-bold text-lg ${overageCost > 0 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                                            ₩{totalCost.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 지난달 사용량 금액 */}
                        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">지난달 사용량</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">2024년 12월</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">토큰 사용량</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">{lastMonthUsage.tokens.used.toLocaleString()} 토큰</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">API 호출 횟수</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">{lastMonthUsage.requests.count.toLocaleString()}회</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">기본 요금</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">₩{lastMonthUsage.billing.basePrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">초과 요금</span>
                                    <span className={`font-medium ${lastMonthUsage.billing.overageCost > 0 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {lastMonthUsage.billing.overageCost > 0 ? `₩${lastMonthUsage.billing.overageCost.toLocaleString()}` : '₩0'}
                                    </span>
                                </div>
                                {lastMonthUsage.billing.overageCost > 0 && (
                                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-red-50 p-2 rounded">
                                        초과 토큰: {(lastMonthUsage.tokens.used - lastMonthUsage.tokens.limit).toLocaleString()} 토큰 × ₩{lastMonthUsage.billing.overageRate}/1,000토큰
                                    </div>
                                )}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">총 청구액</span>
                                        <span className={`font-bold text-lg ${lastMonthUsage.billing.overageCost > 0 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                                            ₩{lastMonthUsage.billing.totalCost.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 요금제 변경 모달 */}
            <Modal
                isOpen={isPlanChangeModalOpen}
                onClose={() => setIsPlanChangeModalOpen(false)}
                title="요금제 변경"
            >
                <div className="space-y-6">
                    <p className="text-gray-900 dark:text-gray-100">
                        새로운 요금제를 선택하세요. 변경은 즉시 적용되며, 다음 청구 주기에 반영됩니다.
                    </p>

                    {/* 요금제 선택 */}
                    <div className="space-y-4">
                        {planOptions.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.name)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedPlan === plan.name
                                    ? 'border-blue-600 dark:border-blue-500 bg-blue-100 dark:bg-blue-900/20'
                                    : 'theme-card hover:border-blue-400 dark:hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold theme-text-primary">{plan.name}</h4>
                                    <div className="text-right">
                                        <div className="text-lg font-bold theme-text-primary">{plan.price}</div>
                                        <div className="text-sm theme-text-secondary">{plan.period}</div>
                                    </div>
                                </div>
                                <p className="text-sm theme-text-secondary mb-3">{plan.description}</p>
                                <ul className="space-y-1">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                            <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* 변경 확인 */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setIsPlanChangeModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handlePlanChange}
                            className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            요금제 변경
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
} 
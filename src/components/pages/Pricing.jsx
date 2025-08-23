import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// 요금제 데이터 JSON
const PRICING_DATA = {
    title: "비즈니스 규모와 사용량에 맞춰 유연하게 선택하세요",
    subtitle: [
        "Scratcha는 토큰 기반 과금으로, 사용한 만큼만 지불합니다.",
        "모든 요금제는 AI보안 CAPTCHA API와 기본 대시보드를 포함합니다."
    ],
    plans: [
        {
            name: "Free",
            price: "₩ 0",
            description: "월 1,000 토큰 무료제공",
            features: [
                "기본 API 통계",
                "광고 포함"
            ],
            buttonText: "무료 시작",
            popular: false
        },
        {
            name: "Starter",
            price: "₩ 29,900",
            description: "월 50,000 토큰 제공",
            features: [
                "기본 API & 통계",
                "광고 제거",
                "이메일 지원"
            ],
            buttonText: "시작하기",
            popular: true
        },
        {
            name: "Pro",
            price: "₩ 79,900",
            description: "월 200,000 토큰 제공",
            features: [
                "Starter의 모든 혜택",
                "커스텀 UI 스킨 지원",
                "고급 분석 리포트"
            ],
            buttonText: "시작하기",
            popular: false
        },
        {
            name: "Enterprise",
            price: "맞춤 견적",
            description: "월 무제한 또는 대규모 토큰 패키지",
            features: [
                "Pro의 모든 혜택",
                "전용 인프라/보안 강화",
                "SLA 보장",
                "24/7 모니터링"
            ],
            buttonText: "문의하기",
            popular: false
        }
    ],
    faq: {
        title: "자주 묻는 질문",
        questions: [
            {
                question: "어떤 요금제로 변경할 수 있나요?",
                answer: "Starter, Pro, Enterprise 중에 원하는 요금제로 언제든지 변경할 수 있습니다. 마이 페이지에서 관리하세요"
            },
            {
                question: "무료 플랜의 제약사항은 무엇인가요?",
                answer: "무료 플랜은 매일 정해진 수의 토큰을 사용할 수 있으며, 일부 기능에 접근이 제한됩니다. 또한, 기본 UI에 광고가 포함됩니다."
            },
            {
                question: "청구는 어떻게 되나요?",
                answer: "이용 전 원하는 만큼 토큰을 선결제해 사용하실 수 있으며,\n모두 소진 시 추가로 결제하여 구매하실 수 있습니다."
            },
            {
                question: "기술 지원을 받을 수 있나요?",
                answer: "모든 유료 요금제에 대해 이메일 채널을 통한 기술 지원을 제공합니다."
            }
        ]
    }
};

export default function Pricing() {
    const { title, subtitle, plans, faq } = PRICING_DATA;
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handlePlanClick = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/signup');
        }
    };

    // 그리드 컬럼 수 자동 계산
    const gridCols = plans.length === 1 ? 'grid-cols-1' :
        plans.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
            plans.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

    return (
        <div className="min-h-screen theme-layout">
            {/* Hero + Pricing Cards Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Hero */}
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold theme-text-primary mb-6">
                            {title}
                        </h1>
                        <div className="text-xl md:text-2xl theme-text-secondary mb-8 max-w-3xl mx-auto">
                            {subtitle.map((line, index) => (
                                <p key={index} className={index > 0 ? 'mt-2' : ''}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* 2배 간격 (기준 mb-16의 2배 = mb-32) */}
                    <div className="mb-32"></div>

                    {/* Pricing Cards */}
                    <div className={`grid ${gridCols} gap-8`}>
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl flex flex-col theme-card ${plan.popular
                                    ? 'theme-popular-border relative'
                                    : ''
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 theme-popular-badge text-white px-4 py-1 rounded-full text-sm font-bold">
                                        인기
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold theme-text-primary mb-2">
                                        {plan.name}
                                    </h3>
                                    <div className="mb-4">
                                        <span className="text-4xl font-bold theme-blue-accent">
                                            {plan.price}
                                        </span>
                                        {plan.period && (
                                            <span className="text-lg theme-text-secondary">
                                                /{plan.period}
                                            </span>
                                        )}
                                    </div>
                                    <p className="theme-text-secondary h-12 flex items-start leading-6">
                                        {plan.description}
                                    </p>
                                </div>

                                <ul className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center">
                                            <svg className="w-5 h-5 theme-success mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="theme-text-primary">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={handlePlanClick}
                                    className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition mt-auto ${plan.popular
                                        ? 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white'
                                        : 'border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white'
                                        }`}
                                >
                                    {plan.buttonText}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold theme-text-primary mb-24">
                            {faq.title}
                        </h2>
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto`}>
                            {faq.questions.map((item, index) => (
                                <div key={index}>
                                    <h3 className="text-2xl md:text-3xl font-bold theme-text-primary mb-4 text-center">
                                        {item.question}
                                    </h3>
                                    <p className="text-lg theme-text-secondary text-left leading-relaxed max-w-md mx-auto whitespace-pre-line">
                                        {item.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
} 
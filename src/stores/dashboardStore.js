import { create } from 'zustand';
import {
    DUMMY_APPS,
    DUMMY_API_KEYS,
    DEFAULT_PLAN,
    PLAN_USAGE_DATA,
    // generateUsageLogs,
    // generateStats,
    // generateUsageData,
    bucketUsageSeries,
    computeStatsFromLogs,
    getMonthToDateLogs,
    synthesizeMonthToDateLogs,
    getStableSessionLogs,
} from '../data/dashboardDummy';
import { LOG_DATASETS } from '../data/logDatasets';
import { applicationAPI } from '../services/api';

// 초기 로그/차트/통계 값 준비 (개요 페이지 첫 렌더 안정화)
const INITIAL_PERIOD = '전체';
// 경계값 시나리오 중 하나를 매 새로고침마다 랜덤 선택: low/mid/high
const DATASET_KEYS = ['low', 'mid', 'high'];
const INITIAL_SCENARIO = DATASET_KEYS[Math.floor(Math.random() * DATASET_KEYS.length)];
const INITIAL_LOGS = getStableSessionLogs('all', 'all', 365);
const SCENARIO_LOGS = {
    low: LOG_DATASETS.low || INITIAL_LOGS,
    mid: LOG_DATASETS.mid || INITIAL_LOGS,
    high: LOG_DATASETS.high || INITIAL_LOGS,
};
const INITIAL_AVG_TOKENS = (PLAN_USAGE_DATA.current?.requests?.avgTokensPerRequest) || 20;
const INITIAL_LIMIT = (PLAN_USAGE_DATA.current?.tokens?.limit) || DEFAULT_PLAN.limit;
// 월별(MTD) 기준 사용량 집계
const INITIAL_MTD_LOGS = getMonthToDateLogs('all', 'all');
const INITIAL_USED = INITIAL_MTD_LOGS.length * INITIAL_AVG_TOKENS;
const INITIAL_PERCENTAGE = Math.min(100, Math.round((INITIAL_USED / INITIAL_LIMIT) * 100));

export const useDashboardStore = create((set) => ({
    // 상태
    datasetScenario: INITIAL_SCENARIO,
    chartType: 'line', // 'line' | 'area' | 'bar' | 'composed'
    selectedPeriod: INITIAL_PERIOD,
    usageData: bucketUsageSeries(INITIAL_PERIOD, INITIAL_LOGS),
    stats: computeStatsFromLogs(INITIAL_LOGS),
    isLoading: false,
    // 세션 고정 원본 로그 (기간 변경 시 이 데이터만 필터링하여 사용)
    sessionLogs: INITIAL_LOGS,
    sessionLogsByScenario: SCENARIO_LOGS,
    // 기준 시점 고정(세션 시작 시 now). 기간 변경해도 동일 기준으로 버킷팅/통계 계산
    sessionNow: new Date().toISOString(),
    // 월 기준 임계값 확인용 합성 로그 (이번 달)
    syntheticMtdLogs: INITIAL_MTD_LOGS,
    apps: DUMMY_APPS.map((app) => ({
        id: app.id,
        name: app.name,
        description: app.description || '',
        status: app.status || 'active',
        // Settings/Usage defaults to satisfy settings page
        settings: app.settings || {
            model: 'gpt-4',
            noiseLevel: '중',
            heuristicLevel: '중',
        },
        usage: app.usage || {
            today: 0,
            week: 0,
            month: 0,
        },
        createdAt: app.createdAt || new Date().toISOString().split('T')[0],
    })),
    selectedAppId: null,
    apiKeys: DUMMY_API_KEYS,
    usageLogs: INITIAL_LOGS,
    isAppsLoading: false,

    // 액션
    setApps: (apps) => set({ apps }),
    setApiKeys: (apiKeys) => set({ apiKeys }),

    // 서버에서 최신 APP/API 키 목록을 가져와 스토어를 덮어씀
    refreshApplications: async () => {
        set({ isAppsLoading: true, apps: [], apiKeys: [] });
        try {
            const response = await applicationAPI.getAllApplications();
            const processedKeyIds = new Set();

            // 모든 키 수집 (배열/단일 모두 지원), 중복 제거
            const freshKeys = [];
            (response.data || []).forEach(app => {
                const keys = Array.isArray(app.keys) ? app.keys : (app.key ? [app.key] : []);
                keys.forEach(k => {
                    if (k && !processedKeyIds.has(k.id)) {
                        processedKeyIds.add(k.id);
                        freshKeys.push({
                            id: k.id,
                            appId: app.id,
                            name: `API Key ${k.id}`,
                            key: k.key,
                            status: k.isActive ? 'active' : 'inactive',
                            lastUsed: '사용 기록 없음',
                        });
                    }
                });
            });

            // 앱 활성 여부: 해당 앱의 키 중 하나라도 active면 active, 키 없거나 모두 inactive면 inactive
            const freshApps = (response.data || []).map((app) => {
                const keys = freshKeys.filter(k => k.appId === app.id);
                const isActive = keys.length > 0 ? keys.some(k => k.status === 'active') : false;
                return {
                    id: app.id,
                    name: app.appName,
                    description: app.description || '',
                    status: isActive ? 'active' : 'inactive',
                    settings: {
                        model: 'gpt-4',
                        noiseLevel: '중',
                        heuristicLevel: '중',
                    },
                    usage: { today: 0, week: 0, month: 0 },
                    createdAt: new Date().toISOString().split('T')[0],
                };
            });

            set({ apps: freshApps, apiKeys: freshKeys });
        } finally {
            set({ isAppsLoading: false });
        }
    },
    setDatasetScenario: (scenarioKey) => {
        set((state) => {
            const avgTokens = state.planUsageData.current.requests.avgTokensPerRequest || 20;
            const limit = state.planUsageData.current.tokens.limit || state.currentPlan.limit;
            // 개요 요금제 퍼센트는 항상 "이번달(MTD)" 기준 - 목표 퍼센트에 맞춰 합성 로그 생성
            const desiredCalls = Math.floor((limit * (scenarioKey === 'low' ? 25 : scenarioKey === 'high' ? 75 : 45)) / 100 / Math.max(1, avgTokens));
            const synthLogs = synthesizeMonthToDateLogs(Math.max(50, desiredCalls), 'all', 'all');
            const used = synthLogs.length * avgTokens;
            const percentage = Math.min(100, Math.round((used / limit) * 100));

            // 세션 로그를 시나리오에 맞게 교체하고, 현재 기간 기준으로 usageData 갱신
            const newSessionLogs = state.sessionLogsByScenario?.[scenarioKey] || state.sessionLogs;
            const now = new Date(state.sessionNow);
            const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
            const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
            let from = new Date(0);
            if (state.selectedPeriod === '1일') from = startOfDay(now);
            else if (state.selectedPeriod === '7일') { const s = startOfDay(now); s.setDate(s.getDate() - 6); from = s; }
            else if (state.selectedPeriod === '30일') from = startOfMonth(now);
            else { const s = new Date(startOfDay(now)); s.setMonth(s.getMonth() - 11); s.setDate(1); from = s; }
            const baseLogs = newSessionLogs.filter(l => {
                const t = new Date(l.callAt);
                return t >= from && t <= now;
            });
            const usageData = bucketUsageSeries(state.selectedPeriod, baseLogs, state.sessionNow);
            const statsBase = computeStatsFromLogs(newSessionLogs, state.sessionNow);
            const stats = {
                ...statsBase,
                // 상단 바(합성 MTD)와 카드의 '이번 달'을 일치시킴
                month: { ...statsBase.month, value: synthLogs.length },
            };

            return {
                datasetScenario: scenarioKey,
                syntheticMtdLogs: synthLogs,
                sessionLogs: newSessionLogs,
                usageLogs: baseLogs,
                usageData,
                stats,
                planUsageData: {
                    ...state.planUsageData,
                    current: {
                        ...state.planUsageData.current,
                        tokens: {
                            ...state.planUsageData.current.tokens,
                            used,
                            limit,
                            percentage,
                        },
                        requests: {
                            ...state.planUsageData.current.requests,
                            count: synthLogs.length,
                        },
                    },
                },
            };
        });
    },

    setChartType: (chartType) => set({ chartType }),
    setPeriod: (period) => {
        console.debug('[Store] setPeriod ->', period);
        set((state) => {
            // 세션 고정 로그에서 기간만 필터링
            const now = new Date();
            const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
            const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
            let from = new Date(0);
            if (period === '1일') from = startOfDay(now);
            else if (period === '7일') { const s = startOfDay(now); s.setDate(s.getDate() - 6); from = s; }
            else if (period === '30일') from = startOfMonth(now);
            else { const s = new Date(startOfDay(now)); s.setMonth(s.getMonth() - 11); s.setDate(1); from = s; }
            const baseLogs = state.sessionLogs.filter(l => new Date(l.callAt) >= from && new Date(l.callAt) <= now);
            const avgTokens = state.planUsageData.current.requests.avgTokensPerRequest || 20;
            const limit = state.planUsageData.current.tokens.limit || state.currentPlan.limit;
            const used = state.syntheticMtdLogs.length * avgTokens;
            const percentage = Math.min(100, Math.round((used / limit) * 100));
            const effectiveLogs = baseLogs; // 30일도 세션 로그 사용(대량 샘플)
            const series = bucketUsageSeries(period, effectiveLogs, state.sessionNow);
            console.debug('[Store] cachedLogs:', effectiveLogs.length, 'series points:', series.length);
            return {
                selectedPeriod: period,
                // 카드 수치(오늘/주/월)는 그래프 기간과 무관하게 세션 고정 로그로 계산
                stats: (() => {
                    const b = computeStatsFromLogs(state.sessionLogs, state.sessionNow);
                    return { ...b, month: { ...b.month, value: state.syntheticMtdLogs.length } };
                })(),
                usageData: series,
                planUsageData: {
                    ...state.planUsageData,
                    current: {
                        ...state.planUsageData.current,
                        tokens: {
                            ...state.planUsageData.current.tokens,
                            used,
                            limit,
                            percentage,
                        },
                        requests: {
                            ...state.planUsageData.current.requests,
                            count: state.syntheticMtdLogs.length,
                        },
                    },
                },
                isLoading: true,
            };
        });

        // 로딩 시뮬레이션
        setTimeout(() => {
            console.debug('[Store] setPeriod done -> isLoading=false');
            set({ isLoading: false });
        }, 500);
    },

    // APP 선택 (같은 항목 두 번 클릭 시 선택 해제)
    selectApp: (appId) => {
        set((state) => ({ selectedAppId: state.selectedAppId === appId ? null : appId }));
    },

    // APP 설정 업데이트
    updateAppSettings: (appId, settings) => {
        set(state => ({
            apps: state.apps.map(app =>
                app.id === appId
                    ? { ...app, settings: { ...app.settings, ...settings } }
                    : app
            )
        }));
    },

    // APP 상태 토글 (removed from settings, but logic might be here for APP menu)
    toggleAppStatus: (appId) => {
        set(state => {
            const newAppStatus = state.apps.find(app => app.id === appId)?.status === 'active' ? 'inactive' : 'active';

            return {
                apps: state.apps.map(app =>
                    app.id === appId
                        ? { ...app, status: newAppStatus }
                        : app
                ),
                // APP이 비활성화되면 해당 APP의 모든 API 키도 비활성화
                apiKeys: state.apiKeys.map(key =>
                    key.appId === appId
                        ? { ...key, status: newAppStatus }
                        : key
                )
            };
        });
    },

    // 새 APP 추가 (동일 id는 교체하여 중복 방지)
    addApp: (appData) => {
        const nowIso = new Date().toISOString();
        const newApp = {
            ...appData,
            status: appData.status || 'active',
            createdAt: appData.createdAt || nowIso.split('T')[0],
            settings: appData.settings || {
                model: 'gpt-4',
                noiseLevel: '중',
                heuristicLevel: '중'
            },
            usage: appData.usage || {
                today: 0,
                week: 0,
                month: 0
            }
        };

        set(state => ({
            apps: [...state.apps.filter(a => a.id !== newApp.id), newApp]
        }));
    },

    // APP 삭제
    deleteApp: (appId) => {
        set(state => ({
            apps: state.apps.filter(app => app.id !== appId),
            selectedAppId: state.selectedAppId === appId ? null : state.selectedAppId
        }));
    },

    // 사용량 로그 업데이트 (세션 캐시 적용)
    _logCache: {},
    updateUsageLogs: (appId, apiKeyId, period) => {
        set((state) => {
            // 세션 고정 로그에서 기간/APP/API 키만 필터링
            const now = new Date();
            const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
            const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
            let from = new Date(0);
            if (period === '1일') from = startOfDay(now);
            else if (period === '7일') { const s = startOfDay(now); s.setDate(s.getDate() - 6); from = s; }
            else if (period === '30일') from = startOfMonth(now);
            else { const s = new Date(startOfDay(now)); s.setMonth(s.getMonth() - 11); s.setDate(1); from = s; }
            let logs = state.sessionLogs.filter(l => {
                const t = new Date(l.callAt);
                if (t < from || t > now) return false;
                if (appId !== 'all' && l.appId !== appId) return false;
                if (apiKeyId !== 'all' && l.apiKeyId !== apiKeyId) return false;
                return true;
            });
            const avgTokens = state.planUsageData.current.requests.avgTokensPerRequest || 20;
            const limit = state.planUsageData.current.tokens.limit || state.currentPlan.limit;
            const used = state.syntheticMtdLogs.length * avgTokens;
            const percentage = Math.min(100, Math.round((used / limit) * 100));
            const effectiveLogs = logs; // 30일도 세션 로그 사용(대량 샘플)
            return {
                usageLogs: effectiveLogs,
                usageData: bucketUsageSeries(state.selectedPeriod, effectiveLogs, state.sessionNow),
                // 카드 수치는 그래프 기간과 무관하게 세션 고정 로그로 계산
                stats: computeStatsFromLogs(state.sessionLogs, state.sessionNow),
                planUsageData: {
                    ...state.planUsageData,
                    current: {
                        ...state.planUsageData.current,
                        tokens: {
                            ...state.planUsageData.current.tokens,
                            used,
                            limit,
                            percentage,
                        },
                        requests: {
                            ...state.planUsageData.current.requests,
                            count: state.syntheticMtdLogs.length,
                        },
                    },
                },
            };
        });
    },

    // 현재 요금제 정보 (메인페이지 Pricing과 동일)
    currentPlan: DEFAULT_PLAN,

    // 통합 요금제 사용량 데이터 (모든 대시보드 페이지에서 공통 사용)
    planUsageData: {
        ...PLAN_USAGE_DATA,
        current: {
            ...PLAN_USAGE_DATA.current,
            tokens: {
                ...PLAN_USAGE_DATA.current.tokens,
                used: INITIAL_USED,
                limit: INITIAL_LIMIT,
                percentage: INITIAL_PERCENTAGE,
            },
            requests: {
                ...PLAN_USAGE_DATA.current.requests,
                count: INITIAL_LOGS.length,
            },
        },
    },

    // 요금제 변경 (메인페이지 Pricing과 동일)
    changePlan: (newPlan) => {
        const planConfigs = {
            'Free': {
                name: 'Free',
                limit: 1000,
                price: '₩0',
                description: '월 1,000 토큰 무료제공',
                overageRate: 0,
                features: [
                    '기본 API 통계',
                    '광고 포함'
                ]
            },
            'Starter': {
                name: 'Starter',
                limit: 50000,
                price: '₩29,900',
                description: '월 50,000 토큰 제공',
                overageRate: 2.0,
                features: [
                    '기본 API & 통계',
                    '광고 제거',
                    '이메일 지원'
                ]
            },
            'Pro': {
                name: 'Pro',
                limit: 200000,
                price: '₩79,900',
                description: '월 200,000 토큰 제공',
                overageRate: 2.0,
                features: [
                    'Starter의 모든 혜택',
                    '커스텀 UI 스킨 지원',
                    '고급 분석 리포트'
                ]
            },
            'Enterprise': {
                name: 'Enterprise',
                limit: 999999999,
                price: '맞춤 견적',
                description: '월 무제한 또는 대규모 토큰 패키지',
                overageRate: 0,
                features: [
                    'Pro의 모든 혜택',
                    '전용 인프라/보안 강화',
                    'SLA 보장',
                    '24/7 모니터링'
                ]
            }
        };

        const newPlanConfig = planConfigs[newPlan];
        if (newPlanConfig) {
            set(state => {
                const used = state.planUsageData.current.tokens.used;
                const limit = newPlanConfig.limit;
                const percentage = Math.min(100, Math.round((used / limit) * 100));

                return {
                    // 플랜 자체 정보 업데이트
                    currentPlan: {
                        ...state.currentPlan,
                        ...newPlanConfig
                    },
                    // 사용량 측정 기준(limit/percentage)도 함께 반영
                    planUsageData: {
                        ...state.planUsageData,
                        current: {
                            ...state.planUsageData.current,
                            tokens: {
                                ...state.planUsageData.current.tokens,
                                limit,
                                percentage,
                            }
                        }
                    }
                };
            });
        }
    },

    // 초과분 요금 계산
    calculateOverageCost: (used, limit, overageRate) => {
        if (used <= limit) return 0;
        return Math.round((used - limit) * overageRate);
    },

    // 총 요금 계산 (기본 요금 + 초과분 요금)
    calculateTotalCost: (used, limit, basePrice, overageRate) => {
        const basePriceNumber = parseInt(basePrice.replace(/[^\d]/g, ''));
        const overageCost = (used > limit) ? Math.round((used - limit) * overageRate) : 0;
        return basePriceNumber + overageCost;
    },

    // 최근 활동
    recentActivities: [
        {
            id: 1,
            type: 'success',
            title: '캡차 검증 성공',
            time: '2분 전',
            count: '+1',
            icon: 'check'
        },
        {
            id: 2,
            type: 'info',
            title: 'API 키 생성',
            time: '1시간 전',
            count: '새 키',
            icon: 'settings'
        },
        {
            id: 3,
            type: 'warning',
            title: '웹훅 전송',
            time: '3시간 전',
            count: '성공',
            icon: 'zap'
        },
        {
            id: 4,
            type: 'error',
            title: '캡차 검증 실패',
            time: '5시간 전',
            count: '-1',
            icon: 'x'
        }
    ],

    // 활동 추가
    addActivity: (activity) => {
        const newActivity = {
            id: Date.now(),
            ...activity
        };

        set(state => ({
            recentActivities: [newActivity, ...state.recentActivities.slice(0, 9)]
        }));
    },

    // API 키 추가
    addApiKey: (apiKeyData) => {
        const nowIso = new Date().toISOString();
        const newApiKey = {
            ...apiKeyData,
            // 기본값 보완만 하고, 서버 값은 덮어쓰지 않음
            status: apiKeyData.status || 'active',
            createdAt: apiKeyData.createdAt || nowIso.split('T')[0],
            lastUsed: apiKeyData.lastUsed || nowIso.replace('T', ' ').substring(0, 19),
        };

        set(state => ({
            apiKeys: [...state.apiKeys.filter(k => k.id !== newApiKey.id), newApiKey]
        }));
    },

    // API 키 삭제
    deleteApiKey: (apiKeyId) => {
        set(state => ({
            apiKeys: state.apiKeys.filter(key => key.id !== apiKeyId)
        }));
    },

    // API 키 상태 토글 (옵티미스틱 업데이트용)
    toggleApiKeyStatus: (apiKeyId, forceStatus) => {
        set(state => ({
            apiKeys: state.apiKeys.map(key => {
                if (key.id !== apiKeyId) return key;
                const next = forceStatus ?? (key.status === 'active' ? 'inactive' : 'active');
                return { ...key, status: next };
            })
        }));
    },

    // 데이터 클리어 액션
    clearApps: () => set({ apps: [] }),
    clearApiKeys: () => set({ apiKeys: [] }),

    // 사용량 업데이트
    updateUsage: (newUsage) => {
        set(state => ({
            currentPlan: {
                ...state.currentPlan,
                used: newUsage
            }
        }));
    }
})); 
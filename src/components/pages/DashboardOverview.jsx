import React, { useEffect, useMemo } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Chart from '../ui/Chart';
import LoadingSpinner from '../ui/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from '../../utils/chartImports';
import { useDashboardStore } from '../../stores/dashboardStore';
import greenCheckIcon from '@/assets/images/green_check_icon.png';
import blueCheckIcon from '@/assets/images/blue_check_icon.png';
import yellowAlertIcon from '@/assets/images/yellow_alert_icon.png';
import redFailIcon from '@/assets/images/red_fail_icon.png';

export default function DashboardOverview() {
    // Typography scale (dashboard-wide consistency)
    const T = {
        sectionTitle: 'text-xl font-semibold',
        cardTitle: 'text-base md:text-lg font-semibold',
        label: 'text-sm',
        caption: 'text-xs'
    };
    const {
        selectedPeriod,
        usageData: chartUsageData,
        stats,
        isLoading,
        setPeriod,
        currentPlan,
        planUsageData,
        calculateOverageCost,
        calculateTotalCost,
    } = useDashboardStore();

    // 최근 활동 데이터 (세션 로그 기반)
    const { sessionLogs } = useDashboardStore();
    const avgTokens = planUsageData.current?.requests?.avgTokensPerRequest || 20;
    const ICONS = {
        success: greenCheckIcon,
        info: blueCheckIcon,
        warning: yellowAlertIcon,
        error: redFailIcon,
    };
    const formatTimeAgo = (iso) => {
        if (!iso) return '-';
        const diff = Date.now() - new Date(iso).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return '방금 전';
        if (m < 60) return `${m}분 전`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}시간 전`;
        const d = Math.floor(h / 24);
        return `${d}일 전`;
    };
    const activity = useMemo(() => {
        const byResult = (r) => sessionLogs.filter(l => l.result === r);
        const successes = byResult('성공');
        const fails = sessionLogs.filter(l => ['실패', '타임아웃', '인증오류'].includes(l.result));
        const latest = (arr) => arr.length ? arr.reduce((a, b) => (new Date(a.callAt) > new Date(b.callAt) ? a : b)) : null;
        const now = Date.now();
        const succ24 = successes.filter(l => (now - new Date(l.callAt).getTime()) <= 24 * 60 * 60 * 1000);
        return {
            totalSuccess: successes.length,
            lastSuccess: latest(successes),
            succ24Count: succ24.length,
            lastSucc24: latest(succ24),
            totalFail: fails.length,
            lastFail: latest(fails),
        };
    }, [sessionLogs]);

    // 기간 선택 옵션
    const periodOptions = ['전체', '1일', '7일', '30일'];

    // 사용률/요금 계산
    const usagePercent = typeof planUsageData.current.tokens.percentage === 'number'
        ? planUsageData.current.tokens.percentage
        : Math.round((planUsageData.current.tokens.used / planUsageData.current.tokens.limit) * 100);
    const getUsageColorClass = (p) => {
        if (p < 30) return 'green';
        if (p < 60) return 'yellow';
        return 'red';
    };
    const usageColor = getUsageColorClass(usagePercent);

    // 디버그 로그: 기간/차트타입/데이터 포인트 수
    useEffect(() => {
        // 너무 긴 데이터 출력 방지 위해 앞/뒤 2개만 미리보기
        const preview = Array.isArray(chartUsageData)
            ? { head: chartUsageData.slice(0, 2), tail: chartUsageData.slice(-2) }
            : null;
        console.log('[Overview] selectedPeriod:', selectedPeriod);
        console.log('[Overview] chartUsageData length:', Array.isArray(chartUsageData) ? chartUsageData.length : 'N/A');
        console.log('[Overview] chartUsageData preview:', preview);
    }, [selectedPeriod, chartUsageData]);

    // 초과분 요금 계산 (통합 사용량 데이터 사용)
    const overageCost = calculateOverageCost(planUsageData.current.tokens.used, currentPlan.limit, currentPlan.overageRate);
    const totalCost = calculateTotalCost(planUsageData.current.tokens.used, currentPlan.limit, currentPlan.price, currentPlan.overageRate);

    // 기간 라벨 및 X축 라벨 포맷터
    const fmtMD = (d) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const now = new Date();
    const rangeLabel = (() => {
        if (selectedPeriod === '1일') {
            return `${fmtMD(now)} 00:00 ~ 현재`;
        }
        if (selectedPeriod === '7일') {
            const s = startOfDay(new Date(now));
            s.setDate(s.getDate() - 6);
            return `${fmtMD(s)} ~ ${fmtMD(now)}`;
        }
        if (selectedPeriod === '30일') {
            const s = startOfMonth(now);
            const e = endOfMonth(now);
            return `${fmtMD(s)} ~ ${fmtMD(e)}`;
        }
        const s = new Date(startOfMonth(now));
        s.setMonth(s.getMonth() - 11);
        return `${s.getFullYear()}년 ${s.getMonth() + 1}월 ~ ${now.getFullYear()}년 ${now.getMonth() + 1}월`;
    })();

    const xTickFormatter = (value) => {
        if (selectedPeriod === '1일') {
            // 'HH:00' → 'H시'
            const hh = parseInt(String(value).split(':')[0], 10);
            if (!Number.isNaN(hh)) return `${hh}시`;
            return value;
        }
        if (selectedPeriod === '7일' || selectedPeriod === '30일') {
            const m = value.match(/(\d+)월\s+(\d+)일/);
            if (m) return `${m[2]}일`;
            const parts = value.split('-');
            if (parts.length === 3) return `${parseInt(parts[2], 10)}일`;
            return value;
        }
        const m = value.match(/(\d+)년\s+(\d+)월/);
        if (m) return `${m[2]}월`;
        const parts = value.split('-');
        if (parts.length === 2) return `${parseInt(parts[1], 10)}월`;
        return value;
    };

    return (
        <DashboardLayout
            title="대시보드 개요"
            subtitle="현재 플랜과 사용량을 확인하세요"
        >
            <div className="space-y-6">
                {/* 현재 요금제 (타이틀 제거, 스타일 업그레이드) */}
                <div className="p-5 rounded-lg theme-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl md:text-3xl font-bold theme-text-primary">{currentPlan.name}</p>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${usageColor === 'green' ? 'theme-usage-green' : usageColor === 'yellow' ? 'theme-usage-yellow' : 'theme-usage-red'}`}>
                                    {usagePercent}%
                                </span>
                            </div>
                            <p className="text-base theme-text-secondary">{currentPlan.description}</p>
                            <p className="text-sm theme-text-secondary mt-1">{currentPlan.price}</p>
                            {overageCost > 0 && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-xs">
                                    <p className="text-red-700 dark:text-red-300 font-medium">초과분 요금: ₩{overageCost.toLocaleString()}</p>
                                    <p className="text-red-600 dark:text-red-400 text-[11px]">
                                        초과 사용량: {(planUsageData.current.tokens.used - planUsageData.current.tokens.limit).toLocaleString()} 토큰 × ₩{currentPlan.overageRate}/1,000토큰
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm theme-text-secondary">토큰 사용량</p>
                            <p className="text-3xl md:text-4xl font-bold theme-blue-accent">{planUsageData.current.tokens.used.toLocaleString()}</p>
                            <p className="text-sm theme-text-secondary">/ {planUsageData.current.tokens.limit.toLocaleString()} 토큰</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                API 호출: {planUsageData.current.requests.count.toLocaleString()}회 (평균 {planUsageData.current.requests.avgTokensPerRequest}토큰/회)
                            </p>
                            {overageCost > 0 && (
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">
                                    총 요금: ₩{totalCost.toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="mt-3 w-full theme-progress-bg rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-300 ${usageColor === 'green' ? 'theme-usage-green' : usageColor === 'yellow' ? 'theme-usage-yellow' : 'theme-usage-red'
                                }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                    </div>
                </div>

                {/* 전체 사용량 (경고 아이콘 제거, 중앙 정렬, 변화율 확대) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-lg theme-card text-center">
                        <h3 className={`${T.cardTitle} theme-text-primary mb-1`}>오늘 사용량</h3>
                        <p className="text-4xl md:text-5xl font-bold theme-blue-accent">{stats.today.value.toLocaleString()}</p>
                        <div className="mt-2 inline-flex items-center gap-2 justify-center">
                            {stats.today.change >= 0 ? (
                                <>
                                    <svg className="w-6 h-6 theme-success" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l8 16H4L12 4z" /></svg>
                                    <span className="text-lg md:text-xl font-bold theme-success">+{stats.today.change}%</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6 theme-error" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l-8-16h16l-8 16z" /></svg>
                                    <span className="text-lg md:text-xl font-bold theme-error">-{Math.abs(stats.today.change)}%</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="p-5 rounded-lg theme-card text-center">
                        <h3 className={`${T.cardTitle} theme-text-primary mb-1`}>이번 주</h3>
                        <p className="text-4xl md:text-5xl font-bold theme-blue-accent">{stats.week.value.toLocaleString()}</p>
                        <div className="mt-2 inline-flex items-center gap-2 justify-center">
                            {stats.week.change >= 0 ? (
                                <>
                                    <svg className="w-6 h-6 theme-success" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l8 16H4L12 4z" /></svg>
                                    <span className="text-lg md:text-xl font-bold theme-success">+{stats.week.change}%</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6 theme-error" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l-8-16h16l-8 16z" /></svg>
                                    <span className="text-lg md:text-xl font-bold theme-error">-{Math.abs(stats.week.change)}%</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="p-5 rounded-lg theme-card text-center">
                        <h3 className={`${T.cardTitle} theme-text-primary mb-1`}>이번 달</h3>
                        <p className="text-4xl md:text-5xl font-bold theme-blue-accent">{stats.month.value.toLocaleString()}</p>
                        <div className="mt-2 inline-flex items-center gap-2 justify-center">
                            {stats.month.change >= 0 ? (
                                <>
                                    <svg className="w-6 h-6 theme-success" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l8 16H4L12 4z" /></svg>
                                    <span className="text-lg md:text-xl font-bold theme-success">+{stats.month.change}%</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6 theme-error" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l-8-16h16l-8 16z" /></svg>
                                    <span className="text-lg md:text-xl font-bold theme-error">-{Math.abs(stats.month.change)}%</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 사용량 그래프 */}
                <div className="p-6 rounded-lg theme-card">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h3 className={`${T.sectionTitle} theme-text-primary`}>사용량 추이</h3>
                            {!isLoading && (
                                <span className={`${T.label} theme-text-secondary`}>{rangeLabel}</span>
                            )}
                            {/* 테스트용 데이터셋 드롭다운 */}
                            <DatasetSelector />
                        </div>
                        <div className="flex gap-2">
                            {periodOptions.map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setPeriod(period)}
                                    disabled={isLoading}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${selectedPeriod === period
                                        ? 'theme-button-primary'
                                        : 'theme-button-secondary'
                                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-80 min-w-0">
                        {isLoading ? (
                            <LoadingSpinner message="데이터를 불러오는 중..." className="h-full" />
                        ) : (
                            <Chart debugName="OverviewChart">
                                <LineChart data={chartUsageData} margin={{ top: 40, right: 12, bottom: 40, left: 12 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(156 163 175)" vertical={true} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="rgb(156 163 175)"
                                        fontSize={12}
                                        tick={{ fill: 'rgb(156 163 175)' }}
                                        interval={0}
                                        minTickGap={0}
                                        tickMargin={12}
                                        tickFormatter={xTickFormatter}
                                        allowDataOverflow={false}
                                    />
                                    <YAxis
                                        stroke="rgb(156 163 175)"
                                        fontSize={12}
                                        tick={{ fill: 'rgb(156 163 175)' }}
                                        allowDecimals={false}
                                        domain={[0, (dataMax) => (Math.max(1, dataMax))]}
                                        allowDataOverflow={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgb(31 41 55)',
                                            border: '1px solid rgb(75 85 99)',
                                            borderRadius: '8px',
                                            color: 'rgb(243 244 246)'
                                        }}
                                    />
                                    <Line type="monotone" dataKey="usage" stroke="rgb(59 130 246)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={false} />
                                </LineChart>
                            </Chart>
                        )}
                    </div>
                </div>

                {/* 최근 활동 */}
                <div className="p-6 rounded-lg theme-card">
                    <h3 className={`${T.sectionTitle} theme-text-primary mb-4`}>최근 활동</h3>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        <li className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={ICONS.success} alt="성공" className="w-7 h-7 rounded-full" />
                                <div>
                                    <p className="font-semibold theme-text-primary">API 호출 성공</p>
                                    <p className="text-sm theme-text-secondary">{formatTimeAgo(activity.lastSuccess?.callAt)}</p>
                                </div>
                            </div>
                            <div className="text-sm theme-text-secondary">총 {activity.totalSuccess.toLocaleString()}회 ({(activity.totalSuccess * avgTokens).toLocaleString()} 토큰)</div>
                        </li>
                        <li className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={ICONS.info} alt="검증성공" className="w-7 h-7 rounded-full" />
                                <div>
                                    <p className="font-semibold theme-text-primary">CAPTCHA 검증 성공</p>
                                    <p className="text-sm theme-text-secondary">{formatTimeAgo(activity.lastSucc24?.callAt)}</p>
                                </div>
                            </div>
                            <div className="text-sm theme-text-secondary">총 {activity.succ24Count.toLocaleString()}회 ({(activity.succ24Count * avgTokens).toLocaleString()} 토큰)</div>
                        </li>
                        <li className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={ICONS.error} alt="실패" className="w-7 h-7 rounded-full" />
                                <div>
                                    <p className="font-semibold theme-text-primary">CAPTCHA 검증 실패</p>
                                    <p className="text-sm theme-text-secondary">{formatTimeAgo(activity.lastFail?.callAt)}</p>
                                </div>
                            </div>
                            <div className="text-sm theme-text-secondary">총 {activity.totalFail.toLocaleString()}회 ({(activity.totalFail * avgTokens).toLocaleString()} 토큰)</div>
                        </li>
                        <li className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={ICONS.warning} alt="경고" className="w-7 h-7 rounded-full" />
                                <div>
                                    <p className="font-semibold theme-text-primary">토큰 사용량 경고</p>
                                    <p className="text-sm theme-text-secondary">{formatTimeAgo(new Date().toISOString())}</p>
                                </div>
                            </div>
                            <div className="text-sm theme-text-secondary">{(planUsageData.current?.tokens?.percentage || 0)}% 도달</div>
                        </li>
                    </ul>
                </div>
            </div>
        </DashboardLayout>
    );
}

function DatasetSelector() {
    const { datasetScenario, setDatasetScenario } = useDashboardStore();
    return (
        <select
            value={datasetScenario}
            onChange={(e) => {
                console.log('[Overview] datasetScenario ->', e.target.value);
                setDatasetScenario(e.target.value);
            }}
            className="ml-2 px-2 py-1 theme-input rounded text-sm"
            title="테스트 데이터셋 선택"
        >
            <option value="low">Low (~30%)</option>
            <option value="mid">Mid (30~60%)</option>
            <option value="high">High (60%+)</option>
        </select>
    );
}

// ChartTypeSelector 및 ChartBody 롤백 (차트 타입 고정: Line)
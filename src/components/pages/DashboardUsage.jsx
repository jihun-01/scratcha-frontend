import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Chart from '../ui/Chart';
import LoadingSpinner from '../ui/LoadingSpinner';
import Table, { TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/Table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from '../../utils/chartImports';
import { useDashboardStore } from '../../stores/dashboardStore';

export default function DashboardUsage() {
    // Typography scale for consistency with Overview
    const T = {
        sectionTitle: 'text-lg font-semibold',
        label: 'text-sm'
    };
    const {
        apps,
        apiKeys,
        usageLogs,
        usageData,
        updateUsageLogs,
        setPeriod: setGlobalPeriod,
    } = useDashboardStore();

    const [selectedAppId, setSelectedAppId] = useState('all');
    const [selectedApiKeyId, setSelectedApiKeyId] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState('전체');
    const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'table'
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // 선택된 APP과 API 키
    const selectedApp = selectedAppId === 'all' ? null : apps.find(app => app.id === selectedAppId);
    const selectedApiKey = selectedApiKeyId === 'all' ? null : apiKeys.find(key => key.id === selectedApiKeyId);

    // 선택된 APP의 API 키들 (전체 선택 시 모든 API 키)
    const appApiKeys = selectedAppId === 'all' ? apiKeys : apiKeys.filter(key => key.appId === selectedAppId);

    // 기간 옵션
    const periodOptions = ['전체', '1일', '7일', '30일'];

    // 그래프 데이터는 전역 스토어 usageData(로그 기반 버킷팅) 사용

    // 전역 스토어 usageData 사용으로 지역 상태 불필요

    // 필터 변경 시 데이터 업데이트
    useEffect(() => {
        setIsLoading(true);

        // 스토어 기간 동기화 후 로그 업데이트 (그래프/카드 모두 로그 기반으로 재계산)
        setGlobalPeriod(selectedPeriod);
        updateUsageLogs(selectedAppId, selectedApiKeyId, selectedPeriod);

        // 로딩 시뮬레이션
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }, [selectedAppId, selectedApiKeyId, selectedPeriod, updateUsageLogs, setGlobalPeriod]);

    // 페이징 계산
    const totalPages = Math.ceil(usageLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLogs = usageLogs.slice(startIndex, endIndex);

    // 페이지 변경 시 첫 페이지로 이동
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedAppId, selectedApiKeyId, selectedPeriod]);

    // 결과 상태별 색상
    const getResultColor = (result) => {
        switch (result) {
            case '성공': return 'text-green-600 dark:text-green-400';
            case '실패': return 'text-red-600 dark:text-red-400';
            case '타임아웃': return 'text-yellow-600 dark:text-yellow-400';
            case '인증오류': return 'text-orange-600 dark:text-orange-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    // API 키 표시 (마스킹)
    const maskApiKey = (key) => {
        if (!key) return '';
        return key.substring(0, 8) + '...' + key.substring(key.length - 4);
    };

    // 기간별 X축 라벨 포맷터
    const xTickFormatter = (value) => {
        if (selectedPeriod === '1일') {
            const hh = parseInt(String(value).split(':')[0], 10);
            return Number.isNaN(hh) ? value : `${hh}시`;
        }
        if (selectedPeriod === '7일' || selectedPeriod === '30일') {
            const m = String(value).match(/(\d+)월\s+(\d+)일/);
            if (m) return `${m[2]}일`;
            const parts = String(value).split('-');
            if (parts.length === 3) return `${parseInt(parts[2], 10)}일`;
            return value;
        }
        // 전체: 월만 표기
        const m = String(value).match(/(\d+)년\s+(\d+)월/);
        if (m) return `${m[2]}월`;
        const parts = String(value).split('-');
        if (parts.length === 2) return `${parseInt(parts[1], 10)}월`;
        return value;
    };

    // 라벨은 회전하지 않음

    return (
        <DashboardLayout
            title="사용량"
            subtitle="APP 및 API 키별 사용량을 확인하세요"
        >
            <div className="space-y-6">
                {/* 필터 섹션 */}
                <div className="p-6 rounded-lg theme-card">
                    <h3 className={`${T.sectionTitle} theme-text-primary mb-4`}>필터 설정</h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* APP 선택 */}
                        <div>
                            <label className={`${T.label} font-medium theme-text-primary mb-2`}>
                                APP 선택
                            </label>
                            <select
                                value={selectedAppId}
                                onChange={(e) => setSelectedAppId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                className="w-full px-3 py-2 theme-input focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            >
                                <option value="all">전체</option>
                                {apps.map((app) => (
                                    <option key={`${app.id}-${app.name}`} value={app.id}>
                                        {app.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* API 키 선택 */}
                        <div>
                            <label className={`${T.label} font-medium theme-text-primary mb-2`}>
                                API 키 선택
                            </label>
                            <select
                                value={selectedApiKeyId}
                                onChange={(e) => setSelectedApiKeyId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                className="w-full px-3 py-2 theme-input focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            >
                                <option value="all">전체</option>
                                {appApiKeys.map((key) => (
                                    <option key={`${key.id}-${key.key}`} value={key.id}>
                                        {key.name} ({key.key})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 기간 선택 */}
                        <div>
                            <label className={`${T.label} font-medium theme-text-primary mb-2`}>
                                기간 선택
                            </label>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="w-full px-3 py-2 theme-input focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            >
                                {periodOptions.map((period) => (
                                    <option key={period} value={period}>
                                        {period}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 뷰 모드 선택 */}
                        <div>
                            <label className={`${T.label} font-medium theme-text-primary mb-2`}>
                                표시 모드
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('graph')}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'graph'
                                        ? 'theme-button-primary'
                                        : 'theme-button-secondary'
                                        }`}
                                >
                                    그래프
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'table'
                                        ? 'theme-button-primary'
                                        : 'theme-button-secondary'
                                        }`}
                                >
                                    로그
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 선택된 정보 표시 */}
                    <div className="mt-4 p-4 theme-layout-secondary rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-medium theme-text-primary">선택된 APP:</span>
                                <span className="ml-2 theme-text-secondary">{selectedAppId === 'all' ? '전체' : selectedApp?.name}</span>
                            </div>
                            <div>
                                <span className="font-medium theme-text-primary">선택된 API 키:</span>
                                <span className="ml-2 theme-text-secondary">{selectedApiKeyId === 'all' ? '전체' : selectedApiKey?.name}</span>
                            </div>
                            <div>
                                <span className="font-medium theme-text-primary">기간:</span>
                                <span className="ml-2 theme-text-secondary">{selectedPeriod}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 데이터 표시 섹션 */}
                <div className="p-6 rounded-lg theme-card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className={`${T.sectionTitle} theme-text-primary`}>사용량 데이터</h3>
                        {isLoading && (
                            <div className="flex items-center gap-2">
                                <LoadingSpinner />
                                <span className="text-sm theme-text-secondary">데이터를 불러오는 중...</span>
                            </div>
                        )}
                    </div>

                    {viewMode === 'graph' ? (
                        /* 그래프 뷰 */
                        <div className="h-80">
                            {isLoading ? (
                                <LoadingSpinner message="그래프를 불러오는 중..." className="h-full" />
                            ) : (
                                <Chart>
                                    <LineChart data={usageData} margin={{ top: 40, right: 12, bottom: 40, left: 12 }}>
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
                                        />
                                        <YAxis
                                            stroke="rgb(156 163 175)"
                                            fontSize={12}
                                            tick={{ fill: 'rgb(156 163 175)' }}
                                            allowDecimals={false}
                                            domain={[0, 'auto']}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgb(31 41 55)',
                                                border: '1px solid rgb(75 85 99)',
                                                borderRadius: '8px',
                                                color: 'rgb(243 244 246)'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="usage"
                                            stroke="rgb(59 130 246)"
                                            strokeWidth={3}
                                            dot={{ fill: 'rgb(59 130 246)', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, stroke: 'rgb(59 130 246)', strokeWidth: 2 }}
                                            connectNulls={false}
                                        />
                                    </LineChart>
                                </Chart>
                            )}
                        </div>
                    ) : (
                        /* 테이블 뷰 */
                        <div>
                            <div className="overflow-x-auto">
                                {isLoading ? (
                                    <LoadingSpinner message="테이블을 불러오는 중..." className="h-64" />
                                ) : (
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableHeader className="text-left py-3 px-4 font-medium theme-text-primary">번호</TableHeader>
                                                <TableHeader className="text-left py-3 px-4 font-medium theme-text-primary">APP 이름</TableHeader>
                                                <TableHeader className="text-left py-3 px-4 font-medium theme-text-primary">API 키</TableHeader>
                                                <TableHeader className="text-left py-3 px-4 font-medium theme-text-primary">호출 시간</TableHeader>
                                                <TableHeader className="text-left py-3 px-4 font-medium theme-text-primary">호출 결과</TableHeader>
                                                <TableHeader className="text-left py-3 px-4 font-medium theme-text-primary">응답시간</TableHeader>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {currentLogs.map((log) => (
                                                <TableRow key={`${log.id}-${log.callAt}-${log.apiKey}`} className="theme-table-row hover:theme-hover-bg">
                                                    <TableCell className="text-left py-3 px-4 theme-text-primary">{log.id}</TableCell>
                                                    <TableCell className="text-left py-3 px-4 theme-text-primary">{log.appName}</TableCell>
                                                    <TableCell className="text-left py-3 px-4 theme-text-primary font-mono text-sm">
                                                        {maskApiKey(log.apiKey)}
                                                    </TableCell>
                                                    <TableCell className="text-left py-3 px-4 theme-text-primary text-sm">{log.callTime}</TableCell>
                                                    <TableCell className={`text-left py-3 px-4 font-medium ${getResultColor(log.result)}`}>
                                                        {log.result}
                                                    </TableCell>
                                                    <TableCell className="text-left py-3 px-4 theme-text-primary">{log.responseTime}ms</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>

                            {/* 페이징 네비게이션 */}
                            {viewMode === 'table' && !isLoading && totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm theme-text-secondary">
                                        총 {usageLogs.length}개 항목 중 {startIndex + 1}-{Math.min(endIndex, usageLogs.length)}개 표시
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === 1
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'theme-text-primary hover:theme-hover-bg'
                                                }`}
                                        >
                                            이전
                                        </button>

                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === pageNum
                                                        ? 'theme-button-primary'
                                                        : 'theme-text-primary hover:theme-hover-bg'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === totalPages
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'theme-text-primary hover:theme-hover-bg'
                                                }`}
                                        >
                                            다음
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
} 
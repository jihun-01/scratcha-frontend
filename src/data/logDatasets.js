// 사전 생성된 로그 데이터셋 (저장형)
// - 생성 시점에 고정된 데이터를 사용하여, 런타임 무작위 생성 없이 일관된 결과 제공

import { DUMMY_APPS, DUMMY_API_KEYS } from './dashboardDummy';

// 간단한 시간 포맷 유틸
const toISO = (d) => new Date(d).toISOString();
const toKR = (d) => new Date(d).toLocaleString('ko-KR');

// 고정 패턴으로 균등 분포 로그 생성
function buildLogs(totalCount, daysRange = 365) {
    const logs = [];
    const now = new Date();
    const results = ['성공', '성공', '성공', '실패', '타임아웃', '인증오류'];

    for (let i = 0; i < totalCount; i++) {
        const app = DUMMY_APPS[i % DUMMY_APPS.length];
        const appKeys = DUMMY_API_KEYS.filter((k) => k.appId === app.id);
        const key = appKeys.length ? appKeys[i % appKeys.length] : DUMMY_API_KEYS[0];

        // 균등 분포: 최근 daysRange일 구간에 고르게 분포
        const minutesStep = Math.floor((daysRange * 24 * 60) / Math.max(1, totalCount));
        const minutesAgo = minutesStep * i;
        const when = new Date(now.getTime() - minutesAgo * 60000);

        const result = results[i % results.length];
        let responseTime = 200;
        if (result === '실패') responseTime = 1500;
        if (result === '타임아웃') responseTime = 6000;
        if (result === '인증오류') responseTime = 120;

        logs.push({
            id: i + 1,
            appId: app.id,
            appName: app.name,
            apiKeyId: key.id,
            apiKey: key.key,
            callTime: toKR(when),
            callAt: toISO(when),
            result,
            responseTime,
        });
    }

    // 최신순 정렬
    return logs.sort((a, b) => new Date(b.callAt) - new Date(a.callAt));
}

// 기준: 평균 20 토큰/호출, Starter 한도 50,000 토큰을 기본 가정
const AVG_TOKENS = 20;
const STARTER_LIMIT = 50000;

function logsForPercent(limit, percent, avgTokens = AVG_TOKENS) {
    const usedTokens = Math.round((limit * percent) / 100);
    const totalCalls = Math.max(100, Math.min(10000, Math.floor(usedTokens / avgTokens))); // 100~10000 범위 제한
    return buildLogs(totalCalls, 365);
}

// 30% 미만, 30~60%, 60% 이상에 대응하는 3개 시나리오
const LOW_PERCENT = 25;  // ~30% 미만
const MID_PERCENT = 45;  // ~30~60%
const HIGH_PERCENT = 75; // ~60% 이상

export const LOG_DATASETS = {
    low: logsForPercent(STARTER_LIMIT, LOW_PERCENT),
    mid: logsForPercent(STARTER_LIMIT, MID_PERCENT),
    high: logsForPercent(STARTER_LIMIT, HIGH_PERCENT),
};



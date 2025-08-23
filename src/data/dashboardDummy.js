// 대시보드 공용 더미 데이터/유틸

// 앱/키 더미
export const DUMMY_APPS = [
    { id: 1, name: 'My Website', description: '메인 웹사이트 캡차 서비스', status: 'active' },
    { id: 2, name: 'Mobile App', description: '모바일 애플리케이션 캡차', status: 'active' },
    { id: 3, name: 'Admin Panel', description: '관리자 패널 보안 캡차', status: 'inactive' },
    { id: 4, name: 'API Gateway', description: 'API 게이트웨이 캡차 서비스', status: 'active' },
];

export const DUMMY_API_KEYS = [
    { id: 1, appId: 1, name: 'Production Key', key: 'sk-prod-1234567890abcdef', status: 'active', lastUsed: '2024-01-25T10:30:00.000Z' },
    { id: 2, appId: 1, name: 'Development Key', key: 'sk-dev-abcdef1234567890', status: 'active', lastUsed: '2024-01-25T09:15:00.000Z' },
    { id: 3, appId: 2, name: 'Mobile App Key', key: 'sk-mobile-9876543210fedcba', status: 'active', lastUsed: '2024-01-25T11:45:00.000Z' },
    { id: 4, appId: 3, name: 'Admin Panel Key', key: 'sk-admin-fedcba0987654321', status: 'inactive', lastUsed: '2024-01-20T15:20:00.000Z' },
    { id: 5, appId: 4, name: 'Gateway Key', key: 'sk-gateway-abcdef1234567890', status: 'active', lastUsed: '2024-01-25T12:00:00.000Z' },
];

// 차트용 더미 생성
export const generateUsageData = (period) => {
    const data = [];
    const now = new Date();
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    switch (period) {
        case '1일': {
            for (let i = 23; i >= 0; i--) {
                const time = new Date(now);
                time.setHours(now.getHours() - i);
                data.push({ date: `${time.getHours()}:00`, usage: rand(50, 250) });
            }
            break;
        }
        case '7일': {
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                data.push({ date: `${date.getMonth() + 1}월 ${date.getDate()}일`, usage: rand(500, 1500) });
            }
            break;
        }
        case '30일': {
            for (let i = 29; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                data.push({ date: `${date.getMonth() + 1}월 ${date.getDate()}일`, usage: rand(800, 2800) });
            }
            break;
        }
        default: {
            for (let i = 13; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                data.push({ date: `${date.getMonth() + 1}월 ${date.getDate()}일`, usage: rand(600, 2100) });
            }
        }
    }

    return data;
};

// 카드 통계 더미
export const generateStats = (period) => {
    const base = {
        전체: { today: 2450, week: 15200, month: 24500 },
        '1일': { today: 2100, week: 15200, month: 24500 },
        '7일': { today: 1800, week: 15200, month: 24500 },
        '30일': { today: 2300, week: 16800, month: 24500 },
    };
    const pick = base[period] || base['전체'];
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    return {
        today: { value: pick.today, change: rand(5, 20) },
        week: { value: pick.week, change: rand(3, 15) },
        month: { value: pick.month, change: rand(10, 25) },
    };
};

// 공용 유틸
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 대용량 로그 풀(모듈 로드 시 1회 생성)
const buildLogPool = (poolSize = 20000) => {
    const pool = [];
    const now = new Date();
    for (let i = 0; i < poolSize; i++) {
        const app = DUMMY_APPS[randInt(0, DUMMY_APPS.length - 1)];
        const keys = DUMMY_API_KEYS.filter(k => k.appId === app.id);
        const key = keys.length ? keys[randInt(0, keys.length - 1)] : DUMMY_API_KEYS[0];
        const minutesAgo = randInt(0, 365 * 24 * 60);
        const when = new Date(now.getTime() - minutesAgo * 60000);
        const results = ['성공', '성공', '성공', '성공', '실패', '타임아웃', '인증오류'];
        const result = results[randInt(0, results.length - 1)];
        let responseTime = randInt(100, 400);
        if (result === '실패') responseTime = randInt(1000, 3000);
        if (result === '타임아웃') responseTime = randInt(5000, 8000);
        if (result === '인증오류') responseTime = randInt(50, 250);

        pool.push({
            id: i + 1,
            appId: app.id,
            appName: app.name,
            apiKeyId: key.id,
            apiKey: key.key,
            callTime: when.toLocaleString('ko-KR'),
            callAt: when.toISOString(),
            result,
            responseTime,
        });
    }
    // 최신순 정렬 유지
    return pool.sort((a, b) => new Date(b.callAt) - new Date(a.callAt));
};

const LOG_POOL = buildLogPool(25000);

// 로그 더미(풀에서 꺼내오기 + 랜덤 갯수 선택)
export const generateUsageLogs = (appId, apiKeyId, period) => {
    const now = new Date();
    const daysBy = { '1일': 1, '7일': 7, '30일': 30, 전체: 365 };
    const daysRange = daysBy[period] || daysBy['전체'];

    // 기간 필터
    const minTime = new Date(now.getTime() - daysRange * 24 * 60 * 60 * 1000);
    let filtered = LOG_POOL.filter(l => new Date(l.callAt) >= minTime);

    // APP 필터
    if (appId !== 'all') filtered = filtered.filter(l => l.appId === appId);
    // API 키 필터
    if (apiKeyId !== 'all') filtered = filtered.filter(l => l.apiKeyId === apiKeyId);

    // 랜덤 샘플 사이즈(100~10000)
    const target = Math.min(filtered.length, randInt(100, 10000));
    const logs = filtered.slice(0, target);

    return logs.sort((a, b) => new Date(b.callAt) - new Date(a.callAt));
};

// 현재 월(MTD) 로그 조회: 이번달 1일 00:00 ~ 지금까지
export const getMonthToDateLogs = (appId = 'all', apiKeyId = 'all') => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    let filtered = LOG_POOL.filter(l => new Date(l.callAt) >= monthStart);

    if (appId !== 'all') filtered = filtered.filter(l => l.appId === appId);
    if (apiKeyId !== 'all') filtered = filtered.filter(l => l.apiKeyId === apiKeyId);

    return filtered.sort((a, b) => new Date(b.callAt) - new Date(a.callAt));
};

// 월별 임계값 시나리오 → 퍼센트 매핑
export const MONTH_SCENARIO_PERCENT = {
    low: 25,
    mid: 45,
    high: 75,
};

export const calcMonthTargetCalls = (limit, avgTokens, scenario = 'mid') => {
    const percent = MONTH_SCENARIO_PERCENT[scenario] ?? 45;
    const calls = Math.floor((limit * percent) / 100 / Math.max(1, avgTokens));
    return Math.max(50, calls); // 최소 50콜 보장
};

// 이번 달 내에서 count 만큼의 로그를 합성 생성
export const synthesizeMonthToDateLogs = (count, appId = 'all', apiKeyId = 'all') => {
    const logs = [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const minutesSpan = Math.max(1, Math.floor((now - monthStart) / 60000));
    for (let i = 0; i < count; i++) {
        const app = appId === 'all' ? DUMMY_APPS[i % DUMMY_APPS.length] : DUMMY_APPS.find(a => a.id === appId) || DUMMY_APPS[0];
        const keys = DUMMY_API_KEYS.filter(k => (apiKeyId === 'all' ? k.appId === app.id : (k.appId === app.id && k.id === apiKeyId)));
        const key = keys.length ? keys[i % keys.length] : DUMMY_API_KEYS[0];
        const minutesAgo = Math.floor((i * minutesSpan) / Math.max(1, count));
        const when = new Date(now.getTime() - minutesAgo * 60000);
        logs.push({
            id: i + 1,
            appId: app.id,
            appName: app.name,
            apiKeyId: key.id,
            apiKey: key.key,
            callTime: when.toLocaleString('ko-KR'),
            callAt: when.toISOString(),
            result: '성공',
            responseTime: 200,
        });
    }
    return logs.sort((a, b) => new Date(b.callAt) - new Date(a.callAt));
};

// 세션 고정 로그 대량 조회(무작위 샘플 없음): 최근 days일 범위에서 필터링만 수행
export const getStableSessionLogs = (appId = 'all', apiKeyId = 'all', days = 365) => {
    const now = new Date();
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    let filtered = LOG_POOL.filter(l => new Date(l.callAt) >= from && new Date(l.callAt) <= now);
    if (appId !== 'all') filtered = filtered.filter(l => l.appId === appId);
    if (apiKeyId !== 'all') filtered = filtered.filter(l => l.apiKeyId === apiKeyId);
    return filtered.sort((a, b) => new Date(b.callAt) - new Date(a.callAt));
};

// 플랜/사용량 더미
export const DEFAULT_PLAN = {
    name: 'Starter',
    limit: 50000,
    used: 24500,
    price: '₩29,900',
    description: '월 50,000 토큰 제공',
    overageRate: 2.0,
    features: ['기본 API & 통계', '광고 제거', '이메일 지원'],
};

export const PLAN_USAGE_DATA = {
    current: {
        tokens: { used: 24500, limit: 50000, percentage: Math.round((24500 / 50000) * 100) },
        requests: { count: 1225, avgTokensPerRequest: 20 },
    },
    lastMonth: {
        tokens: { used: 18900, limit: 50000 },
        requests: { count: 945, avgTokensPerRequest: 20 },
        billing: { overageRate: 2.0, basePrice: 29900, overageCost: 0, totalCost: 29900 },
    },
};

// 최근 활동 더미
export const getRecentActivities = () => [
    { id: 1, type: 'success', title: '캡차 검증 성공', time: '2분 전', count: '+1', icon: 'check' },
    { id: 2, type: 'info', title: 'API 키 생성', time: '1시간 전', count: '새 키', icon: 'settings' },
    { id: 3, type: 'warning', title: '웹훅 전송', time: '3시간 전', count: '성공', icon: 'zap' },
    { id: 4, type: 'error', title: '캡차 검증 실패', time: '5시간 전', count: '-1', icon: 'x' },
];

// 로그 기반 차트 시리즈 생성 (기간별 버킷팅)
export const bucketUsageSeries = (period, logs, anchorNow) => {
    const counts = new Map();
    const pad2 = (n) => String(n).padStart(2, '0');
    const now = anchorNow ? new Date(anchorNow) : new Date();

    // 범위 계산
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);

    let rangeStart;
    let rangeEnd = now; // 기본적으로 지금까지

    if (period === '1일') {
        rangeStart = startOfDay(now); // 오늘 00:00 ~ 지금
    } else if (period === '7일') {
        const d = new Date(startOfDay(now));
        d.setDate(d.getDate() - 6); // 7일 전 00:00 ~ 지금
        rangeStart = d;
    } else if (period === '30일') {
        rangeStart = startOfMonth(now); // 이번달 1일 00:00 ~ 지금
        // rangeEnd = endOfMonth(now); // 라벨은 월말까지, 데이터는 지금까지 → 0으로 채워짐
    } else {
        // 전체: 1년 전 월의 1일 00:00 ~ 이번달까지
        const d = new Date(startOfMonth(now));
        d.setMonth(d.getMonth() - 11); // 최근 12개월 포함
        rangeStart = d;
        // rangeEnd = endOfMonth(now);
    }

    // 카운트 적재 (범위 내 데이터만)
    for (const log of logs) {
        const d = new Date(log.callAt || log.callTime);
        if (Number.isNaN(d.getTime())) continue;
        if (d < rangeStart || d > rangeEnd) continue;

        let key;
        if (period === '1일') {
            key = `${pad2(d.getHours())}:00`;
        } else if (period === '7일' || period === '30일') {
            key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        } else {
            key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`; // 전체: 월
        }

        counts.set(key, (counts.get(key) || 0) + 1);
    }

    // 키 시퀀스 생성 (빈 구간 0 채우기)
    const keys = [];
    if (period === '1일') {
        // 현재 시간까지만 라벨 생성 (미래시간 라벨 미생성) → null 핸들링 불필요
        const endHour = now.getHours();
        for (let h = 0; h <= endHour; h++) keys.push(`${pad2(h)}:00`);
    } else if (period === '7일') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(startOfDay(now));
            d.setDate(d.getDate() - i);
            keys.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
        }
    } else if (period === '30일') {
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        const todayDate = now.getDate();
        for (let day = 1; day <= todayDate; day++) {
            const d = new Date(first.getFullYear(), first.getMonth(), day);
            keys.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
        }
    } else {
        // 전체: 최근 12개월 (현재 포함)
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            keys.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}`);
        }
    }

    // 라벨 변환
    const toLabel = (key) => {
        if (period === '1일') return key; // HH:00
        if (period === '7일' || period === '30일') {
            const [, m, d] = key.split('-').map(Number);
            return `${m}월 ${d}일`;
        }
        const [y, m] = key.split('-').map(Number);
        return `${y}년 ${m}월`;
    };

    // 미래 구간은 표시하되 값은 null로 처리하여 점/선이 그려지지 않도록 함
    const isFutureKey = (key) => {
        if (period === '1일') {
            const hour = parseInt(String(key).split(':')[0], 10);
            return Number.isFinite(hour) && hour > now.getHours();
        }
        if (period === '30일') {
            const parts = String(key).split('-').map(Number);
            if (parts.length !== 3) return false;
            const [, , day] = parts;
            const today = now.getDate();
            return day > today;
        }
        return false; // 7일/전체는 미래 키 생성 안 함
    };

    return keys.map((key) => ({
        date: toLabel(key),
        usage: isFutureKey(key) ? null : (counts.get(key) || 0),
    }));
};

// 로그 기반 카드 통계 생성 (오늘/7일/30일)
export const computeStatsFromLogs = (logs, anchorNow) => {
    const now = anchorNow ? new Date(anchorNow) : new Date();
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);

    const todayStart = startOfDay(now);
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayEnd = new Date(todayStart.getTime() - 1);

    const currentWeekStart = new Date(startOfDay(now));
    currentWeekStart.setDate(currentWeekStart.getDate() - 6); // 오늘 포함 7일간
    const prevWeekEnd = new Date(currentWeekStart.getTime() - 1);
    const prevWeekStart = new Date(prevWeekEnd.getTime() - 6 * 24 * 60 * 60 * 1000);

    const currentMonthStart = startOfMonth(now);
    const prevMonthEnd = new Date(currentMonthStart.getTime() - 1);
    const prevMonthStart = startOfMonth(prevMonthEnd);

    const toDate = (log) => {
        const d = new Date(log.callAt || log.callTime);
        return Number.isNaN(d.getTime()) ? null : d;
    };
    const dates = logs.map(toDate).filter(Boolean);

    const between = (s, e) => (d) => d >= s && d <= e;

    // 현재 구간 값
    const todayValue = dates.filter(between(todayStart, now)).length;
    const weekValue = dates.filter(between(currentWeekStart, now)).length;
    const monthValue = dates.filter(between(currentMonthStart, now)).length;

    // 이전 구간 값
    const yesterdayValue = dates.filter(between(yesterdayStart, yesterdayEnd)).length;
    const prevWeekValue = dates.filter(between(prevWeekStart, prevWeekEnd)).length;
    const prevMonthValue = dates.filter(between(prevMonthStart, prevMonthEnd)).length;

    const pct = (cur, prev) => {
        if (prev === 0) return cur > 0 ? 100 : 0;
        return Math.round(((cur - prev) / prev) * 100);
    };

    return {
        today: { value: todayValue, change: pct(todayValue, yesterdayValue) },
        week: { value: weekValue, change: pct(weekValue, prevWeekValue) },
        month: { value: monthValue, change: pct(monthValue, prevMonthValue) },
    };
};



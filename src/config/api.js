import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// 설정 캐시
let configCache = null;

// 쿠버네티스 환경에서 동적 API URL 설정
const getApiBaseUrl = async () => {
    console.log('🔧 getApiBaseUrl 함수 실행');

    // 1. 설정 API에서 런타임 설정 가져오기 (캐시 활용)
    if (!configCache) {
        try {
            const response = await fetch('/api/config');
            if (response.ok) {
                const config = await response.json();
                configCache = config;
                console.log('✅ 설정 API에서 가져온 값:', config.apiUrl);

                // 쿠버네티스 내부 서비스인지 확인
                if (config.apiUrl.includes('svc.cluster.local')) {
                    console.log(' 쿠버네티스 내부 서비스 감지, nginx 프록시 사용');
                    return '/api'; // nginx 프록시 사용
                }

                // /api 경로가 없으면 자동으로 추가
                const apiUrl = config.apiUrl.endsWith('/api') ? config.apiUrl : `${config.apiUrl}/api`;
                return apiUrl;
            }
        } catch (error) {
            console.warn('⚠️ 설정 API 호출 실패, 기본값 사용:', error);
        }
    } else {
        console.log('✅ 캐시된 설정 사용:', configCache.apiUrl);

        // 쿠버네티스 내부 서비스인지 확인
        if (configCache.apiUrl.includes('svc.cluster.local')) {
            console.log(' 쿠버네티스 내부 서비스 감지, nginx 프록시 사용');
            return '/api'; // nginx 프록시 사용
        }

        // /api 경로가 없으면 자동으로 추가
        const apiUrl = configCache.apiUrl.endsWith('/api') ? configCache.apiUrl : `${configCache.apiUrl}/api`;
        return apiUrl;
    }

    // 2. 빌드 시점 환경변수 (개발/빌드 시 사용)
    if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined') {
        console.log('✅ 빌드 시점 환경변수 사용:', import.meta.env.VITE_API_URL);

        // 쿠버네티스 내부 서비스인지 확인
        if (import.meta.env.VITE_API_URL.includes('svc.cluster.local')) {
            console.log(' 쿠버네티스 내부 서비스 감지, nginx 프록시 사용');
            return '/api'; // nginx 프록시 사용
        }

        // /api 경로가 없으면 자동으로 추가
        const apiUrl = import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`;
        return apiUrl;
    }

    // 3. 개발 환경에서 동적 감지
    if (import.meta.env.DEV) {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = '8001';
        const url = `${protocol}//${hostname}:${port}/api`;
        console.log('⚠️ 동적 감지 사용:', url);
        return url;
    }

    // 4. 프로덕션에서 상대 경로 사용 (nginx 프록시 활용)
    console.log('⚠️ 상대 경로 사용: /api');
    return '/api';
};

// 비동기 API 클라이언트 생성
const createApiClient = async () => {
    const baseURL = await getApiBaseUrl();

    const apiClient = axios.create({
        baseURL,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // 요청 인터셉터 (토큰 추가)
    apiClient.interceptors.request.use(
        (config) => {
            // Zustand store에서 토큰 가져오기
            const token = useAuthStore.getState().token;
            console.log('🔍 API 요청 토큰 확인:', {
                hasToken: !!token,
                tokenType: token ? (token.startsWith('Bearer ') ? 'Bearer' : 'Raw') : 'None',
                tokenPreview: token ? token.substring(0, 50) + '...' : 'None',
                url: config.url,
                method: config.method
            });

            if (token) {
                // 토큰이 이미 "Bearer " 형식인지 확인 (HTTP 표준)
                let authHeader;
                if (token.startsWith('Bearer ')) {
                    authHeader = token;
                } else {
                    authHeader = `Bearer ${token}`;
                }

                config.headers.Authorization = authHeader;
                console.log('✅ Authorization 헤더 설정:', authHeader.substring(0, 50) + '...');
            } else {
                console.log('⚠️ 토큰이 없어 Authorization 헤더를 설정하지 않음');
            }

            console.log('📤 API 요청 전송:', {
                url: config.url,
                fullUrl: `${config.baseURL}${config.url}`,
                method: config.method
            });

            return config;
        },
        (error) => {
            console.error('❌ API 요청 인터셉터 오류:', error);
            return Promise.reject(error);
        }
    );

    // 응답 인터셉터 (에러 처리)
    apiClient.interceptors.response.use(
        (response) => {
            console.log('✅ API 응답 성공:', {
                url: response.config.url,
                status: response.status
            });
            return response;
        },
        (error) => {
            console.error('❌ API 응답 오류:', {
                url: error.config?.url,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
            return Promise.reject(error);
        }
    );

    return apiClient;
};

// 싱글톤 인스턴스
let apiClientInstance = null;

export const getApiClient = async () => {
    if (!apiClientInstance) {
        apiClientInstance = await createApiClient();
    }
    return apiClientInstance;
};

// 기본 export (비동기 초기화)
export default await getApiClient(); 
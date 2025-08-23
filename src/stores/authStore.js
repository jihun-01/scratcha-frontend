import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

// JWT 토큰 유틸리티 함수들
const tokenUtils = {
    // JWT 토큰에서 payload 추출
    decodeToken: (token) => {
        try {
            const cleanToken = token.replace('Bearer ', '');
            const payload = cleanToken.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));
            return decodedPayload;
        } catch (error) {
            console.error('토큰 디코딩 실패:', error);
            return null;
        }
    },

    // 토큰 만료 시간 확인
    getTokenExpiry: (token) => {
        const payload = tokenUtils.decodeToken(token);
        if (!payload || !payload.exp) return null;
        return new Date(payload.exp * 1000);
    },

    // 토큰 발급 시간 확인
    getTokenIssuedAt: (token) => {
        const payload = tokenUtils.decodeToken(token);
        if (!payload || !payload.iat) return null;
        return new Date(payload.iat * 1000);
    },

    // 토큰 만료까지 남은 시간 (분)
    getTimeUntilExpiry: (token) => {
        const expiryDate = tokenUtils.getTokenExpiry(token);
        if (!expiryDate) return null;

        const now = new Date();
        const diffInMinutes = Math.floor((expiryDate - now) / (1000 * 60));

        return diffInMinutes;
    },

    // 토큰이 만료되었는지 확인
    isTokenExpired: (token) => {
        const timeUntilExpiry = tokenUtils.getTimeUntilExpiry(token);
        return timeUntilExpiry === null || timeUntilExpiry <= 0;
    },

    // 토큰 정보 전체 출력
    getTokenInfo: (token) => {
        const payload = tokenUtils.decodeToken(token);
        const expiryDate = tokenUtils.getTokenExpiry(token);
        const issuedAt = tokenUtils.getTokenIssuedAt(token);
        const timeUntilExpiry = tokenUtils.getTimeUntilExpiry(token);
        const isExpired = tokenUtils.isTokenExpired(token);

        return {
            payload,
            expiryDate,
            issuedAt,
            timeUntilExpiry,
            isExpired,
            formattedExpiry: expiryDate ? expiryDate.toLocaleString('ko-KR') : '알 수 없음',
            formattedIssuedAt: issuedAt ? issuedAt.toLocaleString('ko-KR') : '알 수 없음',
            formattedTimeUntilExpiry: timeUntilExpiry !== null ?
                `${Math.floor(timeUntilExpiry / 60)}시간 ${timeUntilExpiry % 60}분` : '알 수 없음'
        };
    }
};

export const useAuthStore = create(
    persist(
        (set, get) => ({
            // 상태
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            lastActivity: null, // 마지막 활동 시간

            // 토큰 분석 함수들
            getTokenInfo: () => {
                const token = get().token;
                if (!token) {
                    console.log('🔍 토큰이 없음');
                    return null;
                }

                try {
                    const tokenInfo = tokenUtils.getTokenInfo(token);
                    console.log('🔍 토큰 정보:', tokenInfo);
                    return tokenInfo;
                } catch (error) {
                    console.error('❌ 토큰 정보 확인 실패:', error);
                    return null;
                }
            },

            // 토큰 만료 시간 확인
            getTokenExpiry: () => {
                const token = get().token;
                if (!token) return null;
                return tokenUtils.getTokenExpiry(token);
            },

            // 토큰 발급 시간 확인
            getTokenIssuedAt: () => {
                const token = get().token;
                if (!token) return null;
                return tokenUtils.getTokenIssuedAt(token);
            },

            // 토큰 만료까지 남은 시간
            getTimeUntilExpiry: () => {
                const token = get().token;
                if (!token) return null;
                return tokenUtils.getTimeUntilExpiry(token);
            },

            // 토큰 만료 여부 확인
            isTokenExpired: () => {
                const token = get().token;
                if (!token) return true;
                return tokenUtils.isTokenExpired(token);
            },

            // 토큰 유효성 체크
            checkTokenValidity: () => {
                const token = get().token;
                if (!token) {
                    console.log('🔍 토큰이 없음');
                    return { isValid: false, reason: 'no_token' };
                }

                try {
                    const isExpired = tokenUtils.isTokenExpired(token);
                    const timeUntilExpiry = tokenUtils.getTimeUntilExpiry(token);
                    const expiryDate = tokenUtils.getTokenExpiry(token);
                    const issuedAt = tokenUtils.getTokenIssuedAt(token);

                    console.log('🔍 토큰 유효성 체크:', {
                        isExpired,
                        timeUntilExpiry: timeUntilExpiry ? `${timeUntilExpiry}분` : '알 수 없음',
                        expiryDate: expiryDate ? expiryDate.toLocaleString('ko-KR') : '알 수 없음',
                        issuedAt: issuedAt ? issuedAt.toLocaleString('ko-KR') : '알 수 없음'
                    });

                    if (isExpired) {
                        console.log('⚠️ 토큰이 만료됨');
                        return { isValid: false, reason: 'expired' };
                    }

                    // 만료 10분 전 경고
                    if (timeUntilExpiry && timeUntilExpiry < 10) {
                        console.log('⚠️ 토큰 만료 임박:', `${timeUntilExpiry}분 남음`);
                    }

                    return { isValid: true, timeUntilExpiry };
                } catch (error) {
                    console.error('❌ 토큰 유효성 체크 실패:', error);
                    return { isValid: false, reason: 'invalid_token' };
                }
            },

            // 자동 로그아웃 (토큰 만료 시)
            autoLogoutIfExpired: () => {
                const { isValid, reason } = get().checkTokenValidity();

                if (!isValid) {
                    console.log('🔄 토큰 무효화로 자동 로그아웃:', reason);
                    get().logout();
                    return true; // 로그아웃됨
                }

                return false; // 로그아웃되지 않음
            },

            // 액션
            login: async (credentials) => {
                console.log('🔐 로그인 시도:', credentials);
                set({ isLoading: true, error: null });
                try {
                    console.log('📡 백엔드 API 호출 중...');
                    const response = await authAPI.login(credentials);
                    console.log('✅ 로그인 성공:', response.data);

                    // 백엔드 응답 구조에 맞게 처리
                    const { accessToken, tokenType } = response.data;

                    // 토큰을 HTTP 표준에 맞게 저장 (대문자 Bearer 사용)
                    const token = `Bearer ${accessToken}`;
                    console.log('🔍 저장할 토큰 형식:', {
                        tokenType,
                        accessTokenPreview: accessToken.substring(0, 50) + '...',
                        finalTokenPreview: token.substring(0, 50) + '...',
                        fullToken: token
                    });

                    // 사용자 정보는 별도 API로 가져오기
                    set({
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                        lastActivity: new Date().toISOString(),
                    });

                    console.log('💾 토큰 저장 완료, 사용자 정보 가져오기 시작');

                    // 로그인 후 토큰 유효성 체크
                    const tokenInfo = get().getTokenInfo();
                    if (tokenInfo) {
                        console.log('🔍 로그인 후 토큰 정보:', {
                            만료시간: tokenInfo.formattedExpiry,
                            발급시간: tokenInfo.formattedIssuedAt,
                            남은시간: tokenInfo.formattedTimeUntilExpiry,
                            만료여부: tokenInfo.isExpired
                        });
                    }

                    // 사용자 프로필 정보 가져오기
                    try {
                        await get().getProfile();
                        console.log('✅ 사용자 정보 가져오기 완료');
                    } catch (profileError) {
                        console.error('❌ 사용자 정보 가져오기 실패:', profileError);
                        // 프로필 가져오기 실패해도 로그인은 성공으로 처리
                    }

                    return { success: true };
                } catch (error) {
                    console.error('❌ 로그인 실패:', error);
                    console.error('❌ 오류 응답:', error.response);
                    const errorMessage = error.response?.data?.message || error.message || '로그인에 실패했습니다.';
                    set({
                        isLoading: false,
                        error: errorMessage,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            signup: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authAPI.signup(userData);
                    console.log('✅ 회원가입 성공:', response.data);

                    // 백엔드 응답 구조에 맞게 처리
                    const { token, email, username, role } = response.data;

                    // 토큰을 올바른 형식으로 저장 (백엔드에서 token 필드로 반환)
                    const authToken = `Bearer ${token}`;

                    set({
                        token: authToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                        lastActivity: new Date().toISOString(),
                        user: {
                            email,
                            username,
                            role
                        }
                    });

                    console.log('💾 회원가입 토큰 저장 완료');

                    return { success: true };
                } catch (error) {
                    console.error('❌ 회원가입 실패:', error);
                    console.error('❌ 오류 응답:', error.response);

                    let errorMessage = '회원가입에 실패했습니다.';

                    // 백엔드 스펙에 맞는 오류 처리
                    if (error.response?.data?.detail) {
                        if (Array.isArray(error.response.data.detail)) {
                            const validationErrors = error.response.data.detail.map(err => err.msg).join(', ');
                            errorMessage = `입력 정보 오류: ${validationErrors}`;
                        } else {
                            errorMessage = error.response.data.detail;
                        }
                    } else if (error.response?.status === 409) {
                        errorMessage = '이미 존재하는 이메일입니다.';
                    } else if (error.response?.status === 422) {
                        errorMessage = '입력 정보를 확인해주세요.';
                    }

                    set({
                        isLoading: false,
                        error: errorMessage,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            logout: async () => {
                try {
                    // 로그아웃 전 토큰 정보 확인
                    const tokenInfo = get().getTokenInfo();
                    if (tokenInfo) {
                        console.log('🔍 로그아웃 전 토큰 정보:', {
                            만료시간: tokenInfo.formattedExpiry,
                            발급시간: tokenInfo.formattedIssuedAt,
                            남은시간: tokenInfo.formattedTimeUntilExpiry,
                            만료여부: tokenInfo.isExpired
                        });
                    }
                } catch (error) {
                    console.log('⚠️ 로그아웃 중 오류:', error.message);
                } finally {
                    // 프론트엔드 상태 초기화
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                        lastActivity: null,
                    });

                    // 로컬스토리지의 persist 데이터 제거 (토큰/유저 정보 포함)
                    try {
                        localStorage.removeItem('auth-storage');
                        console.log('🧹 로컬스토리지 auth-storage 키 제거 완료');
                    } catch (e) {
                        console.log('⚠️ 로컬스토리지 제거 중 오류:', e?.message);
                    }
                    console.log('✅ 프론트엔드 로그아웃 완료');
                }
            },

            getProfile: async () => {
                console.log('👤 사용자 프로필 정보 가져오기 시작');
                set({ isLoading: true });
                try {
                    console.log('📡 /api/dashboard/users/me API 호출 중...');
                    const response = await authAPI.getProfile();
                    console.log('✅ 프로필 정보 가져오기 성공:', response.data);

                    set({
                        user: response.data,
                        isAuthenticated: true,
                        isLoading: false,
                        lastActivity: new Date().toISOString(),
                    });

                    console.log('💾 사용자 정보 저장 완료:', response.data);
                } catch (error) {
                    console.error('❌ 프로필 정보 가져오기 실패:', error);
                    console.error('❌ 오류 상세:', {
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        message: error.message
                    });

                    // 403 Forbidden은 토큰이 유효하지 않음을 의미
                    if (error.response?.status === 403) {
                        console.log('🔒 403 Forbidden - 토큰이 유효하지 않음');
                        // 토큰은 유지하되 사용자 정보만 초기화
                        set({
                            user: null,
                            isLoading: false,
                            // isAuthenticated는 유지 (토큰이 있으므로)
                        });
                    } else if (error.response?.status === 401) {
                        console.log('🔒 401 Unauthorized - 인증 실패, 로그아웃 처리');
                        // 401은 인증 실패를 의미하므로 로그아웃
                        set({
                            user: null,
                            token: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: null,
                            lastActivity: null,
                        });
                    } else {
                        // 다른 오류의 경우 인증 상태 초기화
                        set({
                            isLoading: false,
                            isAuthenticated: false,
                        });
                    }
                }
            },

            // 사용자 정보 업데이트
            updateUser: (userData) => {
                set(state => ({
                    user: { ...state.user, ...userData },
                    lastActivity: new Date().toISOString(),
                }));
            },

            // 토큰 갱신 (백엔드 미구현)
            refreshToken: async () => {
                console.log('🔄 토큰 갱신 시도');
                try {
                    const response = await authAPI.refreshToken();
                    const { token } = response.data;

                    set({
                        token,
                        lastActivity: new Date().toISOString(),
                    });

                    console.log('✅ 토큰 갱신 성공');
                    return { success: true };
                } catch (error) {
                    console.log('⚠️ 토큰 갱신 실패 (백엔드 미구현):', error.message);
                    // 토큰 갱신 실패 시에도 로그아웃하지 않음 (백엔드 미구현이므로)
                    return { success: false };
                }
            },

            // 활동 시간 업데이트
            updateActivity: () => {
                set({ lastActivity: new Date().toISOString() });
            },

            // 세션 만료 확인
            checkSessionExpiry: () => {
                const { lastActivity } = get();
                if (!lastActivity) return false;

                const lastActivityTime = new Date(lastActivity);
                const now = new Date();
                const diffInHours = (now - lastActivityTime) / (1000 * 60 * 60);

                // 24시간 이상 활동이 없으면 세션 만료
                if (diffInHours > 24) {
                    get().logout();
                    return true;
                }

                return false;
            },

            // 사용자 권한 확인
            hasPermission: (permission) => {
                const { user } = get();
                if (!user || !user.permissions) return false;
                return user.permissions.includes(permission);
            },

            // 사용자 역할 확인
            hasRole: (role) => {
                const { user } = get();
                if (!user || !user.roles) return false;
                return user.roles.includes(role);
            },

            clearError: () => set({ error: null }),

            // JWT 토큰 만료 시간 확인
            validateTokenExpiry: (token) => {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const currentTime = Date.now() / 1000;
                    return payload.exp > currentTime;
                } catch (error) {
                    console.log('⚠️ 토큰 파싱 실패:', error.message);
                    return false;
                }
            },

            // 초기화 - persist된 상태 복원 후 호출 (개선된 버전)
            initialize: async () => {
                const state = get();
                console.log('🔄 인증 상태 초기화 시작:', {
                    hasToken: !!state.token,
                    isAuthenticated: state.isAuthenticated,
                    hasUser: !!state.user,
                    tokenType: state.token ? (state.token.startsWith('dev_token_') ? 'dev' : 'prod') : 'none'
                });

                // 이미 사용자 정보가 있으면 스킵 (중복 호출 방지)
                if (state.user && state.isAuthenticated) {
                    console.log('✅ 이미 인증된 사용자 정보 존재 - 초기화 스킵');
                    return;
                }

                // 1. 토큰 유효성 먼저 검증
                if (state.token) {
                    console.log('🔍 토큰 유효성 검증 시작');



                    // 일반 모드: 토큰 유효성 먼저 검증
                    try {
                        console.log('🌐 일반 모드 토큰 유효성 검증');
                        set({ isLoading: true, isAuthenticated: false }); // 로딩 상태 설정, 인증 상태 초기화

                        // JWT 토큰 만료 시간 사전 검증
                        if (!get().validateTokenExpiry(state.token)) {
                            throw new Error('토큰이 만료되었습니다.');
                        }

                        // 백엔드 API 미구현으로 로컬 검증만 수행
                        console.log('🔍 로컬 JWT 만료시간 검증 완료');

                        // 토큰이 유효하면 사용자 정보 가져오기 (한 번만 호출)
                        const profileResponse = await authAPI.getProfile();
                        console.log('✅ 프로필 정보 가져오기 성공:', profileResponse.data);

                        set({
                            user: profileResponse.data,
                            isAuthenticated: true,
                            isLoading: false,
                            lastActivity: new Date().toISOString(),
                        });

                        console.log('✅ 토큰 유효성 검증 완료 (로컬 검증)');
                    } catch (error) {
                        console.log('❌ 토큰 유효성 검증 실패:', error.message);
                        // 토큰이 유효하지 않으면 로그아웃
                        set({
                            user: null,
                            token: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: null,
                            lastActivity: null,
                        });
                    }
                } else {
                    console.log('❌ 토큰 없음 - 인증 상태 없음');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                        lastActivity: null,
                    });
                }
            },

            // 전역 상태 정보 가져오기
            getAuthInfo: () => {
                const state = get();
                return {
                    isAuthenticated: state.isAuthenticated,
                    user: state.user,
                    isLoading: state.isLoading,
                    lastActivity: state.lastActivity,
                    hasToken: !!state.token,
                };
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                lastActivity: state.lastActivity,
            }),
            onRehydrateStorage: () => (state) => {
                console.log('💾 Persist 상태 복원 완료:', {
                    hasToken: !!state?.token,
                    isAuthenticated: state?.isAuthenticated,
                    hasUser: !!state?.user
                });
            },
        }
    )
); 
import { useState, useEffect, useCallback } from 'react';

// 이미지 캐시 저장소 (메모리 + localStorage)
const imageCache = new Map();
const CACHE_KEY_PREFIX = 'scratcha_image_cache_';
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24시간

// localStorage에서 캐시된 이미지 복원 (동기식)
const loadCachedImagesFromStorage = () => {
    try {
        const now = Date.now();
        const keysToCheck = [];

        // 먼저 모든 캐시 키를 수집
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_KEY_PREFIX)) {
                keysToCheck.push(key);
            }
        }

        // 캐시 키들을 처리
        keysToCheck.forEach(key => {
            try {
                const cachedData = JSON.parse(localStorage.getItem(key));
                if (cachedData && cachedData.expiry > now) {
                    const originalUrl = key.replace(CACHE_KEY_PREFIX, '');
                    imageCache.set(originalUrl, cachedData.dataUrl);
                } else {
                    // 만료된 캐시 삭제 (비동기로 처리하여 성능 향상)
                    setTimeout(() => localStorage.removeItem(key), 0);
                }
            } catch (parseError) {
                console.warn('캐시 파싱 실패:', parseError);
                setTimeout(() => localStorage.removeItem(key), 0);
            }
        });

        console.log(`이미지 캐시 로드 완료: ${imageCache.size}개 이미지`);
    } catch (error) {
        console.warn('이미지 캐시 로드 실패:', error);
    }
};

// 이미지를 Base64로 변환하여 캐시에 저장
const cacheImageToStorage = async (url, dataUrl) => {
    try {
        const cacheKey = CACHE_KEY_PREFIX + url;
        const cacheData = {
            dataUrl,
            expiry: Date.now() + CACHE_EXPIRY_TIME,
            cached: Date.now()
        };

        // localStorage 용량 체크 (5MB 제한)
        const dataSize = JSON.stringify(cacheData).length;
        if (dataSize > 5 * 1024 * 1024) {
            console.warn('이미지가 너무 커서 캐시하지 않습니다:', url);
            return;
        }

        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        imageCache.set(url, dataUrl);
    } catch (error) {
        console.warn('이미지 캐시 저장 실패:', error);
        // localStorage가 가득 찬 경우 오래된 캐시 삭제
        if (error.name === 'QuotaExceededError') {
            clearOldCache();
            // 재시도
            try {
                localStorage.setItem(CACHE_KEY_PREFIX + url, JSON.stringify({
                    dataUrl,
                    expiry: Date.now() + CACHE_EXPIRY_TIME,
                    cached: Date.now()
                }));
            } catch (retryError) {
                console.warn('캐시 재시도 실패:', retryError);
            }
        }
    }
};

// 오래된 캐시 삭제
const clearOldCache = () => {
    try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_KEY_PREFIX)) {
                keysToRemove.push(key);
            }
        }

        // 가장 오래된 캐시부터 삭제
        keysToRemove.sort((a, b) => {
            const aData = JSON.parse(localStorage.getItem(a) || '{}');
            const bData = JSON.parse(localStorage.getItem(b) || '{}');
            return (aData.cached || 0) - (bData.cached || 0);
        });

        // 절반 정도 삭제
        const removeCount = Math.ceil(keysToRemove.length / 2);
        for (let i = 0; i < removeCount; i++) {
            localStorage.removeItem(keysToRemove[i]);
            const url = keysToRemove[i].replace(CACHE_KEY_PREFIX, '');
            imageCache.delete(url);
        }
    } catch (error) {
        console.warn('캐시 정리 실패:', error);
    }
};

// 이미지를 Base64로 변환
const convertImageToBase64 = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                resolve(dataUrl);
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => reject(new Error('이미지 로드 실패'));
        img.src = url;
    });
};

// 초기 캐시 로드
loadCachedImagesFromStorage();

export const useImageCache = (src, fallbackSrc = null) => {
    // 초기 상태에서 캐시 확인
    const [imageSrc, setImageSrc] = useState(() => {
        if (!src) return src;
        // 메모리 캐시에서 즉시 확인
        return imageCache.has(src) ? imageCache.get(src) : src;
    });

    const [isLoading, setIsLoading] = useState(() => {
        if (!src) return false;
        // 캐시된 이미지가 있거나 로컬 이미지면 로딩 상태를 false로 시작
        if (imageCache.has(src)) return false;
        if (!src.startsWith('http://') && !src.startsWith('https://')) return false;
        return true;
    });

    const [hasError, setHasError] = useState(false);
    const [isCached, setIsCached] = useState(() => {
        if (!src) return false;
        return imageCache.has(src);
    });

    const loadImage = useCallback(async (url) => {
        if (!url) {
            setIsLoading(false);
            setHasError(true);
            return;
        }

        // 메모리 캐시에서 먼저 확인 (로딩 상태 변경 없이)
        if (imageCache.has(url)) {
            console.log('🟢 캐시된 이미지 사용:', url);
            setImageSrc(imageCache.get(url));
            setIsCached(true);
            setIsLoading(false);
            setHasError(false);
            return;
        }

        console.log('🔄 이미지 로딩 시작:', url);

        // 캐시가 없는 경우에만 로딩 상태 설정
        setIsLoading(true);
        setHasError(false);

        try {

            // 외부 URL인 경우에만 캐싱 시도
            if (url.startsWith('http://') || url.startsWith('https://')) {
                try {
                    const dataUrl = await convertImageToBase64(url);
                    await cacheImageToStorage(url, dataUrl);
                    setImageSrc(dataUrl);
                    setIsCached(true);
                    console.log('✅ 외부 이미지 캐싱 완료:', url);
                } catch (cacheError) {
                    console.warn('이미지 캐싱 실패, 원본 URL 사용:', cacheError);
                    setImageSrc(url);
                    setIsCached(false);
                }
            } else {
                // 로컬 이미지는 그대로 사용하고 즉시 로딩 완료 처리
                console.log('📁 로컬 이미지 사용:', url);
                setImageSrc(url);
                setIsCached(false);
            }

            setIsLoading(false);
        } catch (error) {
            console.error('이미지 로드 실패:', error);
            setHasError(true);
            setIsLoading(false);

            // fallback 이미지가 있으면 시도
            if (fallbackSrc && fallbackSrc !== url) {
                loadImage(fallbackSrc);
            }
        }
    }, [fallbackSrc]);

    useEffect(() => {
        // 이미 캐시된 이미지가 있으면 loadImage를 호출하지 않음
        if (!imageCache.has(src)) {
            loadImage(src);
        }
    }, [src, loadImage]);

    const retry = useCallback(() => {
        loadImage(src);
    }, [src, loadImage]);

    const clearCache = useCallback(() => {
        try {
            const cacheKey = CACHE_KEY_PREFIX + src;
            localStorage.removeItem(cacheKey);
            imageCache.delete(src);
            console.log('캐시 삭제됨:', src);
        } catch (error) {
            console.warn('캐시 삭제 실패:', error);
        }
    }, [src]);

    return {
        imageSrc,
        isLoading,
        hasError,
        isCached,
        retry,
        clearCache
    };
};

// 전체 이미지 캐시 관리 유틸리티
export const imageCacheUtils = {
    // 전체 캐시 삭제
    clearAllCache: () => {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(CACHE_KEY_PREFIX)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            imageCache.clear();
            console.log('모든 이미지 캐시가 삭제되었습니다.');
        } catch (error) {
            console.warn('캐시 삭제 실패:', error);
        }
    },

    // 캐시 상태 정보
    getCacheInfo: () => {
        const cacheSize = imageCache.size;
        const storageKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_KEY_PREFIX)) {
                storageKeys.push(key);
            }
        }
        return {
            memoryCache: cacheSize,
            localStorage: storageKeys.length,
            keys: storageKeys
        };
    }
};
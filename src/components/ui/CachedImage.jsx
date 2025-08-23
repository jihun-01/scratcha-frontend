import React, { useState, useEffect } from 'react';
import { useImageCache } from '../../hooks/useImageCache';
import placeholder from '@/assets/images/placeholder.svg';

const CachedImage = ({
    src,
    fallbackSrc = placeholder,
    alt = '',
    className = '',
    showCacheIndicator = false,
    showRetryButton = true,
    onError = null,
    onLoad = null,
    ...props
}) => {
    const { imageSrc, isLoading, hasError, isCached, retry } = useImageCache(src, fallbackSrc);
    // 캐시된 이미지는 즉시 로드된 것으로 간주
    const [imageLoaded, setImageLoaded] = useState(isCached);

    // 캐시 상태가 변경될 때 imageLoaded 상태 업데이트
    useEffect(() => {
        if (isCached) {
            setImageLoaded(true);
        }
    }, [isCached]);

    const handleImageLoad = (e) => {
        setImageLoaded(true);
        if (onLoad) onLoad(e);
    };

    const handleImageError = (e) => {
        setImageLoaded(false);
        if (onError) onError(e);
    };

    const handleRetry = () => {
        setImageLoaded(false);
        retry();
    };

    // 로딩 스피너 컴포넌트
    const LoadingSpinner = () => (
        <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    // 에러 표시 컴포넌트
    const ErrorDisplay = () => (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">이미지를 불러올 수 없습니다</p>
            {showRetryButton && (
                <button
                    onClick={handleRetry}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    다시 시도
                </button>
            )}
        </div>
    );

    // 캐시 인디케이터
    const CacheIndicator = () => {
        if (!showCacheIndicator) return null;

        return (
            <div className="absolute top-2 right-2 z-10">
                {isCached ? (
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        캐시됨
                    </div>
                ) : (
                    <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        실시간
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`relative ${className}`} {...props}>
            {/* 캐시 인디케이터 */}
            <CacheIndicator />

            {/* 로딩 상태: 캐시되지 않았고 로딩 중일 때만 표시 */}
            {!isCached && isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                    <LoadingSpinner />
                </div>
            )}

            {/* 이미지 에러 */}
            {hasError && !isLoading && (
                <ErrorDisplay />
            )}

            {/* 실제 이미지 */}
            {!hasError && imageSrc && (
                <img
                    src={imageSrc}
                    alt={alt}
                    className={`${className} ${isCached ? 'opacity-100' : (imageLoaded ? 'opacity-100' : 'opacity-0')} transition-opacity duration-300`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    {...props}
                />
            )}
        </div>
    );
};

export default CachedImage;
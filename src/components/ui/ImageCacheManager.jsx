import React, { useState, useEffect } from 'react';
import { imageCacheUtils } from '../../hooks/useImageCache';

const ImageCacheManager = ({ isOpen, onClose }) => {
    const [cacheInfo, setCacheInfo] = useState({ memoryCache: 0, localStorage: 0, keys: [] });
    const [showDetails, setShowDetails] = useState(false);

    const refreshCacheInfo = () => {
        setCacheInfo(imageCacheUtils.getCacheInfo());
    };

    useEffect(() => {
        if (isOpen) {
            refreshCacheInfo();
        }
    }, [isOpen]);

    const handleClearCache = () => {
        if (window.confirm('모든 이미지 캐시를 삭제하시겠습니까?')) {
            imageCacheUtils.clearAllCache();
            refreshCacheInfo();
            alert('캐시가 삭제되었습니다.');
        }
    };

    const formatCacheKey = (key) => {
        return key.replace('scratcha_image_cache_', '').substring(0, 50) + '...';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        이미지 캐시 관리
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 캐시 통계 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                            메모리 캐시
                        </h3>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {cacheInfo.memoryCache}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-300">개 이미지</p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                            로컬 저장소
                        </h3>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {cacheInfo.localStorage}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-300">개 이미지</p>
                    </div>
                </div>

                {/* 컨트롤 버튼 */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={refreshCacheInfo}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        새로고침
                    </button>

                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        {showDetails ? '세부사항 숨기기' : '세부사항 보기'}
                    </button>

                    <button
                        onClick={handleClearCache}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        모든 캐시 삭제
                    </button>
                </div>

                {/* 캐시 세부사항 */}
                {showDetails && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                            캐시된 이미지 목록
                        </h3>

                        {cacheInfo.keys.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                캐시된 이미지가 없습니다.
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {cacheInfo.keys.map((key, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded text-sm"
                                    >
                                        <span className="truncate text-gray-900 dark:text-white">
                                            {formatCacheKey(key)}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                            캐시됨
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 도움말 */}
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        💡 이미지 캐시 정보
                    </h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        <li>• 외부 이미지는 자동으로 캐시되어 오프라인에서도 사용 가능합니다</li>
                        <li>• 캐시는 24시간 동안 유효하며, 자동으로 갱신됩니다</li>
                        <li>• 로컬 이미지는 캐시되지 않습니다</li>
                        <li>• 브라우저 저장 공간이 부족하면 오래된 캐시가 자동 삭제됩니다</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ImageCacheManager;
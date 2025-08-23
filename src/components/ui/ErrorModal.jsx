import React from 'react';
import Modal from './Modal';

export default function ErrorModal({
    isOpen,
    onClose,
    title = "오류",
    message,
    onRetry
}) {


    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
        >
            <div className="text-center ">
                {/* 오류 아이콘 */}
                <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* 메시지 */}
                <p className="text-lg theme-text-primary mb-6">
                    {message}
                </p>

                {/* 버튼 */}
                <div className="flex gap-3">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="flex-1 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition"
                        >
                            다시 시도
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className={`flex-1 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition ${onRetry ? '' : 'w-full'}`}
                    >
                        닫기
                    </button>
                </div>
            </div>
        </Modal>
    );
} 
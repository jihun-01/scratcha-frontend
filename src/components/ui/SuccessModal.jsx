import React from 'react';
import Modal from './Modal';

export default function SuccessModal({
    isOpen,
    onClose,
    title = "성공!",
    message,
    onConfirm
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
        >
            <div className="text-center ">
                {/* 성공 아이콘 */}
                <div className="mx-auto mb-4 w-16 h-16 theme-success-icon-bg rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 theme-success-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* 메시지 */}
                <p className="text-lg theme-text-primary mb-6">
                    {message}
                </p>

                {/* 버튼 */}
                <div className="flex gap-3">
                    <button
                        onClick={onConfirm || onClose}
                        className="flex-1 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition"
                    >
                        확인
                    </button>
                </div>
            </div>
        </Modal>
    );
} 
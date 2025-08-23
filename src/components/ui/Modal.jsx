import React, { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children, hideClose = false, centerTitle = false, borderless = false, titleClassName = 'text-xl', headerClassName = 'p-6', bodyClassName = 'p-6' }) {
    const modalRef = useRef(null);

    // ESC 키로 모달 닫기 및 키보드 트랩
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }

            // 모달이 열려있을 때만 키보드 이벤트 처리
            if (isOpen) {
                // Enter 키가 모달 외부로 전파되는 것을 방지
                if (e.key === 'Enter' && !modalRef.current?.contains(e.target)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown, true); // capture phase에서 처리
            // 모달 열릴 때 body 스크롤 방지
            document.body.style.overflow = 'hidden';

            // 모달에 포커스 설정 제거 - 입력 필드가 포커스를 가져갈 수 있도록
            // if (modalRef.current) {
            //     modalRef.current.focus();
            // }
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            // 모달 닫힐 때 body 스크롤 복원
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* 배경 오버레이 - 포커스 방지 */}
            <div
                className="absolute inset-0 theme-modal-overlay"
                onClick={onClose}
                onMouseDown={(e) => e.preventDefault()}  // 포커스 방지
                tabIndex={-1}  // 포커스 불가능
                style={{ outline: 'none' }}  // 외곽선 제거
            ></div>

            {/* 모달 컨텐츠 - 포커스 방지 */}
            <div
                ref={modalRef}
                tabIndex={-1}  // 포커스 불가능하게 유지
                className={`relative rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border theme-modal-border ${borderless ? '' : 'border'}`}
                onKeyDown={(e) => {
                    // 모달 내부에서 Enter 키 처리
                    if (e.key === 'Enter') {
                        e.stopPropagation();
                    }
                }}
                onFocus={(e) => {
                    // 모달 컨텐츠가 포커스를 받으려고 할 때 방지
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                {/* 헤더 */}
                <div className={`flex items-center ${centerTitle ? 'justify-center' : 'justify-between'} ${headerClassName} ${borderless ? '' : 'border-b theme-modal-border'}`}>
                    <h2 className={`${titleClassName} font-semibold text-gray-900 dark:text-white`}>{title}</h2>
                    {!hideClose && !centerTitle && (
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="닫기"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* 바디 */}
                <div className={`${bodyClassName}`}>
                    {children}
                </div>
            </div>
        </div>
    );
} 
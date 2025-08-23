import React from 'react';

export default function SignupButton({
    children = "회원가입",
    loading = false,
    disabled = false,
    onClick,
    className = ""
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`w-full bg-blue-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-2 rounded-lg text-sm transition ${className}`}
        >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>처리 중...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
} 
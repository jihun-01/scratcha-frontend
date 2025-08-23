import React, { useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignupForm } from '../../hooks/useSignupForm';
import { useAuth } from '../../hooks/useAuth';
import FormField from '../forms/FormField';
import SignupButton from '../forms/SignupButton';
import SuccessModal from '../ui/SuccessModal';
import ErrorModal from '../ui/ErrorModal';
import signupBackground from '@/assets/images/signup-background.webp';
import logo from '@/assets/images/scratchalogo.svg';

// 배경 스타일 상수 (재렌더링 방지)
const backgroundStyle = {
    backgroundImage: `url(${signupBackground})`,
    backgroundSize: 'cover'
};

// 로고 링크 상수 (재렌더링 방지)
const LOGO_LINK = (
    <Link to="/" className="inline-block">
        <img
            src={logo}
            alt="Scratcha"
            className="h-20 w-auto mx-auto cursor-pointer hover:opacity-80 transition-opacity dark:brightness-0 dark:invert"
        />
    </Link>
);

// 로그인 링크 상수 (재렌더링 방지)
const LOGIN_LINK = (
    <Link
        to="/signin"
        className="hover:underline font-medium text-blue-600 dark:text-blue-400"
    >
        로그인하기
    </Link>
);

export default function Signup() {
    const navigate = useNavigate();
    const {
        formData,
        errors,
        validationStatus,
        isLoading,
        successModal,
        errorModal,
        handleInputChange,
        handleSignup,
        setSuccessModal,
        setErrorModal
    } = useSignupForm();

    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // 모달 핸들러들 메모이제이션
    const handleSuccessClose = useCallback(() => {
        setSuccessModal({ isOpen: false, message: '' });
    }, [setSuccessModal]);

    const handleSuccessConfirm = useCallback(() => {
        navigate('/signin');
    }, [navigate]);

    const handleErrorClose = useCallback(() => {
        setErrorModal({ isOpen: false, message: '' });
    }, [setErrorModal]);

    const handleErrorRetry = useCallback(() => {
        setErrorModal({ isOpen: false, message: '' });
        handleSignup();
    }, [setErrorModal, handleSignup]);

    return (
        <div className="min-h-screen relative flex items-center justify-end bg-cover bg-center bg-no-repeat bg-fixed"
            style={backgroundStyle}>

            {/* 좌측 영역 - 배경 이미지와 텍스트 (절대 위치로 상단 고정) */}
            <div className="hidden lg:block absolute top-8 left-1/3 transform -translate-x-1/2">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                        지금 바로 가입하세요!
                    </h1>
                    <p className="text-4xl text-gray-600 mb-8">
                        새로운 CAPTCHA를 체험해보세요
                    </p>
                </div>
            </div>

            {/* 우측 영역 - 회원가입 폼 (우측 배치) */}
            <div className="w-full max-w-sm mx-4 mr-8 lg:mr-16">
                <div className="rounded-2xl shadow-2xl p-3 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 min-h-[380px] flex flex-col justify-center">
                    {/* 페이지 타이틀 (Scratcha 로고 포함) */}
                    <div className="text-center mb-2">
                        {/* Scratcha 로고 */}
                        <div className="text-center mb-1">
                            {LOGO_LINK}
                        </div>
                        <h1 className="text-base font-bold mb-0.5 text-gray-900 dark:text-white">
                            회원가입
                        </h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            새로운 계정을 만들어보세요
                        </p>
                    </div>

                    {/* 알림 메시지 */}
                    {successModal.isOpen && (
                        <SuccessModal
                            isOpen={successModal.isOpen}
                            message={successModal.message}
                            onClose={handleSuccessClose}
                            onConfirm={handleSuccessConfirm}
                        />
                    )}
                    {errorModal.isOpen && (
                        <ErrorModal
                            isOpen={errorModal.isOpen}
                            message={errorModal.message}
                            onClose={handleErrorClose}
                            onRetry={handleErrorRetry}
                        />
                    )}

                    {/* 회원가입 폼 */}
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
                        <FormField
                            id="email"
                            label="이메일 (아이디)"
                            type="text"
                            placeholder="이메일을 입력하세요"
                            required={true}
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            error={errors.email}
                            isValid={validationStatus.email}
                        />
                        <FormField
                            id="userName"
                            label="이름"
                            type="text"
                            placeholder="이름을 입력하세요"
                            required={true}
                            value={formData.userName}
                            onChange={(e) => handleInputChange('userName', e.target.value)}
                            error={errors.userName}
                            isValid={validationStatus.userName}
                        />
                        <FormField
                            id="password"
                            label="비밀번호"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            required={true}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            error={errors.password}
                            isValid={validationStatus.password}
                        />
                        <FormField
                            id="passwordConfirm"
                            label="비밀번호 확인"
                            type="password"
                            placeholder="비밀번호를 다시 입력하세요"
                            required={true}
                            value={formData.passwordConfirm}
                            password={formData.password}
                            onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                            error={errors.passwordConfirm}
                            isValid={validationStatus.passwordConfirm}
                        />
                        <SignupButton loading={isLoading} onClick={handleSignup} className="mt-3" />
                    </form>

                    {/* 로그인 링크 */}
                    <div className="text-center mt-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            이미 계정이 있으신가요?{' '}
                            {LOGIN_LINK}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 
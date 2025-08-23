import { useState } from 'react';
import { authAPI } from '../services/api';
import { validateEmail, validatePassword, validateUserName } from '../utils/validators';

export function useSignupForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        userName: ''
    });

    const [errors, setErrors] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        userName: ''
    });

    const [validationStatus, setValidationStatus] = useState({
        email: false,
        password: false,
        passwordConfirm: false,
        userName: false
    });

    const [isLoading, setIsLoading] = useState(false);
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

    const validateField = (field, value) => {
        switch (field) {
            case 'email': {
                return validateEmail(value);
            }
            case 'password': {
                return validatePassword(value);
            }
            case 'passwordConfirm': {
                return {
                    isValid: value === formData.password && value !== '',
                    error: value === formData.password ? '' : '비밀번호가 일치하지 않습니다.'
                };
            }
            case 'userName': {
                return validateUserName(value);
            }
            default:
                return { isValid: false, error: '' };
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        const validation = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: validation.error }));
        setValidationStatus(prev => ({ ...prev, [field]: validation.isValid }));
    };

    const validateForm = () => {
        const fields = ['email', 'password', 'passwordConfirm', 'userName'];
        const newErrors = {};
        const newValidationStatus = {};

        fields.forEach(field => {
            const validation = validateField(field, formData[field]);
            newErrors[field] = validation.error;
            newValidationStatus[field] = validation.isValid;
        });

        setErrors(newErrors);
        setValidationStatus(newValidationStatus);

        return Object.values(newErrors).every(error => error === '');
    };

    const handleSignup = async () => {
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);
        try {
            // 디버깅을 위한 로그
            console.log('회원가입 요청 데이터:', {
                email: formData.email,
                password: formData.password,
                userName: formData.userName
            });

            // 백엔드 API 호출
            const response = await authAPI.signup({
                email: formData.email,
                password: formData.password,
                userName: formData.userName
            });

            console.log('회원가입 응답:', response);

            // 백엔드 스펙에 맞게 201 상태 코드 체크
            if (response.status === 201) {
                setSuccessModal({ isOpen: true, message: '회원가입이 완료되었습니다!' });
                setFormData({ email: '', password: '', passwordConfirm: '', userName: '' });
            } else {
                setErrorModal({ isOpen: true, message: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.' });
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            console.error('오류 응답:', error.response);
            let errorMessage = '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';

            // 백엔드 스펙에 맞는 오류 처리
            if (error.response?.data?.detail) {
                // 422 Validation Error 처리
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
            } else if (error.response?.status === 404) {
                errorMessage = 'API 엔드포인트를 찾을 수 없습니다.';
            }

            setErrorModal({ isOpen: true, message: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return {
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
    };
} 
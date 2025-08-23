import React from 'react';
import FormLabel from './FormLabel';
import FormInput from './FormInput';

export default function FormField({
    id,
    label,
    type = "text",
    placeholder,
    required = false,
    error,
    value,
    password,
    isValid,
    disabled = false,
    className = "",
    enableValidation = false,
    ...props
}) {
    // 로그인 페이지에서만 required 전달 (enableValidation이 true인 경우)
    const shouldPassRequired = required && enableValidation;

    return (
        <div className={`mb-4 ${className}`}>
            <FormLabel htmlFor={id} required={required}>
                {label}
            </FormLabel>
            <FormInput
                id={id}
                type={type}
                placeholder={placeholder}
                error={error}
                value={value}
                password={password}
                isValid={isValid}
                disabled={disabled}
                required={shouldPassRequired}
                {...props}
            />
        </div>
    );
} 
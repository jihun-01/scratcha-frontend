// 이메일 검증: RFC 5321/5322 기반, 총 254자 이내, 로컬 파트 64자 이내, 도메인에 점 최소 1개
export function validateEmail(value) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$|^"[^"]*"@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
    const input = (value || '').trim();
    const [localPart = '', domainPart = ''] = input.split('@');
    const totalLengthOk = input.length <= 254;
    const localLengthOk = localPart.length <= 64;
    const regexOk = emailRegex.test(input);

    const isValid = totalLengthOk && localLengthOk && regexOk;

    if (isValid) {
        return { isValid: true, error: '' };
    }

    // 구체적 사유 반환
    if (!input) {
        return { isValid: false, error: '이메일을 입력해주세요.' };
    }
    if (!input.includes('@')) {
        return { isValid: false, error: '이메일에 @ 기호가 포함되어야 합니다.' };
    }
    if (!totalLengthOk) {
        return { isValid: false, error: '이메일 전체 길이는 254자를 넘을 수 없습니다.' };
    }
    if (!localLengthOk) {
        return { isValid: false, error: '@ 앞 로컬 파트는 최대 64자까지 가능합니다.' };
    }
    if (!domainPart.includes('.')) {
        return { isValid: false, error: '도메인에 점(.)이 최소 1개 포함되어야 합니다.' };
    }
    const labels = domainPart.split('.');
    if (labels.some(l => l.length === 0)) {
        return { isValid: false, error: '도메인 라벨은 비어 있을 수 없습니다. (예: a..b.com 은 불가)' };
    }
    if (labels.some(l => l.length > 63)) {
        return { isValid: false, error: '도메인의 각 라벨은 최대 63자까지 가능합니다.' };
    }
    return { isValid: false, error: '올바른 이메일 형식이 아닙니다. (영숫자/허용 특수문자, 도메인 라벨 규칙 준수)' };
}

// 비밀번호 검증: 8-64자, 숫자-only 불가(영문 또는 지정 특수문자 최소 1자), 허용: 영문/숫자/!@#$%^&*()_+-=[]{};:,.?/
export function validatePassword(value) {
    const input = (value || '');
    const allowedChars = /^[A-Za-z0-9!@#$%^&*()_+\[\]{};:,.?/-]+$/; // eslint-disable-line no-useless-escape
    const passwordRegex = /^(?=.*[A-Za-z!@#$%^&*()_+\[\]{};:,.?/-])[A-Za-z0-9!@#$%^&*()_+\[\]{};:,.?/-]{8,64}$/; // eslint-disable-line no-useless-escape

    const lengthOk = input.length >= 8 && input.length <= 64;
    const whitespaceOk = !/\s/.test(input);
    const allowedOk = allowedChars.test(input);
    const notOnlyDigits = !/^[0-9]+$/.test(input);
    const regexOk = passwordRegex.test(input);

    const isValid = lengthOk && whitespaceOk && allowedOk && notOnlyDigits && regexOk;
    if (isValid) {
        return { isValid: true, error: '' };
    }

    // 상세 사유 분기
    if (!input) {
        return { isValid: false, error: '비밀번호를 입력해주세요.' };
    }
    if (input.length < 8) {
        return { isValid: false, error: '비밀번호는 최소 8자 이상이어야 합니다.' };
    }
    if (input.length > 64) {
        return { isValid: false, error: '비밀번호는 최대 64자까지 가능합니다.' };
    }
    if (!whitespaceOk) {
        return { isValid: false, error: '비밀번호에는 공백을 사용할 수 없습니다.' };
    }
    if (!allowedOk) {
        return { isValid: false, error: '허용되지 않는 문자가 포함되어 있습니다. (허용: 영문/숫자/!@#$%^&*()_+-=[]{};:,.?/)' };
    }
    if (!notOnlyDigits) {
        return { isValid: false, error: '숫자만으로는 사용할 수 없습니다. 영문 또는 지정 특수문자를 포함해주세요.' };
    }
    return { isValid: false, error: '비밀번호 형식이 올바르지 않습니다.' };
}

// 유저네임 검증: 1-30자, 한글/영문/숫자 + ._- 허용, 시작/끝/연속 특수문자 금지, 숫자-only 금지
export function validateUserName(value) {
    const input = (value || '');
    const trimmed = input.trim();
    const nameRegex = /^(?=.{1,30}$)(?=.*[가-힣A-Za-z])[가-힣A-Za-z0-9]+(?:[._-][가-힣A-Za-z0-9]+)*$/;
    const allowedChars = /^[가-힣A-Za-z0-9._-]+$/;

    const lengthOk = trimmed.length >= 1 && trimmed.length <= 30;
    const whitespaceOk = !/\s/.test(input);
    const allowedOk = allowedChars.test(trimmed);
    const startEndOk = !(/^[._-]/.test(trimmed) || /[._-]$/.test(trimmed));
    const noRepeatSymbols = !(/[._-]{2,}/.test(trimmed));
    const hasLetter = /[가-힣A-Za-z]/.test(trimmed);
    const regexOk = nameRegex.test(trimmed);

    const isValid = lengthOk && whitespaceOk && allowedOk && startEndOk && noRepeatSymbols && hasLetter && regexOk;
    if (isValid) {
        return { isValid: true, error: '' };
    }

    // 상세 사유 분기
    if (!trimmed) {
        return { isValid: false, error: '이름을 입력해주세요.' };
    }
    if (!whitespaceOk) {
        return { isValid: false, error: '이름에는 공백을 사용할 수 없습니다.' };
    }
    if (trimmed.length > 30) {
        return { isValid: false, error: '이름은 최대 30자까지 가능합니다.' };
    }
    if (!allowedOk) {
        return { isValid: false, error: '허용되지 않는 문자가 포함되어 있습니다. (허용: 한글/영문/숫자 및 ._- )' };
    }
    if (!startEndOk) {
        return { isValid: false, error: '이름은 특수문자(._-)로 시작하거나 끝날 수 없습니다.' };
    }
    if (!noRepeatSymbols) {
        return { isValid: false, error: '특수문자(._-)는 연속으로 사용할 수 없습니다.' };
    }
    if (!hasLetter) {
        return { isValid: false, error: '숫자만 사용할 수 없습니다. 한글 또는 영문을 최소 1자 포함해야 합니다.' };
    }
    return { isValid: false, error: '이름 형식이 올바르지 않습니다.' };
}



import React, { useEffect } from 'react';
import useDarkModeStore from '../stores/darkModeStore';

export default function ThemeProvider({ children }) {
    const initialize = useDarkModeStore(state => state.initialize);

    useEffect(() => {
        // 앱 시작 시 다크모드 초기화
        initialize();
    }, [initialize]);

    return <>{children}</>;
} 
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useDarkModeStore = create(
    persist(
        (set, get) => ({
            // 상태
            isDark: false,

            // 초기화 - Tailwind CSS 4 공식 문서 방식
            initialize: () => {
                // On page load or when changing themes, best to add inline in `head` to avoid FOUC
                const isDark = localStorage.theme === "dark" ||
                    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)

                set({ isDark })

                if (isDark) {
                    document.documentElement.classList.add('dark')
                } else {
                    document.documentElement.classList.remove('dark')
                }

                // 시스템 다크모드 변경 감지
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
                const handler = (e) => {
                    if (!("theme" in localStorage)) {
                        set({ isDark: e.matches })
                        if (e.matches) {
                            document.documentElement.classList.add('dark')
                        } else {
                            document.documentElement.classList.remove('dark')
                        }
                    }
                }
                mediaQuery.addEventListener('change', handler)

                // 클린업 함수 반환 (컴포넌트에서 사용)
                return () => mediaQuery.removeEventListener('change', handler)
            },

            // 토글
            toggle: () => {
                const { isDark } = get()
                const newDarkMode = !isDark

                set({ isDark: newDarkMode })

                if (newDarkMode) {
                    // Whenever the user explicitly chooses dark mode
                    localStorage.theme = "dark"
                    document.documentElement.classList.add('dark')
                } else {
                    // Whenever the user explicitly chooses light mode
                    localStorage.theme = "light"
                    document.documentElement.classList.remove('dark')
                }
            },

            // 시스템 설정으로 리셋
            resetToSystem: () => {
                // Whenever the user explicitly chooses to respect the OS preference
                localStorage.removeItem("theme")

                const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
                set({ isDark: systemPrefersDark })

                if (systemPrefersDark) {
                    document.documentElement.classList.add('dark')
                } else {
                    document.documentElement.classList.remove('dark')
                }
            },

            // 강제 설정
            setDark: (isDark) => {
                set({ isDark })

                if (isDark) {
                    localStorage.theme = "dark"
                    document.documentElement.classList.add('dark')
                } else {
                    localStorage.theme = "light"
                    document.documentElement.classList.remove('dark')
                }
            }
        }),
        {
            name: 'dark-mode-storage', // localStorage 키
            partialize: (state) => ({ isDark: state.isDark }), // 저장할 상태만 선택
        }
    )
)

export default useDarkModeStore 
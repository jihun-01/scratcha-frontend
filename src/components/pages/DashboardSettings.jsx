import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Modal from '../ui/Modal';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../services/api';
import { validateUserName } from '../../utils/validators';

export default function DashboardSettings() {
    const {
        apps,
        selectedAppId,
        selectApp,
        updateAppSettings,
        refreshApplications,
        isAppsLoading,
    } = useDashboardStore();

    const { user, updateUser, logout } = useAuth();

    const getServerUserName = (u) => (u?.userName ?? u?.username ?? u?.name ?? u?.email ?? '');

    // const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // 비밀번호 변경 폼 (주석처리)
    // const [passwordForm, setPasswordForm] = useState({
    //     currentPassword: '',
    //     newPassword: '',
    //     confirmPassword: ''
    // });

    // 이름 변경 폼
    const [nameForm, setNameForm] = useState({
        currentName: getServerUserName(user),
        newName: ''
    });
    // 비밀번호 UI용 상태 (API 미연동)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // 초기 앱 목록 로드
    useEffect(() => {
        (async () => {
            try {
                await refreshApplications();
            } catch (e) {
                console.error('❌ 앱 목록 로드 실패:', e);
            }
        })();
    }, [refreshApplications]);

    // 사용자 정보가 변경될 때마다 이름 폼 업데이트
    useEffect(() => {
        console.log('🔍 사용자 정보 확인:', user);
        const serverName = getServerUserName(user);
        if (serverName) {
            console.log('✅ 사용자 이름 업데이트:', serverName);
            setNameForm(prev => ({
                ...prev,
                currentName: serverName
            }));
        }
    }, [user]);

    // 임시 설정 상태 관리
    const [tempSettings, setTempSettings] = useState({});

    // 선택된 APP
    const selectedApp = apps.find(app => app.id === selectedAppId);

    // 현재 설정 (임시 설정이 있으면 임시 설정, 없으면 원본 설정)
    const currentSettings = selectedApp ? {
        ...selectedApp.settings,
        ...tempSettings[selectedApp.id]
    } : {};

    // 변경된 필드 하이라이트 감지
    // const changedModel = !!(selectedApp && tempSettings[selectedApp.id]?.model !== undefined && tempSettings[selectedApp.id]?.model !== selectedApp.settings.model);
    const changedNoise = !!(selectedApp && tempSettings[selectedApp.id]?.noiseLevel !== undefined && tempSettings[selectedApp.id]?.noiseLevel !== selectedApp.settings.noiseLevel);
    // const changedHeuristic = !!(selectedApp && tempSettings[selectedApp.id]?.heuristicLevel !== undefined && tempSettings[selectedApp.id]?.heuristicLevel !== selectedApp.settings.heuristicLevel);

    // 서비스 설정 옵션
    // const modelOptions = [
    //     { value: 'gpt-4', label: 'GPT-4 (고성능)' },
    //     { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (균형)' },
    //     { value: 'claude-3', label: 'Claude-3 (안정성)' },
    //     { value: 'custom', label: '커스텀 모델' }
    // ];

    const noiseLevelOptions = [
        { value: '상', label: '상 (높은 노이즈)' },
        { value: '중', label: '중 (보통 노이즈)' },
        { value: '하', label: '하 (낮은 노이즈)' }
    ];

    // const heuristicLevelOptions = [
    //     { value: '상', label: '상 (높은 휴리스틱)' },
    //     { value: '중', label: '중 (보통 휴리스틱)' },
    //     { value: '하', label: '하 (낮은 휴리스틱)' },
    //     { value: '없음', label: '없음 (휴리스틱 비활성화)' }
    // ];

    // 설정 적용 처리
    const handleApplySettings = () => {
        if (selectedApp && tempSettings[selectedApp.id]) {
            // 실제 APP 설정 업데이트
            updateAppSettings(selectedApp.id, tempSettings[selectedApp.id]);

            // 임시 설정 제거
            setTempSettings(prev => {
                const newTemp = { ...prev };
                delete newTemp[selectedApp.id];
                return newTemp;
            });

            // TODO: 실제 API 호출로 설정 적용
            console.log('설정 적용:', tempSettings[selectedApp.id]);
            setSaveSuccess(true);
            // 성공 배너 자동 숨김 (3초)
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    // APP 설정 변경 (임시 저장)
    const handleAppSettingChange = (field, value) => {
        if (selectedApp) {
            setSaveSuccess(false);
            setTempSettings(prev => ({
                ...prev,
                [selectedApp.id]: {
                    ...prev[selectedApp.id],
                    [field]: value
                }
            }));
        }
    };

    // 이름 변경 처리
    const handleNameChange = async (e) => {
        e.preventDefault();
        console.log('이름 변경:', nameForm);

        const trimmedName = nameForm.newName.trim();

        // 유효성 검사
        if (!trimmedName) {
            alert('새 이름을 입력해주세요.');
            return;
        }

        const { isValid, error } = validateUserName(trimmedName);
        if (!isValid) {
            alert(error);
            return;
        }

        setIsUpdating(true);
        try {
            console.log('🔄 이름 변경 API 호출 중...');
            const response = await authAPI.updateUsername(trimmedName);
            console.log('✅ 이름 변경 성공:', response.data);

            // 로컬 상태 업데이트
            updateUser({ userName: trimmedName, username: trimmedName, name: trimmedName });

            // 유저 정보 다시 불러오기 제거 (무한 호출 방지)
            console.log('✅ 이름 변경 완료 - 로컬 상태 업데이트됨');

            setIsNameModalOpen(false);
            setNameForm({
                currentName: trimmedName,
                newName: ''
            });

            alert('이름이 성공적으로 변경되었습니다!');
        } catch (error) {
            console.error('❌ 이름 변경 실패:', error);

            let errorMessage = '이름 변경에 실패했습니다.';
            if (error.response?.status === 409) {
                errorMessage = '이미 사용 중인 이름입니다.';
            } else if (error.response?.status === 422) {
                errorMessage = '입력 정보를 확인해주세요.';
            }

            alert(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    // 비밀번호 변경 처리 (주석처리)
    // const handlePasswordChange = (e) => {
    //     e.preventDefault();
    //     console.log('비밀번호 변경:', passwordForm);
    //     setIsPasswordModalOpen(false);
    //     setPasswordForm({
    //         currentPassword: '',
    //         newPassword: '',
    //         confirmPassword: ''
    //     });
    // };

    // 회원 탈퇴 처리
    const handleAccountDelete = async () => {
        console.log('🗑️ 회원 탈퇴 시도');

        setIsDeleting(true);
        try {
            console.log('🔄 회원 탈퇴 API 호출 중...');
            const response = await authAPI.deleteAccount();
            console.log('✅ 회원 탈퇴 성공:', response.data);

            // 프론트엔드에서만 로그아웃 처리 (백엔드 API 없음)
            console.log('🔒 회원 탈퇴 후 프론트엔드 로그아웃 처리');
            await logout();

            // 모달 닫기
            setIsDeleteModalOpen(false);

            // 성공 메시지
            alert('회원 탈퇴가 완료되었습니다. 로그인 페이지로 이동합니다.');
            console.log('✅ 회원 탈퇴 완료');

        } catch (error) {
            console.error('❌ 회원 탈퇴 실패:', error);

            let errorMessage = '회원 탈퇴에 실패했습니다.';
            if (error.response?.status === 401) {
                errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
            } else if (error.response?.status === 403) {
                errorMessage = '권한이 없습니다.';
            }

            alert(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    // 설정 상태 텍스트 생성 (원본 설정 기준)
    const getSettingsText = (app) => {        // const model = modelOptions.find(opt => opt.value === app.settings.model)?.label.split(' ')[0] || app.settings.model;
        return `노이즈: ${app.settings.noiseLevel}`;
    };

    // 임시 설정이 있는지 확인
    const hasTempSettings = selectedApp && tempSettings[selectedApp.id];

    return (
        <DashboardLayout
            title="설정"
            subtitle="APP 서비스 및 계정 설정을 관리하세요"
        >
            <div className="space-y-8">
                {/* APP 설정 + My Scratcha 설정 (2컬럼) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 좌측: APP 설정 */}
                    <div className="p-6 rounded-lg theme-card">
                        <h3 className="text-xl font-semibold theme-text-primary mb-6">APP 설정</h3>
                        <div className="space-y-3">
                            {isAppsLoading && (
                                <div className="text-center py-6">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</p>
                                </div>
                            )}
                            {!isAppsLoading && apps.length === 0 && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">등록된 APP이 없습니다.</div>
                            )}
                            {!isAppsLoading && apps.map((app) => (
                                <div
                                    key={app.id}
                                    onClick={() => selectApp(selectedAppId === app.id ? null : app.id)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedAppId === app.id
                                        ? 'border-blue-600 dark:border-blue-500 bg-blue-100 dark:bg-blue-900/20'
                                        : 'theme-card hover:border-blue-400 dark:hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-medium theme-text-primary">{app.name}</h5>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {app.status === 'active' ? '활성' : '비활성'}
                                        </span>
                                    </div>
                                    <p className="text-sm theme-text-secondary mb-2">{app.description}</p>
                                    <div className="space-y-2">
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">현재 설정:</span> {getSettingsText(app)}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                            <span>생성일: {app.createdAt}</span>
                                            <span>오늘: {Math.round(app.usage.today / 20)}회 ({app.usage.today} 토큰)</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 우측: My Scratcha 설정 */}
                    <div className="p-6 rounded-lg theme-card flex flex-col min-h-[420px]">
                        {selectedApp && (
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold theme-text-primary">My Scratcha 설정</h3>
                                <button
                                    onClick={handleApplySettings}
                                    disabled={!hasTempSettings}
                                    className={`px-4 py-2 rounded-lg font-semibold transition ${hasTempSettings
                                        ? 'bg-blue-600 dark:bg-blue-500 text-white hover:opacity-90'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    설정 저장
                                </button>
                            </div>
                        )}
                        {selectedApp ? (
                            <div>
                                {/* 변경 경고는 하단으로 이동 */}

                                <div className="space-y-6">
                                    {/* APP 캡차 서비스 모델 설정 - 임시 주석 처리 */}
                                    {/* <div>
                                        <div className="flex items-center gap-2">
                                            <label className="block text-sm font-medium theme-text-primary">
                                                APP 캡차 서비스 모델
                                            </label>
                                            <div className="relative group">
                                                <button
                                                    type="button"
                                                    className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs"
                                                    aria-label="도움말"
                                                >
                                                    ?
                                                </button>
                                                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute z-10 left-6 top-1 w-64 px-3 py-2 rounded-md bg-gray-900 text-gray-100 text-xs shadow-lg border border-gray-700 whitespace-normal break-words text-left transition-opacity duration-150">
                                                    모델을 선택하면 해당 모델 엔진으로 캡차 검증을 수행합니다. 성능/비용을 고려해 선택하세요.
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm theme-text-secondary mt-1 mb-2">
                                            캡차 검증에 사용할 AI 모델을 선택하세요
                                        </p>
                                        <select
                                            value={currentSettings.model || selectedApp.settings.model}
                                            onChange={(e) => handleAppSettingChange('model', e.target.value)}
                                            className={`w-full px-3 py-2 theme-input focus:outline-none focus:ring-2 ${changedModel
                                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent'
                                                }`}
                                        >
                                            {modelOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div> */}

                                    {/* 노이즈 강도 설정 */}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <label className="block text-sm font-medium theme-text-primary">
                                                노이즈 강도
                                            </label>
                                            <div className="relative group">
                                                <button
                                                    type="button"
                                                    className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs"
                                                    aria-label="도움말"
                                                >
                                                    ?
                                                </button>
                                                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute z-10 left-6 top-1 w-64 px-3 py-2 rounded-md bg-gray-900 text-gray-100 text-xs shadow-lg border border-gray-700 whitespace-normal break-words text-left transition-opacity duration-150">
                                                    노이즈가 높을수록 자동화 공격 저항성이 증가하지만 사용자 경험이 떨어질 수 있습니다.
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm theme-text-secondary mt-1 mb-2">
                                            캡차 이미지에 적용할 노이즈 강도를 설정하세요
                                        </p>
                                        <select
                                            value={currentSettings.noiseLevel || selectedApp.settings.noiseLevel}
                                            onChange={(e) => handleAppSettingChange('noiseLevel', e.target.value)}
                                            className={`w-full px-3 py-2 theme-input focus:outline-none focus:ring-2 ${changedNoise
                                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent'
                                                }`}
                                        >
                                            {noiseLevelOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 휴리스틱 강도 설정 - 임시 주석 처리 */}
                                    {/* <div>
                                        <div className="flex items-center gap-2">
                                            <label className="block text-sm font-medium theme-text-primary">
                                                휴리스틱 강도
                                            </label>

                                            <div className="relative group">
                                                <button
                                                    type="button"
                                                    className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs"
                                                    aria-label="도움말"
                                                >
                                                    ?
                                                </button>
                                                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute z-10 left-6 top-1 w-64 px-3 py-2 rounded-md bg-gray-900 text-gray-100 text-xs shadow-lg border border-gray-700 whitespace-normal break-words text-left transition-opacity duration-150">
                                                    휴리스틱은 추가 규칙 기반 검사를 수행합니다. 상으로 갈수록 오탐지 가능성도 증가할 수 있습니다.
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm theme-text-secondary mt-1 mb-2">
                                            캡차 검증에 사용할 휴리스틱 알고리즘의 강도를 설정하세요
                                        </p>
                                        <select
                                            value={currentSettings.heuristicLevel || selectedApp.settings.heuristicLevel}
                                            onChange={(e) => handleAppSettingChange('heuristicLevel', e.target.value)}
                                            className={`w-full px-3 py-2 theme-input focus:outline-none focus:ring-2 ${changedHeuristic
                                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent'
                                                }`}
                                        >
                                            {heuristicLevelOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div> */}

                                    {hasTempSettings && (
                                        <div className="mt-6 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                                            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86l-8.4 14.55A1.5 1.5 0 003.1 21h17.8a1.5 1.5 0 001.21-2.59L13.71 3.86a1.5 1.5 0 00-2.42 0z" />
                                            </svg>
                                            <span>아직 저장되지 않은 변경사항이 있습니다.</span>
                                        </div>
                                    )}
                                    {saveSuccess && !hasTempSettings && (
                                        <div className="mt-3 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-2">
                                            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>설정이 성공적으로 저장되었습니다.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-600 dark:text-gray-400">설정할 APP을 선택해주세요</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 회원 설정 */}
                <div className="p-6 rounded-lg theme-card">
                    <h3 className="text-xl font-semibold theme-text-primary mb-6">회원 설정</h3>

                    <div className="space-y-4">
                        {/* 이름 변경 */}
                        <div className="flex items-center justify-between p-4 theme-layout-secondary rounded-lg">
                            <div>
                                <h4 className="font-medium theme-text-primary">회원 정보 수정</h4>
                                <p className="text-sm theme-text-secondary">현재 이름 : {getServerUserName(user) || '설정되지 않음'}</p>
                            </div>
                            <button
                                onClick={() => {
                                    const serverName = getServerUserName(user);
                                    setNameForm(prev => ({ ...prev, currentName: serverName, newName: serverName }));
                                    setIsNameModalOpen(true);
                                }}
                                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                            >
                                변경하기
                            </button>
                        </div>

                        {/* 비밀번호 변경 (주석처리) */}
                        {/* <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">비밀번호 변경</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">계정 보안을 위해 정기적으로 비밀번호를 변경하세요</p>
                            </div>
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                            >
                                변경하기
                            </button>
                        </div> */}

                        {/* 회원 탈퇴 */}
                        <div className="flex items-center justify-between p-4 theme-layout-secondary rounded-lg">
                            <div>
                                <h4 className="font-medium theme-text-primary">회원 탈퇴</h4>
                                <p className="text-sm theme-text-secondary">계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다</p>
                            </div>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                            >
                                탈퇴하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 이름 변경 모달 */}
            <Modal
                isOpen={isNameModalOpen}
                onClose={() => setIsNameModalOpen(false)}
                title="회원 정보 수정"
                centerTitle
                hideClose
                borderless
                titleClassName="text-2xl md:text-3xl"
                headerClassName="pt-4 pb-2 px-6"
                bodyClassName="pt-2 pb-6 px-6"
            >
                <form onSubmit={handleNameChange} className="space-y-4">
                    {/* 아바타 */}
                    <div className="flex justify-center mt-0">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200">
                            {getServerUserName(user).charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>

                    {/* 아이디(이메일) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">아이디 (이메일)</label>
                        <input
                            type="text"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none"
                        />
                    </div>

                    {/* 이름 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
                        <input
                            type="text"
                            value={nameForm.newName}
                            onChange={(e) => setNameForm(prev => ({ ...prev, newName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* 비밀번호 (UI만) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">비밀번호</label>
                        <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            placeholder="비밀번호를 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">새로운 비밀번호</label>
                        <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="새 비밀번호를 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">새로운 비밀번호 확인</label>
                        <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="새 비밀번호를 다시 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsNameModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                            disabled={isUpdating}
                        >
                            {isUpdating ? '변경 중...' : '변경하기'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* 비밀번호 변경 모달 (주석처리) */}
            {/* <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                title="비밀번호 변경"
            >
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            현재 비밀번호
                        </label>
                        <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            새 비밀번호
                        </label>
                        <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            새 비밀번호 확인
                        </label>
                        <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                        >
                            변경하기
                        </button>
                    </div>
                </form>
            </Modal> */}

            {/* 회원 탈퇴 확인 모달 (리디자인) */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="회원 탈퇴"
                centerTitle
                hideClose
                borderless
                headerClassName="pt-4 pb-2 px-6"
                bodyClassName="pt-2 pb-6 px-6"
            >
                <div className="space-y-5">
                    {/* 경고 박스 */}
                    <div className="p-4 rounded-lg border border-red-300 bg-red-50">
                        <div className="flex items-center gap-2 text-red-700 font-semibold">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-8.4 14.55A1.5 1.5 0 003.1 21h17.8a1.5 1.5 0 001.21-2.59L13.71 3.86a1.5 1.5 0 00-2.42 0z" />
                            </svg>
                            <span>회원 탈퇴 전 꼭 확인하세요</span>
                        </div>
                        <ul className="mt-3 text-sm text-red-700 list-disc pl-5 space-y-1">
                            <li>탈퇴 후 30일간 데이터 보관, 이후 완전 삭제되어 복구 불가</li>
                            <li>남은 토큰은 환불·이전 불가 (30일 경과 시 즉시 소멸)</li>
                            <li>30일 이내 복구 시 문의 절차 필수</li>
                            <li>탈퇴 시, 모든 데이터와 권한이 사라집니다</li>
                        </ul>
                    </div>

                    {/* 확인 문구 */}
                    <div className="text-center text-gray-900 dark:text-white leading-relaxed">
                        <p>정말로 회원탈퇴를 진행 하시겠습니까?</p>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">이 작업은 되돌릴 수 없습니다.</p>
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1 px-4 py-2 rounded-lg font-semibold bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleAccountDelete}
                            className="flex-1 px-4 py-2 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition"
                            disabled={isDeleting}
                        >
                            {isDeleting ? '탈퇴 중...' : '탈퇴하기'}
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
} 
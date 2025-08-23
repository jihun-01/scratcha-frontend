import React from 'react';
import { Link } from 'react-router-dom';
import { ScratchaWidget } from "scratcha-sdk";

export default function Demo() {


    return (
        <div className="min-h-screen theme-layout">
            <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold theme-text-primary mb-6">
                        데모 체험
                    </h1>
                    <p className="text-xl md:text-2xl theme-text-secondary mb-8 max-w-3xl mx-auto">
                        Scratcha 캡차의 실제 동작을 직접 체험해보세요
                    </p>
                </div>

                {/* Demo Section */}
                <div className="flex justify-center">
                    <ScratchaWidget
                        apiKey="your-api-key"
                        endpoint=""
                        mode="demo"
                        onSuccess={(result) => console.log("성공:", result)}
                        onError={(error) => console.error("오류:", error)}
                    />
                </div>
            </div>
        </div>
    );
} 

import React from 'react';
import { motion } from 'framer-motion';

const CreditsExhaustedPage: React.FC = () => {
    return (
        <div
            className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4 font-sans selection:bg-white selection:text-black"
            style={{ backgroundColor: '#000000', color: '#ffffff' }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <svg
                    aria-label="Vercel Logo"
                    fill="white"
                    viewBox="0 0 75 65"
                    height="64"
                    width="64"
                    className="mx-auto"
                >
                    <path d="M37.59.25l36.95 64H.64l36.95-64z" />
                </svg>
            </motion.div>
            <div className="text-center space-y-6 max-w-[480px]">
                <h1 className="text-[32px] font-bold tracking-tight">
                    Deployment Credits Exhausted
                </h1>
                <p className="text-[#888888] text-[16px] leading-relaxed">
                    Your deployment credits have been exhausted. Please purchase additional credits to continue accessing this service and restore full functionality.
                </p>
                <div className="text-[#666666] text-[14px] pt-2">
                    <p>Error Code: CREDITS_EXHAUSTED</p>
                </div>
            </div>
        </div>
    );
};

export default CreditsExhaustedPage;

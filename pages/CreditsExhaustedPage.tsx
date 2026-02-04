
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CreditCard, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CreditsExhaustedPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            >
                {/* Header Section with Alert Icon */}
                <div className="bg-red-50 p-8 flex justify-center items-center flex-col border-b border-red-100">
                    <motion.div
                        initial={{ scale: 0.8, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.2
                        }}
                        className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4"
                    >
                        <ShieldAlert className="w-10 h-10 text-red-600" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-gray-900 text-center">
                        Deployment Credits Exhausted
                    </h1>
                </div>

                {/* Content Section */}
                <div className="p-8 space-y-6">
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-100 flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-orange-800">
                            Your deployment credits have been exhausted. Please purchase additional credits to continue accessing this service and restore full functionality.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                            <span className="font-medium">Error Code</span>
                            <code className="font-mono text-red-600 font-bold bg-red-50 px-2 py-1 rounded">CREDITS_EXHAUSTED</code>
                        </div>

                        <p className="text-gray-600 text-center text-sm">
                            Upgrade your plan now to immediately restore access to your deployment and analytics features.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-2">
                        <button
                            onClick={() => window.location.href = '#upgrade'} // Replace with actual payment link
                            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                        >
                            <CreditCard className="w-5 h-5" />
                            <span>Purchase Credits</span>
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full flex items-center justify-center space-x-2 bg-white text-gray-600 hover:text-gray-900 font-medium py-3 px-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                        >
                            <span>Return to Home</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Footer Support Link */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-sm text-gray-400"
            >
                Need help? <a href="#support" className="text-blue-600 hover:text-blue-700 underline">Contact Support</a>
            </motion.p>
        </div>
    );
};

export default CreditsExhaustedPage;

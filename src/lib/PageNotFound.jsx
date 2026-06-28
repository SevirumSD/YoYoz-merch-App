import React from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Home } from 'lucide-react';

export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
            <div className="max-w-md w-full p-8 bg-zinc-950 rounded-2xl border border-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                <div className="text-center space-y-6">
                    {/* 404 Error Code */}
                    <div className="space-y-2">
                        <h1 className="text-7xl font-black tracking-tighter text-red-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>404</h1>
                        <div className="h-[2px] w-16 bg-red-600/50 mx-auto"></div>
                    </div>
                    
                    {/* Main Message */}
                    <div className="space-y-3">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Page Not Found
                        </h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            The page <span className="font-bold text-red-500">"/{pageName}"</span> could not be found.
                        </p>
                    </div>
                    
                    {/* Admin Note */}
                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-950/40 border border-red-900/50 flex items-center justify-center mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                </div>
                                <div className="text-left space-y-1">
                                    <p className="text-xs font-bold text-white uppercase tracking-wider">Admin Note</p>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        This could mean that the AI hasn't implemented this page yet. Ask it to implement it in the chat.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Action Button */}
                    <div className="pt-4">
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="inline-flex items-center px-6 py-3 text-xs font-black uppercase tracking-wider text-red-500 bg-red-950/20 border border-red-900/30 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 focus:outline-none"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
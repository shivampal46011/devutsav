import React from 'react';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
            <div className="fixed inset-0 grainy-bg z-[100] pointer-events-none"></div>
            <TopBar />
            <div className="pt-24 pb-32">
                {children}
            </div>
            <BottomNav />
        </div>
    );
};

export default Layout;

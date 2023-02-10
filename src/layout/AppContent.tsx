import React, { useEffect, cloneElement } from 'react';

import { AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

import BrandImg from '@assets/skupper-logo-full.svg';
import { DEFAULT_VIEW } from 'config';

interface AppContentProps {
    children: React.ReactElement;
}

const AppContent = function ({ children }: AppContentProps) {
    const navigate = useNavigate();
    const { pathname, key } = useLocation();

    useEffect(() => {
        if (pathname === '/') {
            navigate(DEFAULT_VIEW);
        }
    }, [pathname, navigate]);

    return (
        <div className="pf-u-px-md pf-u-py-md" style={{ flex: 1 }}>
            <img src={BrandImg} alt="skupper brand" className="sk-main" />
            <AnimatePresence mode="wait">{cloneElement(children, { key })}</AnimatePresence>
        </div>
    );
};

export default AppContent;

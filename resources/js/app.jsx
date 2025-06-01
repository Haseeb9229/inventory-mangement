import React, { useEffect } from "react";
import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = 'InvenTrack';

// Create favicon link element
const createFavicon = () => {
    // Remove any existing favicon
    const existingFavicon = document.querySelector("link[rel*='icon']");
    if (existingFavicon) {
        existingFavicon.remove();
    }

    // Create new favicon link
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = '/images/cube-icon.svg';
    document.head.appendChild(link);
};

// Wrapper component to handle favicon
const AppWrapper = ({ children }) => {
    useEffect(() => {
        createFavicon();
    }, []);

    return children;
};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <AppWrapper>
                <App {...props} />
            </AppWrapper>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

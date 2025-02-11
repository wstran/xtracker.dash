import { createSlice } from '@reduxjs/toolkit';
import themeConfig from '../theme.config';

const initialState = {
    theme: themeConfig.theme,
    menu: themeConfig.menu,
    layout: themeConfig.layout,
    rtlClass: themeConfig.rtlClass,
    animation: themeConfig.animation,
    navbar: themeConfig.navbar,
    locale: themeConfig.locale,
    sidebar: false
};

const configSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        toggleTheme(state, { payload }) {
            payload = payload || state.theme;
            localStorage.setItem('theme', payload);
            state.theme = payload;

            if (state.theme === 'dark') {
                document.querySelector('body')?.classList.add('dark');
            } else {
                document.querySelector('body')?.classList.remove('dark');
            }
        },
        toggleSidebar(state) {
            state.sidebar = !state.sidebar;
        },
        toggleMenu(state, { payload }) {
            payload = payload || state.menu; // vertical, collapsible-vertical, horizontal
            state.sidebar = false; // reset sidebar state
            localStorage.setItem('menu', payload);
            state.menu = payload;
        },
        toggleLayout(state, { payload }) {
            payload = payload || state.layout; // full, boxed-layout
            localStorage.setItem('layout', payload);
            state.layout = payload;
        },
        toggleRTL(state, { payload }) {
            payload = payload || state.rtlClass; // rtl, ltr
            localStorage.setItem('rtlClass', payload);
            state.rtlClass = payload;
            document.querySelector('html')?.setAttribute('dir', state.rtlClass || 'ltr');
        },
        toggleAnimation(state, { payload }) {
            payload = payload || state.animation; // animate__fadeIn, animate__fadeInDown, animate__fadeInUp, animate__fadeInLeft, animate__fadeInRight, animate__slideInDown, animate__slideInLeft, animate__slideInRight, animate__zoomIn
            payload = payload?.trim();
            localStorage.setItem('animation', payload);
            state.animation = payload;
        },
        toggleNavbar(state, { payload }) {
            payload = payload || state.navbar; // navbar-sticky, navbar-floating, navbar-static
            localStorage.setItem('navbar', payload);
            state.navbar = payload;
        },
        setPageTitle(state, { payload }) {
            document.title = `${payload} | Elysi AI`;
        },
    },
});

export const { toggleTheme, toggleSidebar, toggleMenu, toggleLayout, toggleRTL, toggleAnimation, toggleNavbar, setPageTitle } = configSlice.actions;

export default configSlice.reducer;

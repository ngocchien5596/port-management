import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/features/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            colors: {
                brand: {
                    DEFAULT: 'rgb(var(--vt-primary) / <alpha-value>)',
                    hover: 'rgb(var(--vt-primary-hover) / <alpha-value>)',
                    pressed: 'rgb(var(--vt-primary-pressed) / <alpha-value>)',
                    soft: 'rgb(var(--vt-primary-soft) / <alpha-value>)',
                    soft2: 'rgb(var(--vt-primary-soft2) / <alpha-value>)',
                },
                vttext: {
                    primary: 'rgb(var(--vt-text-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--vt-text-secondary) / <alpha-value>)',
                    muted: 'rgb(var(--vt-text-muted) / <alpha-value>)',
                    inverse: 'rgb(var(--vt-text-inverse) / <alpha-value>)',
                },
                surface: {
                    bg: 'rgb(var(--vt-bg) / <alpha-value>)',
                    1: 'rgb(var(--vt-surface) / <alpha-value>)',
                    2: 'rgb(var(--vt-surface2) / <alpha-value>)',
                },
                vtborder: {
                    DEFAULT: 'rgb(var(--vt-border) / <alpha-value>)',
                    divider: 'rgb(var(--vt-divider) / <alpha-value>)',
                },
                state: {
                    success: 'rgb(var(--vt-success) / <alpha-value>)',
                    greenSoft: 'rgb(var(--vt-success-soft) / <alpha-value>)',
                    warning: 'rgb(var(--vt-warning) / <alpha-value>)',
                    amberSoft: 'rgb(var(--vt-warning-soft) / <alpha-value>)',
                    danger: 'rgb(var(--vt-danger) / <alpha-value>)',
                    redSoft: 'rgb(var(--vt-danger-soft) / <alpha-value>)',
                    info: 'rgb(var(--vt-info) / <alpha-value>)',
                    blueSoft: 'rgb(var(--vt-info-soft) / <alpha-value>)',
                },
                focus: {
                    DEFAULT: 'rgb(var(--vt-focus))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                success: {
                    DEFAULT: 'hsl(142, 76%, 36%)',
                    foreground: 'hsl(0, 0%, 100%)',
                },
                warning: {
                    DEFAULT: 'hsl(38, 92%, 50%)',
                    foreground: 'hsl(0, 0%, 100%)',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};

export default config;

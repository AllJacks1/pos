import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: "#2563EB",
                secondary: "#4F46E5",
                accent: "#10B981",
                background: "#F8FAFC",
                surface: "#FFFFFF",
                border: "#E2E8F0",
                text: "#0F172A",
            }
        },
    },
    plugins: [],
}

export default config


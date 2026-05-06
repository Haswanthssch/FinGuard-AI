/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA', // Vercel/Linear off-white
        surface: '#FFFFFF', // Pure white cards
        surfaceHighlight: '#F4F5F7', // Soft gray for hover/active states
        border: '#EAEAEA', // Extremely subtle borders
        borderHighlight: '#D1D5DB', // Slightly darker for focus states
        
        primary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9', // Soft fintech blue
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
        },
        accent: {
          cyan: '#06B6D4',
          indigo: '#6366F1',
          emerald: '#10B981', // Elegant emerald for success
          amber: '#F59E0B', // Soft amber for warning
          rose: '#F43F5E' // Muted red for danger
        },
        text: {
          primary: '#111827', // Crisp dark gray, not pure black
          secondary: '#4B5563', // Soft secondary text
          muted: '#9CA3AF', // Muted text for low emphasis
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)', // Stripe-like crisp subtle shadow
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)', // Soft elevation lift
        'dropdown': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        'glow-primary': '0 0 0 2px rgba(14, 165, 233, 0.2)', // Focus rings
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}

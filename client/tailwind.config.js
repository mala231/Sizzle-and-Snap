/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT:   '#a20000',
          container: '#d00000',
          fixed:     '#ffdad4',
          'fixed-dim': '#ffb4a8',
        },
        secondary: {
          DEFAULT:   '#904d00',
          container: '#fd8b00',
          fixed:     '#ffdcc3',
          'fixed-dim': '#ffb77d',
        },
        tertiary: {
          DEFAULT:   '#705d00',
          container: '#c9a900',
          fixed:     '#ffe16d',
          'fixed-dim': '#e9c400',
        },
        surface: {
          DEFAULT:   '#fcf9f8',
          dim:       '#dcd9d9',
          bright:    '#fcf9f8',
          lowest:    '#ffffff',
          low:       '#f6f3f2',
          container: '#f0edec',
          high:      '#ebe7e7',
          highest:   '#e5e2e1',
        },
        error: {
          DEFAULT:   '#ba1a1a',
          container: '#ffdad6',
        },
        outline: {
          DEFAULT:  '#936e69',
          variant:  '#e8bdb6',
        },
        status: {
          pending:   '#fd8b00',
          ready:     '#1a6b2a',
          completed: '#3a3a3a',
          'sold-out': '#ba1a1a',
        },
        // Mapped "on" colors for premium typography contrast
        'on-primary': '#ffffff',
        'on-primary-container': '#ffded9',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#603100',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#4c3e00',
        'on-background': '#1c1b1b',
        'on-surface': '#1c1b1b',
        'on-surface-variant': '#5e3f3a',
      },
      borderRadius: {
        sm:      '0.25rem',
        DEFAULT: '0.5rem',
        md:      '0.75rem',
        lg:      '1rem',
        xl:      '1.5rem',
        full:    '9999px',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg':        ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg-mobile': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg':       ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'headline-lg-mobile':['24px', { lineHeight: '32px', fontWeight: '700' }],
        'title-md':          ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg':           ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md':           ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md':          ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'label-sm':          ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      spacing: {
        xs:   '4px',
        sm:   '8px',
        md:   '16px',
        lg:   '24px',
        xl:   '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      boxShadow: {
        card:  '0px 4px 20px rgba(0,0,0,0.05), 0px 0px 0px 1px #eeeeee',
        hover: '0px 8px 32px rgba(0,0,0,0.10), 0px 0px 0px 1px #e0e0e0',
        modal: '0px 24px 64px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
}

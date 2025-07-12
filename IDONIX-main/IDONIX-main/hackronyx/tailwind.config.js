extend: {
  animation: {
    fadeInLeft: 'fadeInLeft 0.4s ease-out',
    fadeInRight: 'fadeInRight 0.4s ease-out',
  },
  keyframes: {
    fadeInLeft: {
      '0%': { opacity: '0', transform: 'translateX(-20px)' },
      '100%': { opacity: '1', transform: 'translateX(0)' },
    },
    fadeInRight: {
      '0%': { opacity: '0', transform: 'translateX(20px)' },
      '100%': { opacity: '1', transform: 'translateX(0)' },
    },
  },
}

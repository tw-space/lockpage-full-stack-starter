// stitches.config.js
import { createStitches } from '@stitches/react'

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    // https://system-ui.com/theme/
    // https://stitches.dev/docs/tokens
    colors: {
      black: '#000000',
      gray100: '#f3f4f6',
      placeholder: '#dadde3',
    },
    space: {},
    fontSizes: {},
    fonts: {},
    // fontWeights: {},
    lineHeights: {},
    letterSpacings: {},
    sizes: {},
    borderWidths: {},
    borderStyles: {},
    radii: {},
    shadows: {},
    zIndices: {},
    transitions: {},
  },
  media: {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    xxl: '(min-width: 1536px)',
  },
  utils: {
    //
    // Spacing, Layout
    //

    // container
    container: () => ({
      '@sm': { maxWidth: '640px' },
      '@md': { maxWidth: '768px' },
      '@lg': { maxWidth: '1024px' },
      '@xl': { maxWidth: '1280px' },
      '@xxl': { maxWidth: '1536px' },
    }),

    // margins
    marginX: (value) => ({
      marginLeft: value,
      marginRight: value,
    }),
    marginY: (value) => ({
      marginTop: value,
      marginBottom: value,
    }),

    // padding
    paddingX: (value) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
    paddingY: (value) => ({
      paddingTop: value,
      paddingBottom: value,
    }),

    // width/height together
    size: (value) => ({
      width: value,
      height: value,
    }),

    //
    // Typography
    //

    // font size
    fontPx: (value) => ({
      fontSize: `${value / 16}rem`,
    }),

    // font weight
    fontWeight: (value) => {
      switch (value) {
        case 'thin':
          return ({ 'font-weight': 100 })
        case 'extralight':
          return ({ 'font-weight': 200 })
        case 'light':
          return ({ 'font-weight': 300 })
        case 'normal':
          return ({ 'font-weight': 400 })
        case 'medium':
          return ({ 'font-weight': 500 })
        case 'semibold':
          return ({ 'font-weight': 600 })
        case 'bold':
          return ({ 'font-weight': 700 })
        case 'extrabold':
          return ({ 'font-weight': 800 })
        case 'black':
          return ({ 'font-weight': 900 })
        default:
          return ({ 'font-weight': value })
      }
    },

    // letter spacing
    tracking: (value) => {
      switch (value) {
        case 'tighter':
          return ({ 'letter-spacing': '-0.05em' })
        case 'tight':
          return ({ 'letter-spacing': '-0.025em' })
        case 'normal':
          return ({ 'letter-spacing': '0em' })
        case 'wide':
          return ({ 'letter-spacing': '0.025em' })
        case 'wider':
          return ({ 'letter-spacing': '0.05em' })
        case 'widest':
          return ({ 'letter-spacing': '0.1em' })
        default:
          return ({ 'letter-spacing': value })
      }
    },

    // truncate
    truncate: () => ({
      overflow: 'hidden',
      'text-overflow': 'ellipsis',
      'white-space': 'nowrap',
    }),

    // word break
    wordBreak: (value) => {
      switch (value) {
        case 'normal':
          return ({ 'overflow-wrap': 'normal', 'word-break': 'normal' })
        case 'words':
          return ({ 'overflow-wrap': 'break-word' })
        case 'all':
          return ({ 'word-break': 'break-all' })
        default:
          return ({ 'word-break': value })
      }
    },

    //
    // Layout
    //

    // flex
    flexing: (value) => {
      switch (value) {
        case 'full':
          return ({ flex: '1 1 0%' })
        case 'auto':
          return ({ flex: '1 1 auto' })
        case 'initial':
          return ({ flex: '0 1 auto' })
        case 'none':
          return ({ flex: 'none' })
        default:
          return ({})
      }
    },

    // grid template columns
    gridCols: (value) => ({
      'grid-template-columns': `repeat(${value}, minmax(0, 1fr))`,
    }),

    // grid column
    colSpan: (value) => {
      switch (value) {
        case 'auto':
          return ({ 'grid-column': 'auto' })
        case (value >= 1 && value <= 12):
          return ({ 'grid-column': `span ${value} / span ${value}` })
        case 'full':
          return ({ 'grid-column': '1 / -1' })
        default:
          return ({ 'grid-column': 'auto' })
      }
    },

    //
    // Misc
    //

    // linear gradient
    linearGradient: (value) => ({
      backgroundImage: `linear-gradient(${value})`,
    }),
  },
})

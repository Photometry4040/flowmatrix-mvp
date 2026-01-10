import type { Preview } from '@storybook/react-vite'
import '../client/src/index.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: 'oklch(0.08 0.01 260)',
        },
        {
          name: 'light',
          value: 'oklch(1 0 0)',
        },
      ],
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;
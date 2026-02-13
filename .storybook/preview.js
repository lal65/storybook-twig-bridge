// .storybook/preview.js

import '../app/node_modules/@psu-online-education/base/dist/styles.css';
import '../app/node_modules/@psu-online-education/heading/dist/styles.css';

// .storybook/preview.js
export const decorators = [
  (storyFn, context) => {
    document.body.removeAttribute('data-light');
    document.body.removeAttribute('data-dark');

    const color_profile = context.globals.backgrounds?.value;
    if (['light', 'dark'].includes(color_profile)) {
      document.body.setAttribute('data-' + color_profile, '');
    }

    return storyFn();
  },
];

export const parameters = {
  server: {
    url: window.location.origin + window.location.pathname.replace('index.html', '').replace('iframe.html', '') + 'app/twig'
  },
};

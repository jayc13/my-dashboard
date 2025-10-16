import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'My Dashboard Documentation',
  favicon: 'img/logo.png',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: (brokenMarkdownLink) => {
        console.warn('Broken markdown link:', brokenMarkdownLink);
        return ''; // Return empty string to ignore the broken link
      },
      onBrokenMarkdownImages: (brokenMarkdownImage) => {
        console.warn('Broken markdown image:', brokenMarkdownImage);
        return 'https://placehold.co/600x400/png?text=Image+Not+Found';
      },
    }
  },
  themes: ['@docusaurus/theme-mermaid'],
  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://jayc13.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/my-dashboard/',
  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'jayc13', // Usually your GitHub org/user name.
  projectName: 'my-dashboard', // Usually your repo name.

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/jayc13/my-dashboard',
        },
        blog: false,
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    image: 'img/logo.png',
    navbar: {
      title: 'My Dashboard Documentation',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          href: 'https://github.com/jayc13/my-dashboard',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} My Dashboard`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

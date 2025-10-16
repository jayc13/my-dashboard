import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
    homeSidebar: [
        {
            type: "doc",
            id: "index",
            label: '🏠 Home'
        },
        {
            type: "doc",
            id: "getting-started",
            label: '🚀 Getting Started'
        },
        {
            type: 'category',
            label: '🏗️ Architecture',
            collapsed: false,
            items: [
                'architecture/overview',
                'architecture/monorepo-structure',
                'architecture/client-architecture',
                'architecture/server-architecture',
                'architecture/cron-architecture',
                'architecture/database-schema',
                'architecture/security',
                'architecture/deployment',
            ],
        },
        {
            type: 'category',
            label: '💻 Development',
            collapsed: false,
            items: [
                'development/setup',
                'development/coding-standards',
                'development/git-workflow',
                'development/testing',
                'development/ci-cd',
                'development/contributing',
                'development/troubleshooting',
            ],
        },
        {
            type: 'category',
            label: '📦 TypeScript SDK',
            collapsed: false,
            items: [
                'sdk/overview',
                'sdk/installation',
                'sdk/authentication',
                'sdk/usage-examples',
            ],
        },
        {
            type: 'category',
            label: '🔌 API Reference',
            collapsed: false,
            items: [
                'api/overview',
                'api/authentication',
                'api/error-handling',
                {
                    type: 'category',
                    label: 'Endpoints',
                    collapsed: false,
                    items: [
                        'api/endpoints/applications',
                        'api/endpoints/e2e-reports',
                        'api/endpoints/jira',
                        'api/endpoints/notifications',
                        'api/endpoints/pull-requests',
                        'api/endpoints/todo-list',
                    ],
                },
            ],
        },
        {
            type: 'category',
            label: '📚 Resources',
            collapsed: false,
            items: [
                'others/agents',
                'others/faq',
                'others/glossary',
            ],
        }
    ],
};

export default sidebars;

module.exports = {
  description: 'Just playing around',
  //full url is "docs.mojaloop.io/pisp"
  base: '/pisp/',
  // theme: 'api',
  themeConfig: {
    home: true,
    // this file is copied out of `/public` for us
    logo: '/mojaloop_logo_med.png',
    repo: "mojaloop/pisp",
    editLinks: true,
    editLinkText: "Edit this page on GitHub",
    // TODO: make nice nav bar
    nav: [
      { text: 'Getting Started', link: '/overview/' },
      {
        text: 'Sequences',
        ariaLabel: 'Sequence Diagrams',
        items: [
          { text: 'Account Linking', link: '/linking/' },
          { text: 'Transfer', link: '/transfer/' }
        ]
      },
      {
        text: 'API Reference',
        link: '/guide/',
        items: [
          {
            text: 'Thirdparty-PISP API',
            items: [
              { text: 'PISP', link: '/api/thirdparty-pisp.html' },
            ],
          },
          {
            text: 'Thirdparty-DFSP API',
            items: [
              { text: 'DFSP', link: '/api/thirdparty-dfsp.html' }
            ],
          },
        ]
      },
      { text: 'Mojaloop Docs', link: 'https://docs.mojaloop.io/documentation' }
    ],
    displayAllHeaders: true,
    sidebar: [
      {
        title: 'Getting Started',
        collapsable: false, // optional, defaults to true
        sidebarDepth: 0,    // optional, defaults to 1
        children: [
          ['/overview', 'PISP Overview'],
          ['/background', 'Background'],
          ['/use_cases', 'Use Cases']
        ],
        // initialOpenGroupIndex: -1 // optional, defaults to 0, defines the index of initially opened subgroup
      },
      {
        title: 'Guides',
        children: [
          ['/guides/pisp_integration.html', 'PISP Integration Guide'],
          ['/guides/reference_pisp_app.html', 'PISP Reference App'],
          ['/guides/dfsp_integration.html', 'DFSP Integration Guide'],
        ]
      },
      {
        title: 'Sequence Diagrams',
        children: [
          ['/linking/', 'Account Linking Process'],
          ['/transfer/', 'Transfer Process']
        ]
      },
      {
        title: 'Design',
        children: [
          ['/design-decisions/', 'Design Decisions'],
          ['/roles_and_endpoints', 'Roles and Endpoints'],
          ['/identifiers', 'Identifiers'],
          ['/error_codes', 'Error Codes'],
        ]
      },
      {
        title: 'API Reference',
        children: [
          ['/api/thirdparty-pisp.html', 'Thirdparty-PISP API'],
          ['/api/thirdparty-dfsp.html', 'Thirdparty-DFSP API'],
        ]
      },
    ]
    // sidebar: [
    //   '/',
    //   '/page-a',
    //   ['/page-b', 'Explicit link text']
    // ]
  },
  plugins: [
    // Checks for broken links
    // https://github.com/ulivz/vuepress-plugin-check-md
    'check-md',

    // Allow nice zooming on images
    // https://vuepress.vuejs.org/plugin/official/plugin-medium-zoom.html#install
    '@vuepress/medium-zoom',

    // Beta - export site as PDF
    // https://github.com/ulivz/vuepress-plugin-export
    'vuepress-plugin-export'
  ],
  // I think we need this for swagger renderer...
  configureWebpack: (config, isServer) => {
    if (!isServer) {
      // mutate the config for client
      config.node.global = true;
      config.node.process = "mock";
      config.module.rules.push({
        test: /\.ya?ml$/,
        loader: "js-yaml-loader"
      });
    }
  }
}

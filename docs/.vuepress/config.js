module.exports = {
  description: 'Just playing around',
  //full url is "docs.mojaloop.io/pisp"
  base: '/pisp/',
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
              { text: 'PISP', link: '/linking/' },
            ],
          },
          {
            text: 'Thirdparty-DFSP API',
            items: [
              { text: 'DFSP', link: '/transfer/' }
            ],
          },
        ]
      },
      { text: 'Mojaloop Docs', link: 'https://docs.mojaloop.io/documentation' }
    ],
    displayAllHeaders: true,
    // TODO make nice sidebar
    sidebar: [
      {
        title: 'Overview',   // required
        collapsable: false, // optional, defaults to true
        sidebarDepth: 1,    // optional, defaults to 1
        children: [
          '/'
        ]
      },
      {
        title: 'Getting Started',
        children: [ /* ... */],
        initialOpenGroupIndex: -1 // optional, defaults to 0, defines the index of initially opened subgroup
      }
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
  ]
}

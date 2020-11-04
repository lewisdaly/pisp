module.exports = {
  description: 'Just playing around',
  //full url is "docs.mojaloop.io/pisp"
  base: '/pisp/',
  themeConfig: {
    // this is copied out of `/public` for us
    logo: '/mojaloop_logo_med.png',
    repo: "mojaloop/pisp",
    repoLabel: "Contribute",
    editLinks: true,
    editLinkText: "Edit this page on GitHub",
    // TODO: make nice nav bar
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Sequences', link: '/transfer/' },
      { text: 'API Reference', link: '/guide/' },
      { text: 'Mojaloop Docs', link: 'https://docs.mojaloop.io/documentation' }
    ],
    displayAllHeaders: true,
    // TODO make nice sidebar
    sidebar: [
      {
        title: 'Group 1',   // required
        path: '/foo/',      // optional, link of the title, which should be an absolute path and must exist
        collapsable: false, // optional, defaults to true
        sidebarDepth: 1,    // optional, defaults to 1
        children: [
          '/'
        ]
      },
      {
        title: 'Group 2',
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
    // https://github.com/ulivz/vuepress-plugin-check-md
    'check-md'
  ]
}

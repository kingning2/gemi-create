export default defineAppConfig({
  pages: [
    'pages/list/index',
    'pages/create/index',
    'pages/profile/index',
    'pages/detail/index',
    'pages/edit/index',
    'pages/preview/index',
    'pages/video/config/index',
    'pages/recharge/index',
    'pages/video/preview/index',
    // Add other pages here as they are created e.g.
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'AI Novel Generator',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: "#666",
    selectedColor: "#b4282d", // Example color
    backgroundColor: "#fafafa",
    borderStyle: 'black',
    list: [{
      pagePath: 'pages/list/index',
      text: 'Novel List',
      // iconPath: './assets/tabs/list.png', // Placeholder
      // selectedIconPath: './assets/tabs/list_active.png' // Placeholder
    }, {
      pagePath: 'pages/create/index',
      text: 'Create Novel',
      // iconPath: './assets/tabs/create.png', // Placeholder
      // selectedIconPath: './assets/tabs/create_active.png' // Placeholder
    }, {
      pagePath: 'pages/profile/index',
      text: 'Profile',
      // iconPath: './assets/tabs/profile.png', // Placeholder
      // selectedIconPath: './assets/tabs/profile_active.png' // Placeholder
    }]
  }
})

const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: true
  },
  redirect: '/main/dashboard/default',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    {
      name: 'LandingPage',
      path: '/',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      name: 'Default',
      path: '/dashboard/default',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      name: 'summary',
      path: '/summary',
      component: () => import('@/views/documents/summary.vue')
    },
    {
      name: 'views',
      path: '/views',
      component: () => import('@/views/documents/index.vue')
    },
    {
      name: 'about_us',
      path: '/about-us',
      component: () => import('@/views/documents/about_us.vue')
    },
    {
      name: 'contact',
      path: '/contact',
      component: () => import('@/views/documents/contact.vue')
    },
    {
      name: 'details',
      path: '/details/:id',
      component: () => import('@/views/documents/details.vue')
    }
    // {
    //   name: 'Starter',
    //   path: '/starter',
    //   component: () => import('@/views/StarterPage.vue')
    // },
    // {
    //   name: 'Tabler Icons',
    //   path: '/icons/tabler',
    //   component: () => import('@/views/utilities/icons/TablerIcons.vue')
    // },
    // {
    //   name: 'Material Icons',
    //   path: '/icons/material',
    //   component: () => import('@/views/utilities/icons/MaterialIcons.vue')
    // },
    // {
    //   name: 'Typography',
    //   path: '/utils/typography',
    //   component: () => import('@/views/utilities/typography/TypographyPage.vue')
    // },
    // {
    //   name: 'Shadows',
    //   path: '/utils/shadows',
    //   component: () => import('@/views/utilities/shadows/ShadowPage.vue')
    // },
    // {
    //   name: 'Colors',
    //   path: '/utils/colors',
    //   component: () => import('@/views/utilities/colors/ColorPage.vue')
    // }
  ]
};

export default MainRoutes;

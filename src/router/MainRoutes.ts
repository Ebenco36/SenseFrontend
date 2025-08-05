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
      component: () => import('@/views/dashboards/default/Dashboard.vue')
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
      name: 'multiple-review',
      path: '/multiple-review',
      component: () => import('@/views/documents/multiple_review.vue')
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
    },
    {
      name: 'single_page',
      path: '/single_page/:id',
      component: () => import('@/views/documents/single_page.vue')
    },
    {
      name: 'simple_table',
      path: '/simple_table',
      component: () => import('@/views/documents/simple_table.vue')
    },
    {
      name: 'summary_page',
      path: '/summary_page',
      component: () => import('@/views/documents/summary_page.vue')
    },
    {
      name: 'new_record',
      path: '/new_record',
      component: () => import('@/views/documents/new_record.vue')
    },
    {
      name: 'about_page',
      path: '/about_page',
      component: () => import('@/views/documents/about_page.vue')
    },
    {
      name: 'compare_record',
      path: '/compare_record',
      component: () => import('@/views/documents/compare_record.vue')
    },
    {
      name: 'record_details_page',
      path: '/record_details_page/:id',
      component: () => import('@/views/documents/record_details_page.vue')
    },
    {
      name: 'testing',
      path: '/testing/:id',
      component: () => import('@/views/documents/testing.vue')
    },
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

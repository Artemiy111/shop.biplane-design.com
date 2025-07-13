// import type { RouterConfig } from '@nuxt/schema'

// export default {
//   // https://router.vuejs.org/api/interfaces/routeroptions.html#routes
//   routes: _routes => [
//     {
//       name: 'home',
//       path: '/',
//       component: () => import('~/src/pages/home/home-page.vue'),
//     },
//     {
//       path: '/auth',
//       children: [
//         {
//           name: 'login',
//           path: '/login',
//           component: () => import('~/src/pages/auth/login-page.vue'),
//         },
//         {
//           name: 'register',
//           path: '/register',
//           component: () => import('~/src/pages/auth/register-page.vue'),
//         },
//         {
//           name: 'reset-password',
//           path: '/reset-password',
//           component: () => import('~/src/pages/auth/reset-password-page.vue'),
//         },
//         {
//           name: 'forget-password',
//           path: '/forget-password',
//           component: () => import('~/src/pages/auth/forget-password-page.vue'),
//         },
//       ],
//     },
//     {
//       name: 'catalog',
//       path: '/catalog',
//       component: () => import('~/src/pages/catalog/catalog-page.vue'),
//     },
//     {
//       path: '/admin',
//       children: [
//         {
//           name: 'admin/dashboard',
//           path: '/dashboard',
//           component: () => import('~/src/pages/admin/dashboard/dashboard-page.vue'),
//         },
//         {
//           name: 'models',
//           path: '/models',
//           component: () => import('~/src/pages/admin/models/models-page.vue'),
//         },
//         {
//           name: 'models',
//           path: '/models/:slug',
//           component: () => import('~/src/pages/admin/models/models-page.vue'),
//         },
//       ],
//     },
//     {
//       name: 'profile',
//       path: '/profile',
//       component: () => import('~/src/pages/profile/profile-page.vue'),
//     },
//   ],
// } satisfies RouterConfig

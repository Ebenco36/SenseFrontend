import {
  DashboardIcon,
  TableIcon,
  SumIcon,
  UserShareIcon,
  UserPinIcon,
  TagOffIcon
} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  icon?: object;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

const sidebarItem: menu[] = [
  // { header: 'Dashboard' },
  // { divider: true },
  {
    title: 'Home',
    icon: DashboardIcon,
    to: '/dashboard/default'
  },
  { divider: true },
  {
    title: 'Data Exploration',
    icon: TableIcon,
    to: '/views'
  },
  { divider: true },
  {
    title: 'Multiple Review',
    icon: TagOffIcon,
    to: '/multiple-review'
  },
  { divider: true },
  {
    title: 'Summary',
    icon: SumIcon,
    to: '/summary'
  },
  { divider: true },
  {
    title: 'Contact',
    icon: UserShareIcon,
    to: '/contact'
  },
  { divider: true },
  {
    title: 'About Us',
    icon: UserPinIcon,
    to: '/about-us'
  },
  { divider: true },
  {
    title: 'Test',
    icon: UserPinIcon,
    to: '/testing'
  }
  // { divider: true },
  // { header: 'Pages' },
  // {
  //   title: 'Authentication',
  //   icon: KeyIcon,
  //   to: '/auth',
  //   children: [
  //     {
  //       title: 'Login',
  //       icon: CircleIcon,
  //       to: '/auth/login'
  //     },
  //     {
  //       title: 'Register',
  //       icon: CircleIcon,
  //       to: '/auth/register'
  //     }
  //   ]
  // },
];

export default sidebarItem;

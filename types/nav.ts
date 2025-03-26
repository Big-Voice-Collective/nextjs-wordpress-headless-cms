export interface NavItem {
  title: string
  href: string
  disabled?: boolean
  external?: boolean
  label?: string
}

export interface NavItemWithChildren extends NavItem {
  items: NavItem[]
}

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItem {} 
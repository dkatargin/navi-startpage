export interface NaviLink {
  title: string
  url: string
  icon?: string
}

export interface NaviCategory {
  id: string
  label: string
  links: NaviLink[]
  collapsed?: boolean
}

export interface ThemePalette {
  backgroundColor: string
  textColor: string
  accentColor: string
  accentSecondary: string
  borderColor: string
}

export interface NaviTheme {
  mode: 'dark' | 'light' | 'system'
  dark: ThemePalette
  light: ThemePalette
  fontFamily: string
  fontSize: number
}

export interface NaviFeed {
  enabled: boolean
  url: string
  token: string
}

export interface NaviLayout {
  gridColumns: number
  feedCollapsed: boolean
}

export interface NaviConfig {
  categories: NaviCategory[]
  search: {
    fallbackUrl: string
  }
  theme: NaviTheme
  layout: NaviLayout
  feed: NaviFeed
}

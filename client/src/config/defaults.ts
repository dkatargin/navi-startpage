import type { NaviConfig } from '../types/config'

export const DEFAULT_CONFIG: NaviConfig = {
  categories: [
    {
      id: 'work',
      label: 'WORK',
      collapsed: false,
      links: [
        { title: 'Jira', url: 'https://jira.vk.team/', icon: '🎯' },
        { title: 'Grafana', url: 'https://grafana.vk.team/', icon: '📊' },
        { title: 'GitLab', url: 'https://gitlab.corp.mail.ru/', icon: '👨‍💻' },
        { title: 'Confluence', url: 'https://confluence.vk.team/display/VPN/VK%20Play%20Home', icon: '📜' },
      ],
    },
    {
      id: 'toolbox',
      label: 'TOOLBOX',
      collapsed: false,
      links: [
        { title: 'AI chats', url: 'https://chat.aiacademy.me/', icon: '🤖'},
        { title: 'Bitwarden', url: 'https://bit.dimhost.ru/', icon: '🔑' },
        { title: 'Linkwarden', url: 'https://links.home.lab/', icon: '🔗' },
        { title: 'Tools', url: 'https://toolbox.dev.lab/', icon: '⚒️' },
      ],
    },
    {
      id: 'homelab',
      label: 'HOMELAB',
      collapsed: true,
      links: [
        { title: 'Mikrotik router', url: 'http://router.lab' },
        { title: 'Portainer', url: 'https://portainer.dev.lab/' },
        { title: 'Bugsink', url: 'https://bugs.dimhost.ru/' },
        { title: 'Forgejo', url: 'https://git.dev.lab/' },
        { title: 'FreshRSS', url: 'https://rss.dimhost.ru/' },
        { title: 'MailCow', url: 'https://mail.dimhost.ru/' },
        { title: 'MetaBase', url: 'https://db.home.lab/meta/' },
        { title: 'Monitoring', url: 'https://monitoring.dev.lab/' },
        { title: 'NocoBase', url: 'https://db.home.lab' },
        { title: 'SearxNG', url: 'https://search.dimhost.ru' },
        { title: 'Umami', url: 'https://umami.dimhost.ru' },
        { title: 'Uptime Statistics', url: 'https://uptime.dev.lab' },
      ],
    },
    {
      id: 'pet_projects',
      label: 'PET PROJECTS',
      collapsed: true,
      links: [
        {title: 'КамСити', url: 'https://kamcity.ru'},
        {title: 'WishCraft', url: 'https://wish.dimhost.ru'}
      ]
    },

    {
      id: 'others',
      label: 'OTHERS',
      collapsed: true,
      links: [
        { title: 'Kagi', url: 'https://kagi.com' },
        { title: 'HN', url: 'https://news.ycombinator.com' },
        { title: 'Reddit', url: 'https://reddit.com' },
        { title: 'Mastodon', url: 'https://mastodon.moscow' },
      ],
    },
  ],
  search: {
    fallbackUrl: 'https://kagi.com/search?q=%s',
  },
  theme: {
    mode: 'dark',
    dark: {
      backgroundColor: '#0A0A0A',
      textColor: '#CCCCCC',
      accentColor: '#00FF41',
      accentSecondary: '#FFB000',
      borderColor: '#222222',
    },
    light: {
      backgroundColor: '#F0F0F0',
      textColor: '#222222',
      accentColor: '#007F20',
      accentSecondary: '#B87A00',
      borderColor: '#DDDDDD',
    },
    fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    fontSize: 14,
  },
  layout: {
    gridColumns: 4,
    feedCollapsed: false,
  },
  feed: {
    enabled: false,
    url: '',
    token: '',
  },
}

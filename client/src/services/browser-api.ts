// Safari uses browser.*, Chrome uses chrome.*
// This module provides a unified reference.

const api = (typeof browser !== 'undefined' ? browser : typeof chrome !== 'undefined' ? chrome : undefined) as
  | typeof chrome
  | undefined

export default api

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

// Safari exposes extension APIs under `browser` instead of `chrome`
declare const browser: typeof chrome | undefined

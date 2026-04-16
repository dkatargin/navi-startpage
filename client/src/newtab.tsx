import { render } from 'preact'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'
import './styles/global.css'
import { App } from './components/App'

render(<App />, document.getElementById('app')!)

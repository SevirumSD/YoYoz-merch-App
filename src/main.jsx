import React from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Dark })
  if (Capacitor.getPlatform() === 'android') {
    StatusBar.setBackgroundColor({ color: '#0A0A0A' })
  }
  SplashScreen.hide()
}

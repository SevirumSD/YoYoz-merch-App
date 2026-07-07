import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.boogieyoyoz.merch',
  appName: 'Boogie & The Yo-Yoz',
  webDir: 'dist',
  backgroundColor: '#0A0A0A',
  plugins: {
    SplashScreen: {
      launchShowDuration: 400,
      backgroundColor: '#0A0A0A',
      androidScaleType: 'CENTER_INSIDE',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0A0A0A'
    }
  }
};

export default config;

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'fitplanet',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,        
      launchAutoHide: true,            
      launchFadeOutDuration: 500,      
      backgroundColor: "#ffffffff",  
      showSpinner: true,               
      androidSpinnerStyle: "large",    
      iosSpinnerStyle: "small",        
      spinnerColor: "#4CAF50",         
      splashFullScreen: true,         
      splashImmersive: true            
    }
  }
};

export default config;

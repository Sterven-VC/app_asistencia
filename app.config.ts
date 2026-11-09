import type { ExpoConfig } from 'expo/config';

const permitirHttp = process.env.PERMITIR_HTTP === '1';
const icono = './assets/images/logo-tmt-app.png';

const config: ExpoConfig = {
  name: 'Asistencia TMT',
  slug: 'asistencia-tmt',
  version: '0.1.4',
  orientation: 'portrait',
  icon: icono,
  scheme: 'asistenciatmt',
  userInterfaceStyle: 'light',
  android: {
    package: 'com.timetelemetry.asistencia',
    versionCode: 5,
    adaptiveIcon: {
      backgroundColor: '#FFFFFF',
      foregroundImage: icono,
    },
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    blockedPermissions: ['ACCESS_BACKGROUND_LOCATION'],
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-sqlite',
    'expo-background-task',
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'Se usa tu ubicación solo en el momento de marcar asistencia.',
        isAndroidBackgroundLocationEnabled: false,
        isAndroidForegroundServiceEnabled: false,
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FFFFFF',
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: permitirHttp,
          // Room llama este constructor por reflexión al iniciar WorkManager.
          extraProguardRules: '-keep class androidx.work.impl.WorkDatabase_Impl { <init>(); }',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: false,
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
    permitirHttp,
    eas: { projectId: '5df20e54-a0cc-4410-9b74-6d3ec84cd830' },
  },
};

export default config;

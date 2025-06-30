declare module 'react-native-push-notification' {
  export interface PushNotificationConfig {
    onNotification?: (notification: any) => void;
    permissions?: {
      alert?: boolean;
      badge?: boolean;
      sound?: boolean;
    };
    popInitialNotification?: boolean;
    requestPermissions?: boolean;
  }

  export interface LocalNotificationConfig {
    channelId?: string;
    title?: string;
    message: string;
    playSound?: boolean;
    soundName?: string;
    vibrate?: boolean;
    importance?: any;
    priority?: string;
    data?: any;
  }

  export interface NotificationChannel {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    soundName?: string;
    importance?: any;
    vibrate?: boolean;
  }

  export const Importance: {
    HIGH: any;
    DEFAULT: any;
    LOW: any;
    MIN: any;
  };

  export default class PushNotification {
    static configure(config: PushNotificationConfig): () => void;
    static localNotification(config: LocalNotificationConfig): void;
    static createChannel(
      channel: NotificationChannel,
      callback?: (created: boolean) => void
    ): void;
  }
} 
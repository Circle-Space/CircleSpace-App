import React from 'react';
import type { VideoSaveData } from './specs/NativeVideoManager';
import type { ReactVideoProps } from './types';
export interface VideoRef {
    seek: (time: number, tolerance?: number) => void;
    resume: () => void;
    pause: () => void;
    presentFullscreenPlayer: () => void;
    dismissFullscreenPlayer: () => void;
    restoreUserInterfaceForPictureInPictureStopCompleted: (restore: boolean) => void;
    setVolume: (volume: number) => void;
    setFullScreen: (fullScreen: boolean) => void;
    save: (options: object) => Promise<VideoSaveData> | void;
    getCurrentPosition: () => Promise<number>;
}
declare const Video: React.ForwardRefExoticComponent<ReactVideoProps & React.RefAttributes<VideoRef>>;
export default Video;

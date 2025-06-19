/// <reference types="@tarojs/taro" />

declare module '*.png';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd'
  }
}

// Add defineAppConfig
declare function defineAppConfig(config: import('@tarojs/taro').AppConfig): import('@tarojs/taro').AppConfig;
declare function definePageConfig(config: import('@tarojs/taro').PageConfig): import('@tarojs/taro').PageConfig;

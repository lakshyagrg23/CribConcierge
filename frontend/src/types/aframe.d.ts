/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'aframe' {
  const aframe: any;
  export = aframe;
}

declare module 'aframe-react' {
  export const Entity: any;
  export const Scene: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-sky': any;
      'a-entity': any;
      'a-camera': any;
      'a-cursor': any;
      'a-plane': any;
      'a-text': any;
      'a-light': any;
    }
  }
}

export {};

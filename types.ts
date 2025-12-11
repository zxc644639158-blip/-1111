export enum ShapeType {
  TREE = 'Tree',
  SPHERE = 'Sphere',
  HEART = 'Heart',
  GALAXY = 'Galaxy'
}

export enum GestureState {
  NONE = 'None',
  OPEN_HAND = 'Open Hand (Scatter)',
  FIST = 'Fist (Gather)',
  PINCH = 'Pinch (Zoom)'
}

export interface ParticleConfig {
  count: number;
  colors: string[];
  size: number;
}

export interface HandData {
  isOpen: boolean;
  isFist: boolean;
  isPinching: boolean;
  position: { x: number; y: number };
  tilt: number;
}

export interface AppState {
  shape: ShapeType;
  colorTheme: string;
  isCameraEnabled: boolean;
  gesture: GestureState;
  morphProgress: number; // 0 to 1
  rotation: number;
}
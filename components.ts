export interface ViewProperties {}

export interface ButtonProperties {
  name: string;
  icon?: string;
  onPress?(): void;
}

export interface ButtonSlots {
  icon?: true;
}
export interface IconProperties {
  source: string;
}

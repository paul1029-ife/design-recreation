import { type ComponentType } from "react";

export interface PlaygroundComponent {
  id: number;
  name: string;
  source: string;
  url: string;
  component: ComponentType;
}

export interface ComponentCardProps {
  name: string;
  source: string;
  onClick: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  component?: ComponentType;
  name?: string;
}

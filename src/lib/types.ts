import { StaticImageData } from "next/image";

/**
 * Project related interfaces
 */
export interface Project {
  id: number;
  name: string;
  description: string;
  technologies: string[];
  github: string;
  demo: string;
  image: StaticImageData | string;
  available: boolean;
  youtubeId?: string;
}

export type DevProject = Project;

export type DesignProject = Project;

/**
 * Review related interfaces
 */
export interface Review {
  name: string;
  role: string;
  company: string;
  profileImg: StaticImageData;
  testimonial: string;
  index?: number;
}

/**
 * Component props interfaces
 */
export interface AnimatedBodyProps {
  text: string;
  className?: string;
  wordSpace?: string;
  charSpace?: string;
}

export interface AnimatedTitleProps {
  text: string;
  className: string;
  wordSpace: string;
  charSpace: string;
  delay?: number;
}

export interface AnimatedWordsProps {
  title: string;
  style: string;
}

export interface AnimatedWords2Props {
  title: string;
  style: string;
}

export interface PreLoaderProps {
  className?: string;
}

export interface ProjectCardProps {
  project: Project;
}

export interface ReviewCardProps {
  review: Review;
}

/**
 * Section props interfaces
 */
export interface HeroSectionProps {
  className?: string;
}

export interface AboutSectionProps {
  className?: string;
}

export interface WorkSectionProps {
  className?: string;
}

export interface ReviewsSectionProps {
  className?: string;
}

export interface ContactSectionProps {
  className?: string;
}

/**
 * Layout props interfaces
 */
export interface NavbarProps {
  className?: string;
}

export interface FooterProps {
  className?: string;
}

/**
 * Common props and utility types
 */
export interface ChildrenProps {
  children: React.ReactNode;
}

export type Direction = 'left' | 'right' | 'up' | 'down';

export interface AnimationProps {
  direction?: Direction;
  delay?: number;
  duration?: number;
  once?: boolean;
}
# Design Document

## Overview

This design outlines the modernization of the existing Next.js portfolio website by implementing shadcn/ui components, proper component architecture, and eliminating inline styles. The modernization will maintain the existing visual design and functionality while improving code quality, maintainability, and following modern React patterns.

The project leverages the existing Next.js 15 setup with App Router, Tailwind CSS v4, and the already configured shadcn/ui system to create a more maintainable and scalable codebase.

## Architecture

### Current Structure Analysis
```
src/app/
├── [sections-as-folders]/     # Current: Mixed section/component structure
├── animations/                # Keep: Animation utilities
├── fonts/                     # Keep: Font configurations  
├── utils/                     # Keep: Utility functions
├── layout.tsx                 # Keep: Root layout
└── page.tsx                   # Refactor: Main page composition
```

### Target Structure
```
src/
├── app/                       # Next.js App Router pages
│   ├── layout.tsx            # Root layout (minimal changes)
│   ├── page.tsx              # Main page (refactored composition)
│   └── globals.css           # Global styles (keep existing)
├── components/               # New: Organized component library
│   ├── ui/                   # shadcn/ui components
│   ├── layout/               # Layout components (NavBar, Footer)
│   ├── sections/             # Page sections (Hero, Work, About, etc.)
│   ├── cards/                # Card components (ProjectCard, ReviewCard, etc.)
│   └── animations/           # Animation components
├── lib/                      # Utilities and configurations
│   ├── utils.ts              # Existing utility functions
│   └── types.ts              # New: TypeScript type definitions
└── data/                     # New: Data and content
    ├── projects.ts           # Project data with types
    ├── reviews.ts            # Review data with types
    └── songs.ts              # Song data with types
```

## Components and Interfaces

### Component Categories

#### 1. Layout Components
- **NavBar**: Navigation component with shadcn/ui Button integration
- **Footer**: Footer component with proper link styling

#### 2. Section Components  
- **HeroSection**: Hero section with proper component composition
- **WorkSection**: Work showcase section
- **AboutSection**: About section with skill cards
- **ContactSection**: Contact section with form elements
- **ReviewsSection**: Reviews display section

#### 3. Card Components
- **ProjectCard**: Individual project display using shadcn/ui Card
- **ReviewCard**: Review display using shadcn/ui Card  
- **SongCard**: Music recommendation card using shadcn/ui Card
- **SkillCard**: Skill category display card

#### 4. UI Components (shadcn/ui integration)
- **Button**: Replace custom buttons with shadcn/ui Button
- **Card**: Use for all card layouts
- **Badge**: For technology tags and labels
- **Separator**: For visual separation elements

### TypeScript Interfaces

#### Core Data Types
```typescript
// Project data structure
interface Project {
  id: number;
  name: string;
  description: string;
  technologies: string[];
  github: string;
  demo: string;
  image: string;
  available: boolean;
}

// Review data structure  
interface Review {
  id: number;
  name: string;
  role: string;
  company: string;
  review: string;
  image: string;
}

// Song data structure
interface Song {
  id: number;
  title: string;
  artist: string;
  genre: string;
  cover: string;
  link: string;
}
```

#### Component Props Interfaces
```typescript
// Card component props
interface ProjectCardProps {
  project: Project;
  className?: string;
}

interface ReviewCardProps {
  review: Review;
  className?: string;
}

// Section component props
interface SectionProps {
  className?: string;
  children?: React.ReactNode;
}
```

## Data Models

### Data Organization
- **Centralized Data**: Move all data objects from component files to dedicated data files
- **Type Safety**: All data structures will have corresponding TypeScript interfaces
- **Separation of Concerns**: Data, types, and components will be clearly separated

### Data Files Structure
```typescript
// src/data/projects.ts
export const projects: Project[] = [
  // Project data with proper typing
];

// src/data/reviews.ts  
export const reviews: Review[] = [
  // Review data with proper typing
];

// src/data/songs.ts
export const songs: Song[] = [
  // Song data with proper typing
];
```

## Error Handling

### Component Error Boundaries
- Implement error boundaries for section components
- Graceful fallbacks for missing data or failed loads
- Proper error logging and user feedback

### Data Validation
- Runtime validation for data structures
- Type guards for external data sources
- Fallback content for missing or invalid data

## Testing Strategy

### Component Testing
- Unit tests for individual components using React Testing Library
- Integration tests for section components
- Visual regression tests for UI components

### Type Safety Testing
- TypeScript compilation tests
- Interface compliance validation
- Props validation testing

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation testing
- Color contrast validation
- ARIA label verification

## Implementation Phases

### Phase 1: Foundation Setup
1. Create new directory structure
2. Set up TypeScript interfaces and types
3. Create data files with proper typing
4. Install and configure additional shadcn/ui components

### Phase 2: Component Migration
1. Extract and refactor layout components (NavBar, Footer)
2. Create reusable card components with shadcn/ui
3. Migrate section components with proper separation
4. Replace inline styles with Tailwind classes

### Phase 3: Integration and Optimization
1. Update main page composition
2. Implement proper component imports and exports
3. Add error boundaries and fallbacks
4. Optimize performance and bundle size

### Phase 4: Quality Assurance
1. Add comprehensive TypeScript coverage
2. Implement testing suite
3. Validate accessibility compliance
4. Performance optimization and testing

## Migration Strategy

### Inline Style Elimination
- **Current**: Components use inline style objects and hardcoded values
- **Target**: All styling through Tailwind CSS classes
- **Approach**: Systematic conversion of each component's styling

### Component Extraction
- **Current**: Section logic mixed with component logic
- **Target**: Clear separation between page sections and reusable components
- **Approach**: Extract reusable parts into dedicated component files

### shadcn/ui Integration
- **Current**: Custom styled elements throughout
- **Target**: Consistent use of shadcn/ui components where appropriate
- **Approach**: Replace custom buttons, cards, and form elements with shadcn/ui equivalents

## Performance Considerations

### Bundle Optimization
- Tree-shaking for unused shadcn/ui components
- Proper code splitting for section components
- Optimized imports and exports

### Runtime Performance
- Maintain existing animation performance
- Optimize re-renders with proper React patterns
- Efficient data loading and caching

### Development Experience
- Improved TypeScript IntelliSense
- Better component discoverability
- Consistent development patterns
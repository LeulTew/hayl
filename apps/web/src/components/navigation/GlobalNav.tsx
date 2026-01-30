import type { TopLevelView } from '../../App';

interface GlobalNavProps {
  currentView: TopLevelView;
  onViewChange: (view: TopLevelView) => void;
  // Hidden during active workout or landing
  isHidden?: boolean;
}

import { LayoutDashboard, BookOpen, Utensils, User } from 'lucide-react';
import { TubeLightNavbar, type NavItem } from '../ui/TubeLightNavbar';

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', name: 'WORKOUT', icon: LayoutDashboard },
  { id: 'exercises', name: 'LIBRARY', icon: BookOpen },
  { id: 'nutrition', name: 'FUEL', icon: Utensils },
  { id: 'profile', name: 'PROFILE', icon: User },
];

export function GlobalNav({ currentView, onViewChange, isHidden }: GlobalNavProps) {
  if (isHidden) return null;

  return (
    <TubeLightNavbar 
      items={NAV_ITEMS}
      activeId={currentView}
      onChange={(id) => onViewChange(id as TopLevelView)}
    />
  );
}

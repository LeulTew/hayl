import type { TopLevelView } from '../../App';
import { LayoutDashboard, BookOpen, Utensils, User } from 'lucide-react';
import { NavBar, type NavItem } from '../ui/NavBar';

interface GlobalNavProps {
  currentView: TopLevelView;
  onViewChange: (view: TopLevelView) => void;
  // Hidden during active workout or landing
  isHidden?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'WORKOUT', icon: LayoutDashboard },
  { id: 'exercises', label: 'LIBRARY', icon: BookOpen },
  { id: 'nutrition', label: 'FUEL', icon: Utensils },
  { id: 'profile', label: 'PROFILE', icon: User },
];

function isTopLevelView(id: string): id is TopLevelView {
  return id === 'dashboard' || id === 'exercises' || id === 'nutrition' || id === 'profile';
}

export function GlobalNav({ currentView, onViewChange, isHidden }: GlobalNavProps) {
  if (isHidden) return null;

  return (
    <NavBar 
      items={NAV_ITEMS}
      activeId={currentView}
      onChange={(id) => {
        if (isTopLevelView(id)) {
          onViewChange(id);
        }
      }}
    />
  );
}

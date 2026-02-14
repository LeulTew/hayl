import { useLiveQuery } from 'dexie-react-hooks';
import { db, type UserProfile } from '../lib/db';
import { useCallback } from 'react';

export function useUserProfile() {
  const profile = useLiveQuery(
    async () => (await db.userProfile.toCollection().first()) ?? null,
    [],
    null
  );

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!profile?.id) {
      // Create new
      await db.userProfile.add({
        name: '',
        gender: 'male',
        goal: 'maintain',
        experience: 'intermediate',
        weight: 70,
        height: 175,
        age: 25,
        unitPreference: 'metric',
        completedOnboarding: false,
        ...data
      } as UserProfile);
    } else {
      // Update existing
      await db.userProfile.update(profile.id, data);
    }
  }, [profile]);

  return {
    profile,
    isLoading: profile === undefined,
    isOnboarded: !!profile?.completedOnboarding,
    updateProfile,
  };
}

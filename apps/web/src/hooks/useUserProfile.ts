import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type UserProfile } from '../lib/db';
import { useCallback } from 'react';

export function useUserProfile() {
  const syncMutation = useMutation(api.users.syncUserProfile);

  const profile = useLiveQuery(
    async () => (await db.userProfile.toCollection().first()) ?? null,
    [],
    null
  );

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    let finalProfile: UserProfile;

    if (!profile?.id) {
      // Create new local
      const newProfile: UserProfile = {
        name: '',
        gender: 'male',
        goal: 'maintain',
        experience: 'intermediate',
        weight: 70,
        height: 175,
        age: 25,
        unitPreference: 'metric',
        languagePreference: 'en',
        completedOnboarding: false,
        ...data
      };
      await db.userProfile.add(newProfile);
      finalProfile = newProfile;
    } else {
      // Update existing local
      await db.userProfile.update(profile.id, data);
      finalProfile = { ...profile, ...data };
    }

    // Background Sync to Convex
    try {
        const token = localStorage.getItem("hayl-token") || "guest_" + Date.now();
        if (!localStorage.getItem("hayl-token")) localStorage.setItem("hayl-token", token);

        await syncMutation({
            tokenIdentifier: token,
            name: finalProfile.name || "Athlete",
            currentPlanId: finalProfile.activePlanId as any,
            programStartDate: finalProfile.programStartDate,
        });
    } catch (e) {
        console.warn("Sync failed (offline?)", e);
    }
  }, [profile, syncMutation]);

  return {
    profile,
    isLoading: profile === undefined,
    isOnboarded: !!profile?.completedOnboarding,
    updateProfile,
  };
}

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

const QUOTES = [
  // --- COACH GREG (Hardcore / Tough Love) ---
  { text: "Cheat on your curls, but don't cheat on your girlfriend.", author: "Coach Greg", tags: ["curls", "funny", "technique"] },
  { text: "My GRANDMA can lift that! Put some effort in!", author: "Coach Greg", tags: ["motivation", "funny", "intensity"] },
  { text: "Zero sugar. Zero excuses.", author: "Coach Greg", tags: ["nutrition", "discipline"] },
  { text: "Training to failure means you CANNOT do another rep with good form.", author: "Coach Greg", tags: ["technique", "failure"] },
  { text: "Don't be a moron. Use full range of motion.", author: "Coach Greg", tags: ["technique", "funny"] },
  { text: "If you're not sweating, you're not working hard enough.", author: "Coach Greg", tags: ["intensity"] },
  { text: "Lower the weight and control the eccentric.", author: "Coach Greg", tags: ["technique", "eccentric"] },
  { text: "Train harder than last time!", author: "Coach Greg", tags: ["motivation", "catchphrase"] },
  { text: "You don't need to be perfect, you just need to be better than yesterday.", author: "Coach Greg", tags: ["motivation", "consistency"] },
  { text: "Stop ego lifting. Nobody cares how much you bench if your form is trash.", author: "Coach Greg", tags: ["technique", "ego"] },
  { text: "It's not genetics, it's effort!", author: "Coach Greg", tags: ["motivation", "no-excuses"] },
  { text: "Put down the fork!", author: "Coach Greg", tags: ["nutrition", "weight-loss"] },
  { text: "Calories in, Calories out! It's simply thermodynamics!", author: "Coach Greg", tags: ["nutrition", "science"] },
  { text: "Do the work! There is no secret sauce!", author: "Coach Greg", tags: ["motivation", "hard-work"] },
  { text: "You can't out-train a bad diet.", author: "Coach Greg", tags: ["nutrition", "reality-check"] },
  { text: "Squeeze the muscle! Don't just move the weight!", author: "Coach Greg", tags: ["technique", "mind-muscle"] },
  { text: "If it was easy, everyone would be jacked.", author: "Coach Greg", tags: ["motivation", "reality-check"] },
  { text: "Buy my freaking cookbook!", author: "Coach Greg", tags: ["funny", "meta"] },
  { text: "Are you training or are you playing on your phone?", author: "Coach Greg", tags: ["focus", "intensity"] },
  { text: "Go harder!", author: "Coach Greg", tags: ["intensity", "motivation"] },

  // --- HAYL PHILOSOPHY (Consistency / Mindset) ---
  { text: "Consistent effort beats intensity.", author: "Hayl", tags: ["consistency", "mindset"] },
  { text: "Show up. That's 90% of the battle.", author: "Hayl", tags: ["consistency", "motivation"] },
  { text: "Build the habit first, then build the intensity.", author: "Hayl", tags: ["beginner", "habit"] },
  { text: "Rest is when the growth happens.", author: "Hayl", tags: ["recovery", "science"] },
  { text: "Hydrate. Your muscles are 75% water.", author: "Hayl", tags: ["nutrition", "health"] },
  { text: "Focus on the muscle you're working, not just moving the weight.", author: "Hayl", tags: ["technique", "mind-muscle-connection"] },
  { text: "A bad workout is better than no workout.", author: "Hayl", tags: ["motivation", "consistency"] },
  { text: "Discipline is doing what needs to be done, even if you don't want to do it.", author: "Hayl", tags: ["discipline", "mindset"] },
  { text: "Small progress is still progress.", author: "Hayl", tags: ["motivation", "patience"] },
  { text: "Trust the process.", author: "Hayl", tags: ["mindset", "patience"] },
  { text: "Comparison is the thief of joy. Focus on your own reps.", author: "Hayl", tags: ["mindset", "mental-health"] },
  { text: "Sleep is the best supplement you can take.", author: "Hayl", tags: ["recovery", "health"] },
  { text: "Protein is king. Prioritize it in every meal.", author: "Hayl", tags: ["nutrition", "protein"] },
  { text: "Track your progress. What gets measured gets managed.", author: "Hayl", tags: ["tracking", "discipline"] },
  { text: "Discipline equals freedom.", author: "Jocko/Hayl", tags: ["discipline", "mindset"] },
  { text: "Compound movements give the best bang for your buck.", author: "Hayl", tags: ["training-philosophy"] },
  { text: "Don't skip the warmup. Your future self will thank you.", author: "Hayl", tags: ["injury-prevention", "longevity"] },
  { text: "Leave your ego at the door.", author: "Hayl", tags: ["mindset", "safety"] },
  { text: "Strength is a marathon, not a sprint.", author: "Hayl", tags: ["patience", "long-term"] },
  { text: "Your body achieves what your mind believes.", author: "Hayl", tags: ["mindset", "visualization"] },

  // --- TECHNICAL CUES (Form / Safety) ---
  { text: "Squeeze at the top.", author: "Hayl Tech", tags: ["technique", "contraction"] },
  { text: "Control the negative (eccentric) phase.", author: "Hayl Tech", tags: ["technique", "eccentric"] },
  { text: "Full Range of Motion. No half reps.", author: "Hayl Tech", tags: ["technique", "form"] },
  { text: "Pack your lats. Imagine squeezing an orange in your armpits.", author: "Hayl Tech", tags: ["technique", "back", "deadlift"] },
  { text: "Drive through your heels.", author: "Hayl Tech", tags: ["technique", "squat", "leg-day"] },
  { text: "Keep your core tight. Brace as if someone is about to punch you.", author: "Hayl Tech", tags: ["technique", "core", "bracing"] },
  { text: "Neutral spine. Don't look up, don't look down.", author: "Hayl Tech", tags: ["technique", "spine", "safety"] },
  { text: "Elbows in. Protect your shoulders.", author: "Hayl Tech", tags: ["technique", "push", "shoulders"] },
  { text: "Chin tucked.", author: "Hayl Tech", tags: ["technique", "posture"] },
  { text: "Breathe out on exertion (the hard part).", author: "Hayl Tech", tags: ["technique", "breathing"] },
  { text: "Don't lock your knees on leg press.", author: "Hayl Tech", tags: ["technique", "safety", "leg-day"] },
  { text: "Retract your scapula (pinch shoulder blades) for bench press.", author: "Hayl Tech", tags: ["technique", "bench", "chest"] },

  // --- FUNNY / RELATABLE (Lighthearted) ---
  { text: "Cardio? Is that Spanish?", author: "Gym Rat", tags: ["funny", "cardio"] },
  { text: "I lift so I can eat.", author: "Gym Rat", tags: ["funny", "nutrition"] },
  { text: "Gym therapy: Cheaper than a shrink.", author: "Gym Rat", tags: ["funny", "mental-health"] },
  { text: "Sore today, strong tomorrow. Or just sore.", author: "Gym Rat", tags: ["funny", "reality"] },
  { text: "Squat like it's hot.", author: "Gym Rat", tags: ["funny", "legs"] },
  { text: "Leg day is the best day... said no one ever.", author: "Gym Rat", tags: ["funny", "legs"] },
  { text: "Will squat for tacos.", author: "Gym Rat", tags: ["funny", "food"] },
  { text: "Iron therapy > Retail therapy.", author: "Gym Rat", tags: ["funny", "shopping"] },
  { text: "Sweat is just fat crying.", author: "Gym Rat", tags: ["funny", "motivation"] },
  { text: "Be a beast in the gym, not a burden on the healthcare system.", author: "Gym Rat", tags: ["funny", "truth"] },
  { text: "Running late is my cardio.", author: "Gym Rat", tags: ["funny", "cardio"] },
  { text: "I have 99 problems but a bench ain't one.", author: "Gym Rat", tags: ["funny", "bench"] },
];

async function main() {
  console.log(`🌱 Seeding ${QUOTES.length} quotes...`);
  try {
    const resultString = await client.mutation(api.quotes.seedQuotes, { quotes: QUOTES });
    console.log("Raw Result:", resultString);
    const result = JSON.parse(resultString);
    console.log(`✅ Quotes synced: ${result.newCount} new, ${result.existingCount} existing.`);
  } catch (error) {
    console.error("❌ Failed to seed quotes:", error);
    process.exit(1);
  }
}

main().catch(console.error);

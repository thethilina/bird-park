export enum ArtistCategory {
  PHILOSOPHER = "Philosopher",
  THERAPIST = "Therapist",
  REBEL = "Rebel",
  SPIRITUAL_VISIONARY = "Spiritual Visionary",
  STORYTELLER = "Storyteller",
  DREAMER = "Dreamer",
  SAGE = "Sage",
  JESTER = "Jester",
}

export interface EmotionScore {
  emotion: string;
  score: number;
}
export interface Comment {
  id: number;
  userId: number;
  artid: number;
  date: string;
  comment: string;
}

const users = [1, 2, 4, 5, 6, 7, 8, 9, 10];

const sampleComments = [
  // short
  "This hits different.",
  "Love the vibe here.",
  "Feels emotional.",
  "Nice composition.",
  "Very creative.",

  // medium
  "The colors in this are really well balanced, it feels very intentional.",
  "I like how this piece creates a mood without being too obvious about it.",
  "There’s something really calming but also slightly unsettling here.",
  "This feels like a moment frozen in time, really well done.",
  "The lighting and shadows work together perfectly in this one.",

  // longer / more human
  "I don’t fully understand what this is trying to say, but I can definitely feel something from it and that’s what makes it interesting.",
  "This reminds me of something I’ve seen in a dream before, it has that strange familiar feeling that’s hard to explain.",
  "The way you handled the colors and spacing here makes the whole piece feel very intentional and controlled, not random at all.",
  "There’s a quiet intensity in this that makes me stop and look at it longer than I expected.",
  "I feel like this piece is telling a story but leaving enough out for the viewer to fill in the gaps themselves.",
  "At first glance it looks simple, but the more I look at it the more details start to stand out.",
  "This has a very cinematic feel to it, like it could be a frame from a much bigger story.",
  "The composition feels really balanced, nothing feels out of place or unnecessary.",
  "I like how this doesn’t try too hard but still manages to feel meaningful.",
  "There’s something slightly uncomfortable about this and I think that’s what makes it memorable.",
  "This gives off a very introspective feeling, like it’s meant to be experienced slowly.",
  "It feels like there’s a deeper layer here that isn’t immediately obvious.",
  "I appreciate how this doesn’t follow a typical style and still works really well.",
  "This would look amazing as a large print, it has that kind of presence.",
  "There’s a rawness to this that makes it feel more honest.",
  "I like how the details don’t overwhelm the overall composition.",
  "This piece feels very personal, like it came from a real place.",
  "The more I look at it, the more it grows on me.",
  "It’s subtle, but that’s exactly why it works.",
  "This has a really strong atmosphere, almost like you can feel it.",
  "I like how this leaves space for interpretation instead of forcing meaning.",
  "It’s not loud, but it still manages to stand out.",
  "There’s a really nice flow to how everything is arranged here.",
  "This feels like something that would stay in your mind for a while.",
  "I think the simplicity here is actually its biggest strength.",
  "It has a kind of quiet confidence to it.",
  "The visual balance here is really satisfying to look at.",
  "This feels very intentional, nothing looks accidental.",
  "I like how it doesn’t rely on too many elements to make an impact.",
  "There’s something about this that feels very real and grounded."
];

let idCounter = 1;

export const commentData: Comment[] = Array.from({ length: 20 }).flatMap((_, artIndex) => {
  const artid = artIndex + 1;

  const shuffledUsers = [...users].sort(() => 0.5 - Math.random());

  return Array.from({ length: 5 }).map((__, i) => ({
    id: idCounter++,
    userId: shuffledUsers[i % shuffledUsers.length],
    artid,
    date: `2026/01/${String((i % 28) + 1).padStart(2, "0")}`,
    comment: sampleComments[Math.floor(Math.random() * sampleComments.length)]
  }));
});
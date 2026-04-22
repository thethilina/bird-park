import { StaticImageData } from "next/image";

import f1 from "./Art/f1.jpg";
import f2 from "./Art/f2.jpg";
import f3 from "./Art/f3.jpg";
import f4 from "./Art/f4.jpg";
import f5 from "./Art/f5.jpg";
import f6 from "./Art/f6.jpg";
import f7 from "./Art/f7.jpg";
import f8 from "./Art/f8.jpg";
import f9 from "./Art/f9.jpg";
import f10 from "./Art/f10.jpg";
import f11 from "./Art/f11.jpg";
import f12 from "./Art/f12.jpg";
import f13 from "./Art/f13.jpg";
import f14 from "./Art/f14.jpg";
import f15 from "./Art/f15.jpg";
import f16 from "./Art/f16.jpg";
import f17 from "./Art/f17.jpg";
import f18 from "./Art/f18.jpg";
import f19 from "./Art/f19.jpg";
import f20 from "./Art/f20.jpg";


export interface FeedItem {
  id: string;
  category: "art" | "poem";

  title: string;
  userId: number;

  image?: StaticImageData;

  content?: string;
  textColor?: string;
  backgroundColor?: string;
  font?: string;

  createdDate: Date;
  emotion: string;
  heartCount: number;
}


export const feedDatabase: FeedItem[] = [

  {
    id: "1",
    category: "art",
    title: "Bird in Flight",
    userId: 1,
    image: f1,
    createdDate: new Date(),
    emotion: "peaceful",
    heartCount: 0,
  },
  {
    id: "2",
    category: "art",
    title: "Nature's Beauty",
    userId: 2,
    image: f2,
    createdDate: new Date(),
    emotion: "joyful",
    heartCount: 0,
  },
  {
    id: "3",
    category: "art",
    title: "Sunset Wings",
    userId: 3,
    image: f3,
    createdDate: new Date(),
    emotion: "serene",
    heartCount: 0,
  },
  {
    id: "4",
    category: "art",
    title: "Garden Visitor",
    userId: 4,
    image: f4,
    createdDate: new Date(),
    emotion: "calm",
    heartCount: 0,
  },
  {
    id: "5",
    category: "art",
    title: "Morning Call",
    userId: 5,
    image: f5,
    createdDate: new Date(),
    emotion: "energetic",
    heartCount: 0,
  },
  {
    id: "6",
    category: "art",
    title: "Perched Moment",
    userId: 6,
    image: f6,
    createdDate: new Date(),
    emotion: "thoughtful",
    heartCount: 0,
  },
  {
    id: "7",
    category: "art",
    title: "Sky Dancer",
    userId: 7,
    image: f7,
    createdDate: new Date(),
    emotion: "playful",
    heartCount: 0,
  },
  {
    id: "8",
    category: "art",
    title: "Feathered Friend",
    userId: 8,
    image: f8,
    createdDate: new Date(),
    emotion: "friendly",
    heartCount: 0,
  },
  {
    id: "9",
    category: "art",
    title: "Wild Freedom",
    userId: 9,
    image: f9,
    createdDate: new Date(),
    emotion: "adventurous",
    heartCount: 0,
  },
  {
    id: "10",
    category: "art",
    title: "Graceful Glide",
    userId: 10,
    image: f10,
    createdDate: new Date(),
    emotion: "elegant",
    heartCount: 0,
  },
  {
    id: "11",
    category: "art",
    title: "Nest Home",
    userId: 1,
    image: f11,
    createdDate: new Date(),
    emotion: "cozy",
    heartCount: 0,
  },
  {
    id: "12",
    category: "art",
    title: "Wings Spread",
    userId: 5,
    image: f12,
    createdDate: new Date(),
    emotion: "proud",
    heartCount: 0,
  },
  {
    id: "13",
    category: "art",
    title: "Twilight Song",
    userId: 6,
    image: f13,
    createdDate: new Date(),
    emotion: "melancholic",
    heartCount: 0,
  },
  {
    id: "14",
    category: "art",
    title: "Tropical Plumage",
    userId: 2,
    image: f14,
    createdDate: new Date(),
    emotion: "vibrant",
    heartCount: 0,
  },
  {
    id: "15",
    category: "art",
    title: "Forest Echo",
    userId: 9,
    image: f15,
    createdDate: new Date(),
    emotion: "mysterious",
    heartCount: 0,
  },
  {
    id: "16",
    category: "art",
    title: "Waterside Rest",
    userId: 7,
    image: f16,
    createdDate: new Date(),
    emotion: "peaceful",
    heartCount: 0,
  },
  {
    id: "17",
    category: "art",
    title: "Storm Rider",
    userId: 10,
    image: f17,
    createdDate: new Date(),
    emotion: "powerful",
    heartCount: 0,
  },
  {
    id: "18",
    category: "art",
    title: "Branch Perch",
    userId: 6,
    image: f18,
    createdDate: new Date(),
    emotion: "patient",
    heartCount: 0,
  },
  {
    id: "19",
    category: "art",
    title: "Moonlit Flight",
    userId: 2,
    image: f19,
    createdDate: new Date(),
    emotion: "nocturnal",
    heartCount: 0,
  },
  {
    id: "20",
    category: "art",
    title: "Dawn Awakening",
    userId: 8,
    image: f20,
    createdDate: new Date(),
    emotion: "hopeful",
    heartCount: 0,
  },
// ================= POEMS =================

{
  id: "p1",
  category: "poem",
  title: "I'm Nobody! Who are you?",
  userId: 1,
  content: `I'm Nobody! Who are you?
Are you – Nobody – too?
Then there's a pair of us!
Don't tell! they'd advertise – you know!

How dreary – to be – Somebody!
How public – like a Frog –
To tell one's name – the livelong June –
To an admiring Bog!`,
  textColor: "#d4ffd4",
  backgroundColor: "#013220",
  font: "serif",
  createdDate: new Date(),
  emotion: "existential",
  heartCount: 0,
},

{
  id: "p3",
  category: "poem",
  title: "Rot Beneath",
  userId: 7,
  content: `Beneath the skin, the rot resides,
A quiet truth the flesh denies.

It whispers soft beneath the bone,
A language only pain has known.

We dress it up in light and grace,
But shadows still return to face.`,
  textColor: "#ffe6e6",
  backgroundColor: "#330000",
  font: "serif",
  createdDate: new Date(),
  emotion: "dark",
  heartCount: 0,
},



{
  id: "p5",
  category: "poem",
  title: "Echo Chamber",
  userId: 5,
  content: `Voices bouncing off the walls,
None are mine, yet one still calls.

It speaks in tones I can't escape,
A looping mind I can't reshape.

And in that hollow, endless space,
I lose my name, I lose my face.`,
  textColor: "#fff0cc",
  backgroundColor: "#332100",
  font: "fantasy",
  createdDate: new Date(),
  emotion: "derealization",
  heartCount: 0,
},



{
  id: "p7",
  category: "poem",
  title: "Sleep Without Rest",
  userId: 7,
  content: `Eyes are closed but mind's awake,
Dreams that twist and never break.

The night repeats the same old scene,
A loop of things that might have been.

And morning comes but nothing ends,
Just broken sleep that never mends.`,
  textColor: "#d1d1ff",
  backgroundColor: "#1a1a40",
  font: "monospace",
  createdDate: new Date(),
  emotion: "exhausted",
  heartCount: 0,
},

{
  id: "p8",
  category: "poem",
  title: "Unseen Weight",
  userId: 8,
  content: `No chains, no scars, no visible pain,
Yet something pulls within my brain.

A weight that has no shape or form,
A silent storm I must conform.

And still I walk as if I'm fine,
While breaking softly line by line.`,
  textColor: "#ccffe6",
  backgroundColor: "#003322",
  font: "serif",
  createdDate: new Date(),
  emotion: "heavy",
  heartCount: 0,
},
];

export const shuffledFeedDatabase = [...feedDatabase].sort(() => Math.random() - 0.514584654);

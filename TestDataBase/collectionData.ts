import c1 from "./Collections/c1.jpg"
import c2 from "./Collections/c2.jpg"
import c3 from "./Collections/c3.jpg"
import c4 from "./Collections/c4.jpg"
import c5 from "./Collections/c5.jpg"
import c6 from "./Collections/c6.jpg"
import c7 from "./Collections/c7.jpg"
import c8 from "./Collections/c8.jpg"
import c9 from "./Collections/c9.jpg"
import c10 from "./Collections/c10.jpg"
import { StaticImageData } from "next/image";

export interface CollectionItem {
  id: string;
  name: string;
  cover: StaticImageData;
  description: string;
  creatorId: number;
  arts: string[];
  createdDate: Date;
}

export const collectionsDatabase: CollectionItem[] = [
  {
    id: "c1",
    name: "Feathers of Silence",
    cover: c1,
    description: "A quiet archive of birds caught between motion and stillness.",
    creatorId: 1,
    arts: ["1", "3", "7", "10"],
    createdDate: new Date(),
  },
  {
    id: "c2",
    name: "Echoes in Green",
    cover: c2,
    description: "Nature whispering through forgotten corners of the world.",
    creatorId: 2,
    arts: ["2", "4", "14", "16"],
    createdDate: new Date(),
  },
  {
    id: "c3",
    name: "Skybound Souls",
    cover: c3,
    description: "Freedom, flight, and the illusion of escape.",
    creatorId: 3,
    arts: ["1", "9", "17", "19"],
    createdDate: new Date(),
  },
  {
    id: "c4",
    name: "Stillness Between Wings",
    cover: c4,
    description: "Moments where time pauses before the next flight.",
    creatorId: 4,
    arts: ["6", "8", "18"],
    createdDate: new Date(),
  },
  {
    id: "c5",
    name: "Dawn & Dusk Rituals",
    cover: c5,
    description: "The fragile transitions of light and shadow.",
    creatorId: 5,
    arts: ["5", "13", "20"],
    createdDate: new Date(),
  },
  {
    id: "c6",
    name: "Unseen Currents",
    cover: c6,
    description: "Invisible forces shaping movement and meaning.",
    creatorId: 6,
    arts: ["7", "15", "17"],
    createdDate: new Date(),
  },
  {
    id: "c7",
    name: "Fragments of Warmth",
    cover: c7,
    description: "Soft, human emotions hidden inside wild forms.",
    creatorId: 7,
    arts: ["8", "11", "16"],
    createdDate: new Date(),
  },
  {
    id: "c8",
    name: "Nocturnal Hymns",
    cover: c8,
    description: "Songs that only exist when the world sleeps.",
    creatorId: 8,
    arts: ["13", "19"],
    createdDate: new Date(),
  },
  {
    id: "c9",
    name: "The Watching Sky",
    cover: c9,
    description: "A perspective where the sky observes us back.",
    creatorId: 9,
    arts: ["3", "10", "17"],
    createdDate: new Date(),
  },
  {
    id: "c10",
    name: "Flight or Fall",
    cover: c10,
    description: "The thin line between control and collapse.",
    creatorId: 10,
    arts: ["9", "12", "15"],
    createdDate: new Date(),
  },
];
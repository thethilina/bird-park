import { StaticImageData } from "next/image"
import f1 from "./Art/f1.jpg"
import f2 from "./Art/f2.jpg"
import f3 from "./Art/f3.jpg"
import f4 from "./Art/f4.jpg"
import f5 from "./Art/f5.jpg"
import f6 from "./Art/f6.jpg"
import f7 from "./Art/f7.jpg"
import f8 from "./Art/f8.jpg"
import f9 from "./Art/f9.jpg"
import f10 from "./Art/f10.jpg"
import f11 from "./Art/f11.jpg"
import f12 from "./Art/f12.jpg"
import f13 from "./Art/f13.jpg"
import f14 from "./Art/f14.jpg"
import f15 from "./Art/f15.jpg"
import f16 from "./Art/f16.jpg"
import f17 from "./Art/f17.jpg"
import f18 from "./Art/f18.jpg"
import f19 from "./Art/f19.jpg"
import f20 from "./Art/f20.jpg"


export interface Comment {
    id: string;
    userId: string;
    text: string;
}

export interface Art {
    id: string;
    title: string;
    userId: string;
    image: StaticImageData;
    heartCount: number;
    createdDate: Date;
    emotion: string;
    comments: Comment[];
}

export const artDatabase: Art[] = [
    {
        id: "1",
        title: "Bird in Flight",
        userId: "user1",
        image: f1,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "peaceful",
        comments: [],
    },
    {
        id: "2",
        title: "Nature's Beauty",
        userId: "user2",
        image: f2,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "joyful",
        comments: [],
    },
    {
        id: "3",
        title: "Sunset Wings",
        userId: "user3",
        image: f3,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "serene",
        comments: [],
    },
    {
        id: "4",
        title: "Garden Visitor",
        userId: "user4",
        image: f4,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "calm",
        comments: [],
    },
    {
        id: "5",
        title: "Morning Call",
        userId: "user5",
        image: f5,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "energetic",
        comments: [],
    },
    {
        id: "6",
        title: "Perched Moment",
        userId: "user6",
        image: f6,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "thoughtful",
        comments: [],
    },
    {
        id: "7",
        title: "Sky Dancer",
        userId: "user7",
        image: f7,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "playful",
        comments: [],
    },
    {
        id: "8",
        title: "Feathered Friend",
        userId: "user8",
        image: f8,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "friendly",
        comments: [],
    },
    {
        id: "9",
        title: "Wild Freedom",
        userId: "user9",
        image: f9,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "adventurous",
        comments: [],
    },
    {
        id: "10",
        title: "Graceful Glide",
        userId: "user10",
        image: f10,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "elegant",
        comments: [],
    },
    {
        id: "11",
        title: "Nest Home",
        userId: "user11",
        image: f11,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "cozy",
        comments: [],
    },
    {
        id: "12",
        title: "Wings Spread",
        userId: "user12",
        image: f12,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "proud",
        comments: [],
    },
    {
        id: "13",
        title: "Twilight Song",
        userId: "user13",
        image: f13,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "melancholic",
        comments: [],
    },
    {
        id: "14",
        title: "Tropical Plumage",
        userId: "user14",
        image: f14,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "vibrant",
        comments: [],
    },
    {
        id: "15",
        title: "Forest Echo",
        userId: "user15",
        image: f15,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "mysterious",
        comments: [],
    },
    {
        id: "16",
        title: "Waterside Rest",
        userId: "user16",
        image: f16,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "peaceful",
        comments: [],
    },
    {
        id: "17",
        title: "Storm Rider",
        userId: "user17",
        image: f17,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "powerful",
        comments: [],
    },
    {
        id: "18",
        title: "Branch Perch",
        userId: "user18",
        image: f18,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "patient",
        comments: [],
    },
    {
        id: "19",
        title: "Moonlit Flight",
        userId: "user19",
        image: f19,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "nocturnal",
        comments: [],
    },
    {
        id: "20",
        title: "Dawn Awakening",
        userId: "user20",
        image: f20,
        heartCount: 0,
        createdDate: new Date(),
        emotion: "hopeful",
        comments: [],
    },
];

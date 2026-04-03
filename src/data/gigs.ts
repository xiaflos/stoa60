export interface Gig {
    month: string;
    monthShort: string;
    date: string;
    bands: string[];
    poster: string | null;
    location?: string;
}

export const gigs: Gig[] = [
    { month: "Απρίλιος", monthShort: "ΑΠΡ", date: "18", bands: ["Axeon", "Veil Omega"],       poster: "3.axeon_veil2.jpg" },
    { month: "Απρίλιος", monthShort: "ΑΠΡ", date: "25", bands: ["Junkheart", "Ποντικια"],     poster: "4..junkpontfn16b11111.jpg" },
    { month: "Μάιος",    monthShort: "ΜΑΙ", date: "2",  bands: ["SOMA", "Malhotra"],          poster: null },
    { month: "Μάιος",    monthShort: "ΜΑΙ", date: "9",  bands: ["Tiffany", "Thymics"],        poster: null },
    { month: "Μάιος",    monthShort: "ΜΑΙ", date: "16", bands: ["Καθαρος Χαλκος", "Αρκουδες των αγωγων της πολυκατοικιας"], poster: null },
    { month: "Μάιος",    monthShort: "ΜΑΙ", date: "23", bands: ["State of Loss"],             poster: null },
];

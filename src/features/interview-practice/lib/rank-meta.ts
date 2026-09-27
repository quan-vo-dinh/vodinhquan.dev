export type RankColorTheme =
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "emerald"
  | "diamond"
  | "master"
  | "grandmaster"
  | "challenger";

export type RankTier = {
  name: string;
  imageSrc: string;
  iconBorder: string;
  iconBorderOffsetY: number;
  minPercent: number;
  maxPercent: number;
  colorTheme: RankColorTheme;
};

export const RANK_TIERS: RankTier[] = [
  { name: "Iron", imageSrc: "/ranked/v1/iron.webp", iconBorder: "/ranked/Season_2022_-_Iron_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 0, maxPercent: 10, colorTheme: "iron" },
  { name: "Bronze", imageSrc: "/ranked/v1/bronze.webp", iconBorder: "/ranked/Season_2022_-_Bronze_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 10, maxPercent: 20, colorTheme: "bronze" },
  { name: "Silver", imageSrc: "/ranked/v1/sliver.webp", iconBorder: "/ranked/Season_2022_-_Silver_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 20, maxPercent: 30, colorTheme: "silver" },
  { name: "Gold", imageSrc: "/ranked/v1/gold.webp", iconBorder: "/ranked/Season_2022_-_Gold_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 30, maxPercent: 40, colorTheme: "gold" },
  { name: "Platinum", imageSrc: "/ranked/v1/platinum.webp", iconBorder: "/ranked/Season_2022_-_Platinum_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 40, maxPercent: 50, colorTheme: "platinum" },
  { name: "Emerald", imageSrc: "/ranked/v1/emerald.webp", iconBorder: "/ranked/Season_2022_-_Platinum_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 50, maxPercent: 60, colorTheme: "emerald" },
  { name: "Diamond", imageSrc: "/ranked/v1/diamond.webp", iconBorder: "/ranked/Season_2022_-_Diamond_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 60, maxPercent: 70, colorTheme: "diamond" },
  { name: "Master", imageSrc: "/ranked/v1/master.webp", iconBorder: "/ranked/Season_2022_-_Master_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 70, maxPercent: 80, colorTheme: "master" },
  { name: "Grandmaster", imageSrc: "/ranked/v1/grandmaster.webp", iconBorder: "/ranked/Season_2022_-_Grandmaster_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 80, maxPercent: 90, colorTheme: "grandmaster" },
  { name: "Challenger", imageSrc: "/ranked/v1/challenger.webp", iconBorder: "/ranked/Season_2022_-_Challenger_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 90, maxPercent: 101, colorTheme: "challenger" },
];

export function getRankTier(percentage: number): RankTier {
  const tier = RANK_TIERS.find((t) => percentage >= t.minPercent && percentage < t.maxPercent);
  return tier || RANK_TIERS[0];
}

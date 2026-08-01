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
  svg: string;
  logoSvg: string;
  iconBorder: string;
  iconBorderOffsetY: number;
  minPercent: number;
  maxPercent: number;
  colorTheme: RankColorTheme;
  logoScale: number;
};

export const RANK_TIERS: RankTier[] = [
  { name: "Iron", svg: "/ranked/iron.svg", logoSvg: "/ranked/iron-logo.svg", iconBorder: "/ranked/Season_2022_-_Iron_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 0, maxPercent: 10, colorTheme: "iron", logoScale: 1.0 },
  { name: "Bronze", svg: "/ranked/bronze.svg", logoSvg: "/ranked/bronze-logo.svg", iconBorder: "/ranked/Season_2022_-_Bronze_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 10, maxPercent: 20, colorTheme: "bronze", logoScale: 1.08 },
  { name: "Silver", svg: "/ranked/sliver.svg", logoSvg: "/ranked/sliver-logo.svg", iconBorder: "/ranked/Season_2022_-_Silver_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 20, maxPercent: 30, colorTheme: "silver", logoScale: 1.02 },
  { name: "Gold", svg: "/ranked/gold.svg", logoSvg: "/ranked/gold-logo.svg", iconBorder: "/ranked/Season_2022_-_Gold_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 30, maxPercent: 40, colorTheme: "gold", logoScale: 0.98 },
  { name: "Platinum", svg: "/ranked/platinum.svg", logoSvg: "/ranked/platinum-logo.svg", iconBorder: "/ranked/Season_2022_-_Platinum_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 40, maxPercent: 50, colorTheme: "platinum", logoScale: 1.04 },
  { name: "Emerald", svg: "/ranked/emerald.svg", logoSvg: "/ranked/emerald-logo.svg", iconBorder: "/ranked/Season_2022_-_Platinum_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 50, maxPercent: 60, colorTheme: "emerald", logoScale: 1.23 },
  { name: "Diamond", svg: "/ranked/diamond.svg", logoSvg: "/ranked/diamond-logo.svg", iconBorder: "/ranked/Season_2022_-_Diamond_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 60, maxPercent: 70, colorTheme: "diamond", logoScale: 1.48 },
  { name: "Master", svg: "/ranked/master.svg", logoSvg: "/ranked/master-logo.svg", iconBorder: "/ranked/Season_2022_-_Master_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 70, maxPercent: 80, colorTheme: "master", logoScale: 1.48 },
  { name: "Grandmaster", svg: "/ranked/grandmaster.svg", logoSvg: "/ranked/grandmaster-logo.svg", iconBorder: "/ranked/Season_2022_-_Grandmaster_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 80, maxPercent: 90, colorTheme: "grandmaster", logoScale: 1.56 },
  { name: "Challenger", svg: "/ranked/challenger.svg", logoSvg: "/ranked/challenger-logo.svg", iconBorder: "/ranked/Season_2022_-_Challenger_Summoner_Icon_Border.webp", iconBorderOffsetY: -10.0, minPercent: 90, maxPercent: 101, colorTheme: "challenger", logoScale: 1.45 },
];

export function getRankTier(percentage: number): RankTier {
  const tier = RANK_TIERS.find((t) => percentage >= t.minPercent && percentage < t.maxPercent);
  return tier || RANK_TIERS[0];
}

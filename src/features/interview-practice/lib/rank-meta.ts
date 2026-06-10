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
  minPercent: number;
  maxPercent: number;
  colorTheme: RankColorTheme;
};

export const RANK_TIERS: RankTier[] = [
  { name: "Iron", svg: "/ranked/iron.svg", logoSvg: "/ranked/iron-logo.svg", minPercent: 0, maxPercent: 10, colorTheme: "iron" },
  { name: "Bronze", svg: "/ranked/bronze.svg", logoSvg: "/ranked/bronze-logo.svg", minPercent: 10, maxPercent: 20, colorTheme: "bronze" },
  { name: "Silver", svg: "/ranked/sliver.svg", logoSvg: "/ranked/sliver-logo.svg", minPercent: 20, maxPercent: 30, colorTheme: "silver" },
  { name: "Gold", svg: "/ranked/gold.svg", logoSvg: "/ranked/gold-logo.svg", minPercent: 30, maxPercent: 40, colorTheme: "gold" },
  { name: "Platinum", svg: "/ranked/platinum.svg", logoSvg: "/ranked/platinum-logo.svg", minPercent: 40, maxPercent: 50, colorTheme: "platinum" },
  { name: "Emerald", svg: "/ranked/emerald.svg", logoSvg: "/ranked/emerald-logo.svg", minPercent: 50, maxPercent: 60, colorTheme: "emerald" },
  { name: "Diamond", svg: "/ranked/diamond.svg", logoSvg: "/ranked/diamond-logo.svg", minPercent: 60, maxPercent: 70, colorTheme: "diamond" },
  { name: "Master", svg: "/ranked/master.svg", logoSvg: "/ranked/master-logo.svg", minPercent: 70, maxPercent: 80, colorTheme: "master" },
  { name: "Grandmaster", svg: "/ranked/grandmaster.svg", logoSvg: "/ranked/grandmaster-logo.svg", minPercent: 80, maxPercent: 90, colorTheme: "grandmaster" },
  { name: "Challenger", svg: "/ranked/challenger.svg", logoSvg: "/ranked/challenger-logo.svg", minPercent: 90, maxPercent: 101, colorTheme: "challenger" },
];

export function getRankTier(percentage: number): RankTier {
  const tier = RANK_TIERS.find((t) => percentage >= t.minPercent && percentage < t.maxPercent);
  return tier || RANK_TIERS[0];
}

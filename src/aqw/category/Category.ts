import {CategoryStats} from "./CategoryStats.ts";
import CombatCategory from "../../avatar/helper/combat/CombatCategory.ts";

export class Category {

	public static readonly M1_STATS: CategoryStats = new CategoryStats(0.27, 0.3, 0.22, 0.05, 0.1, 0.06);
	public static readonly M2_STATS: CategoryStats = new CategoryStats(0.2, 0.22, 0.33, 0.05, 0.1, 0.1);
	public static readonly M3_STATS: CategoryStats = new CategoryStats(0.24, 0.2, 0.2, 0.24, 0.07, 0.05);
	public static readonly M4_STATS: CategoryStats = new CategoryStats(0.3, 0.18, 0.3, 0.02, 0.06, 0.14);
	public static readonly C1_STATS: CategoryStats = new CategoryStats(0.06, 0.2, 0.11, 0.33, 0.15, 0.15);
	public static readonly C2_STATS: CategoryStats = new CategoryStats(0.08, 0.27, 0.1, 0.3, 0.1, 0.15);
	public static readonly C3_STATS: CategoryStats = new CategoryStats(0.06, 0.23, 0.05, 0.28, 0.28, 0.1);
	public static readonly S1_STATS: CategoryStats = new CategoryStats(0.22, 0.18, 0.21, 0.08, 0.08, 0.23);

	public static categoryStats(category: string): CategoryStats {
		switch (category) {
			case CombatCategory.C1:
				return Category.C1_STATS;
			case CombatCategory.C2:
				return Category.C2_STATS;
			case CombatCategory.C3:
				return Category.C3_STATS;
			case CombatCategory.M1:
				return Category.M1_STATS;
			case CombatCategory.M2:
				return Category.M2_STATS;
			case CombatCategory.M3:
				return Category.M3_STATS;
			case CombatCategory.M4:
				return Category.M4_STATS;
			case CombatCategory.S1:
				return Category.S1_STATS;
			default:
				throw new Error("Invalid category: " + category);
		}
	}
}
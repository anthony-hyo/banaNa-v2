export class Rank {

    private static readonly arrRanks: number[] = [];

    static {
        for (let i: number = 1; i < Rank.arrRanks.length; ++i) {
            const rankExp: number = Math.pow(i + 1, 3.0) * 100.0;
            Rank.arrRanks[i] = i > 1 ? rankExp + Rank.arrRanks[i - 1] : rankExp + 100;
        }
    }

    public static getRankFromPoints(cp: number): number {
        for (let i: number = 1; i < Rank.arrRanks.length; ++i) {
            if (cp < Rank.arrRanks[i]) {
                return i;
            }
        }

        return 10;
    }

}

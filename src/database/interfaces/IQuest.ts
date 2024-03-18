export default interface IQuest {
    id: number;
    factionId: number;
    reqReputation: number;
    reqClassId: number;
    reqClassPoints: number;
    name: string;
    description: string;
    endText: string;
    experience: number;
    gold: number;
    reputation: number;
    classPoints: number;
    rewardType: string;
    level: boolean;
    upgrade: boolean;
    once: boolean;
    slot: number;
    value: number;
    field: string;
    index: number;
}
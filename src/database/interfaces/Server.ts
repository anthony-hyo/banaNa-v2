export default interface Server {
    id: number;
    name: string;
    ip: string;
    online: boolean;
    staff: boolean;
    upgrade: boolean;
    chat: number;
    count: number;
    max: number;
    motd: string;
}
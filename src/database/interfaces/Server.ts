export default interface Server {
    id: number;
    name: string;
    ip: string;
    online: boolean;
    upgrade: boolean;
    chat: number;
    count: number;
    max: number;
    motd: string;
}
export default class InternalEventObject {
    static readonly EVENT_SERVER_READY: string = "serverReady";
    static readonly EVENT_LOGIN: string = "login";
    static readonly EVENT_NEW_ROOM: string = "newRoom";
    static readonly EVENT_JOIN: string = "join";
    static readonly EVENT_USER_EXIT: string = "userExit";
    static readonly EVENT_USER_LOST: string = "userLost";
    eventName: string;
    params: {
        [key: string]: any
    };
    objects: {
        [key: string]: any
    };

    constructor(eventName: string, params: {
        [key: string]: any
    }, objects: {
        [key: string]: any
    }) {
        this.eventName = eventName;
        this.params = params;
        this.objects = objects;
    }

    getEventName(): string {
        return this.eventName;
    }

    getParam(key: string): any {
        return this.params[key];
    }

    getObject(key: string): any {
        return this.objects[key];
    }
}

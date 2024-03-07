export default class BasicInternalEventObject implements InternalEventObject {
    eventName: string;
    params: {
        [key: string]: any
    } = {};
    objects: {
        [key: string]: any
    } = {};

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
import schedule from 'node-schedule';
import logger from "./Logger.ts";
import type ITask from "../interfaces/ITask.ts";

export default class Scheduler {

    private static readonly tasks: Array<schedule.Job> = new Array<schedule.Job>;

    public static oneTime(task: ITask, date: Date): void {
        const newTask: schedule.Job = schedule.scheduleJob(date, task.run);
        this.tasks.push(newTask);
    }

    public static repeated(task: ITask, intervalInSeconds: number): void {
        const newTask: schedule.Job = schedule.scheduleJob(`*/${intervalInSeconds} * * * * *`, task.run);

        if (!newTask) {
            logger.error('Failed to schedule the task.');
            return;
        }

        this.tasks.push(newTask);
    }

    public static cancelAll(): void {
        this.tasks.forEach((task: schedule.Job) => task.cancel());
    }

}
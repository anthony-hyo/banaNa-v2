import schedule from 'node-schedule';
import type ITask from "../interfaces/ITask.ts";

export default class Scheduler {

    private static readonly tasks: Array<schedule.Job> = new Array<schedule.Job>;

    public static oneTime(task: ITask, seconds: number): schedule.Job {
        const date: Date = new Date();

        date.setSeconds(date.getSeconds() + seconds);

        const newTask: schedule.Job = schedule.scheduleJob(date, task.run);

        this.tasks.push(newTask);

        return newTask;
    }

    public static repeated(task: ITask, intervalInSeconds: number): schedule.Job | undefined {
        const newTask: schedule.Job = schedule.scheduleJob(`*/${intervalInSeconds} * * * * *`, task.run);

        this.tasks.push(newTask);

        return newTask;
    }

    public static cancelAll(): void {
        this.tasks.forEach((task: schedule.Job) => task.cancel());
    }

}
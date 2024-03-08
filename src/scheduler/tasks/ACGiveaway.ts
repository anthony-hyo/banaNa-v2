import {eq, sql} from "drizzle-orm";
import database from "../../database/drizzle/database";
import {users} from "../../database/drizzle/schema";
import type ITask from "../../interfaces/ITask";
import type Player from "../../player/Player";
import logger from "../../util/Logger";
import Random from "../../util/Random";
import JSONObject from "../../util/json/JSONObject";
import GameController from "../../controller/GameController.ts";

export class ACGiveaway implements ITask {

    private rand: Random;

    constructor() {
        this.rand = new Random(Date.now());

        console.log("ACGiveaway event initialized.");
    }

    public run(): void {
        try {
            const target: Player | null = this.getRandomUser();

            if (!target) {
                return;
            }

            database
                .update(users)
                .set({
                    coins: sql`${users.coins}
                    + 1`,
                })
                .where(eq(users.id, target.databaseId))
                .then((): void => {
                    target.network.writeString("administrator", "Congratulations! You just won 500 AdventureCoins!");

                    GameController.instance().writeString("administrator", `Congratulations! <font color=\"#ffffff\">${target.getName()}</font> has won 500 AdventureCoins!`);
                    GameController.instance().serverMessage(`Congratulations! <font color=\"#ffffff\"><a href=\"http://augoeides.org/?profile=${target.getName()}\" target=\"_blank\">${target.getName()}</a></font> has won <font color=\"#ffffff\">500</font> AdventureCoins!`);


                    target.network.writeObject(
                        new JSONObject()
                            .element("cmd", "sellItem")
                            .element("intAmount", 500)
                            .element("CharItemID", -1)
                            .element("bCoins", 1)
                    );

                    GameController.instance().serverMessage("The next lucky winner will be selected randomly in the next 30 minutes.");
                });
        } catch (error: any) {
            logger.warn(error)
        }
    }

    private getRandomUser(): Player | null {
        //TODO
        return null!;
    }
}

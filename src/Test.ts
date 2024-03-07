import database from "./database/drizzle/database";

async function fetchData() {
    console.log(await database.query.enhancements.findMany({
        with: {
            pattern: true
        }
    }));
}

fetchData();

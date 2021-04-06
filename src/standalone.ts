import minimist from 'minimist';

import {convertMonthFromCSV, SwipeTimesEntry} from "./convert";
import {csv} from "./setup";
import * as fs from 'fs';

const argv = minimist<{
    filePath: string;
    projectMapPath: string;
}>(process.argv.slice(2));

(async function main() {
    try {
        const data = await csv.fromFile(argv.filePath);
        const projectMap = JSON.parse(JSON.stringify(fs.readFileSync(`${process.cwd()}/${argv.projectMapPath}`)));

        const normalizedDays = convertMonthFromCSV(projectMap, data as SwipeTimesEntry[]);
        console.log(JSON.stringify(normalizedDays, null, 2));

    } catch(e) {
        console.error(e);
    }
})();

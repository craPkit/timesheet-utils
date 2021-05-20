import minimist from 'minimist';

import {convertMonthFromCSV} from "./convert";
import {csv} from "./setup";
import * as fs from 'fs';
import { SwipeTimesEntry } from './providers/swipeTimes';

const argv = minimist<{
    projectMapPath: string;
    filePath: string;
}>(process.argv.slice(2));

(async function main() {
    try {
        const filePath = `${process.cwd()}/${argv.filePath}`;
        const mapPath = `${process.cwd()}/${argv.projectMapPath}`;

        const data = await csv.fromFile(filePath);
        const projectMap = JSON.parse(fs.readFileSync(mapPath).toString());

        const normalizedDays = convertMonthFromCSV(projectMap, data as SwipeTimesEntry[]);
        console.log(JSON.stringify(normalizedDays, null, 2));

    } catch(e) {
        console.error(e);
    }
})();

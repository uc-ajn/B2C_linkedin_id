import { parse } from "csv-parse";
import fs from "fs";
import ObjectsToCsv from 'objects-to-csv';
import puppeteer from 'puppeteer';

let details = []

fs.createReadStream("./dataBase/B2C_sheet.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
            let first_name = row[1];
            let last_name = row[2];
            let Org = row[3];
            let count = row[4];
            let school = row[5];
            let school_name = row[6];
            details.push({ first_name, last_name, Org, count, school, school_name })
    })
    .on("end", async function () {
        console.log(details.length)
        console.log("B2C data are fetched");
        await getData();
    })
    .on("error", function (error) {
        console.log(error.message);
    });

// This code search personal linkedin using puppeteer.    

async function getData() {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    for (let i = 0; i < 10; i++) { //details.length 
        console.log('Org length', details.length);
        let first_name = details[i]?.first_name;
        let last_name = details[i]?.last_name;
        let org = details[i]?.Org;
        let count = details[i]?.count;
        let school = details[i]?.school;
        let school_name = (details[i]?.school_name)
        let search = `${first_name} ${last_name} "${school_name}" linkedin `;
        console.log(search);
        await page.goto('https://www.google.com/');
        await page.waitForSelector('body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input');
        await page.type('body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input', search);
        await page.keyboard.press('Enter');
        try {
            await page.waitForSelector(`#rso > div:nth-child(1) > div > div > div > div:nth-child(1) > div > div > div.Z26q7c.UK95Uc.jGGQ5e > div > a`);
            //Uncomment whenever captcha come repeatedly.
            // await page.waitFor(Math.floor( Math.random() * 30000));   
            const linkedin_id = await page.$eval(`#rso > div:nth-child(1) > div > div > div > div:nth-child(1) > div > div > div.Z26q7c.UK95Uc.jGGQ5e > div > a`, (elm) => elm.href);
            console.log(linkedin_id);           
            await linkedin_id.includes('linkedin.com/in/') ? CsvWriter([{i,first_name,last_name,org,count,school,school_name,linkedin_id}]) : CsvWriter([{i,first_name,last_name,org,count,school,school_name}]);
            console.log("linkedin_id_1",i,linkedin_id);    
        } catch (error) {
            try {
                await page.waitForSelector(`#rso > div > div > div > div > div.Z26q7c.UK95Uc.jGGQ5e > div > a`);
                //Uncomment whenever captcha come repeatedly.
                // await page.waitFor(Math.floor( Math.random() * 30000)); 
                const linkedin_id = await page.$eval(`#rso > div > div > div > div > div.Z26q7c.UK95Uc.jGGQ5e > div > a`, (elm) => elm.href);
                await linkedin_id.includes('linkedin.com/in/') ? CsvWriter([{i,first_name,last_name,org,count,school,school_name,linkedin_id}]) : CsvWriter([{i,first_name,last_name,org,count,school,school_name}]);
                console.log("linkedin_id_2",i,linkedin_id);
            } catch (error) {
                CsvWriter([{i,first_name,last_name,org,count,school,school_name}]);
                console.log("Not found");
            }
        }
    }
    await browser.close();
};

async function CsvWriter(fullData) {
    const csv = new ObjectsToCsv(fullData)
    console.log('CSV Creating...')
    await csv.toDisk(`./data_linkedin_B2C/B2C_linkedin.csv`, { append: true }).then(
        console.log("Succesfully Data save into CSV")
    )
}

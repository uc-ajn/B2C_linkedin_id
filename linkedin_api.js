import axios from 'axios';
import { parse } from "csv-parse";
import fs from "fs";
import ObjectsToCsv from 'objects-to-csv';
//
const API_KEY = "AIzaSyBcX5nrd2BCUqy-cEKYXQePEjGcDmlOtXc";  
const CS_CODE = 'b7768b2800f904a1d'; 

const details = []; 

fs.createReadStream("./dataBase/B2C_sheet.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
        const first_name = row[1];
        const last_name = row[2];
        const Org = row[3];
        const count = row[4];
        const school = row[5];
        const school_name = row[6];
        details.push({ first_name, last_name, Org, count, school, school_name })
    })
    .on("end", async function () {
        getData();
    })
    .on("error", function (error) {
        console.log(error.message);
    });

async function getData() {
    for (let i = 0; i < 5; i++) {  //details.length
        const first_name = details[i]?.first_name;
        const last_name = details[i]?.last_name;
        const org = details[i]?.Org;
        const count = details[i]?.count;
        const school = details[i]?.school;
        const school_name = (details[i]?.school_name)
        const search_q = `${first_name} ${last_name} "${school_name}" site:linkedin.com `;
        console.log(search_q);
        const config = {
            method: 'get',
            url: `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CS_CODE}&q=${search_q}`
        }

        let res = await axios(config)

        console.log(res.status);
        if (res.status == 200) {
                console.log('i', i)
                try {
                    console.log(res.data.items[0].title);
                    console.log(first_name.toLowerCase());
                    console.log((res.data.items[0].title).toLowerCase().includes(first_name.toLowerCase()));
                    console.log(first_name.toLowerCase() + last_name.toLowerCase());
                    let linkedin_id = res.data.items[0].link;
                    if (await (res.data.items[0].title).toLowerCase().includes(first_name.toLowerCase())) {
                        await linkedin_id.includes('linkedin.com/in/') ? CsvWriter([{i,first_name,last_name,org,count,school,school_name,linkedin_id}]) : CsvWriter([{i,first_name,last_name,org,count,school,school_name}]);
                    } else {
                        await CsvWriter([{i,first_name,last_name,org,count,school,school_name}])
                    }
                } catch (error) {
                    CsvWriter([{ i, first_name, last_name, org, count, school, school_name }])
                    console.log("Not Found");
                }
        }else{CsvWriter([{ i, first_name, last_name, org, count, school, school_name }])}
    }
}

async function CsvWriter(fullData) {
    const csv = new ObjectsToCsv(fullData)
    await csv.toDisk(`./data_linkedin_B2C_api/B2C_linkedin_api.csv`, { append: true }).then(
    )
}
const fs = require("fs");
const csv = require("csv-parser");
const moment = require("moment");
const { count } = require("console");

// read the CSV file and parse it into an array of objects
const data = [];
fs.createReadStream("bova11.csv")
  .pipe(csv())
  .on("data", (row) => {
    data.push({ date: moment(row.date, "DD/MM/YYYY").toDate(), variation: Number(row.variation) });
  })
  .on("end", () => {
    // Define an array to hold the number of records until the variation is less than or equal to 1.5
    const recordsUntil15 = [];
    
    // Loop through the array of objects
    const tradingDays = data.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    
    console.log('size ', tradingDays.length)
    let countDays = 0;
    for (let i = 0; i < tradingDays.length; i++) {
      // Check if the variation is less than or equal to 1.5
      const {variation, date} = tradingDays[i];
      // if(variation > -1.5){
      //   console.log(`variation = ${variation} - ${date}`)
      //   countDays++;
      // }
      // else{
      //   recordsUntil15.push(countDays);
      //   countDays = 0;
      // }

      if(variation <= -1.5){
        recordsUntil15.push(countDays);
        countDays = 0;
      }else{
        countDays++;
      }
      
      
    }

    // console.log('count days ', countDays)

    console.log(`The variation was less than or equal to 1.5 after records.`);
    console.log(recordsUntil15.reduce((x, y) => x+y, 0)/recordsUntil15.length)

  });


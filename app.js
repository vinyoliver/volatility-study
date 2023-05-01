const fs = require("fs");
const csv = require("csv-parser");
const moment = require("moment");

// read the CSV file and parse it into an array of objects
const data = [];
fs.createReadStream("bova11.csv")
  .pipe(csv())
  .on("data", (row) => {
    data.push({ date: moment(row.date, "DD/MM/YYYY").toDate(), variation: Number(row.variation) });
  })
  .on("end", () => {
    // get an array of unique years from the data
    const years = Array.from(new Set(data.map((row) => row.date.getFullYear()))).reverse();

    // define a function to calculate the relevant information for a given year
    function calculateStatsForYear(year) {
      const filteredData = (year ? data.filter((row) => row.date.getFullYear() === year) : data).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      // initialize counters for positive and negative sequences
      let posSeq = 0;
      let negSeq = 0;
      let maxPosSeq = 0;
      let maxNegSeq = 0;
      let sumPos = 0;
      let sumNeg = 0;
      let posSeqVariations = [];
      let negSeqVariations = [];

      let sumPosSequenc = 0;
      let sumNegSequenc = 0;

      let count3plus = 0;
      let count3minus = 0;
      let count2plus = 0;
      let count2minus = 0;
      let count1_5plus = 0;
      let count1_5minus = 0;
      let count1plus = 0;
      let count1minus = 0;

      let greatestDrawdown = 0;
      let greatestRecovery = 0;

      // iterate over the filtered data array and update the counters accordingly
      for (let i = 0; i < filteredData.length; i++) {
        const variation = filteredData[i].variation;
        if (variation > 0 || (variation == 0 && posSeq > 0)) {
          posSeq++;
          negSeq = 0;
          sumNeg = 0;
          maxPosSeq = Math.max(maxPosSeq, posSeq);
          sumPos += variation;
          if (posSeq === maxPosSeq) {
            sumPosSequenc = sumPos;
          }
          if (sumPos > greatestRecovery) {
            greatestRecovery = sumPos;
          }
        } else if (variation < 0 || (variation == 0 && negSeq > 0)) {
          negSeq++;
          posSeq = 0;
          sumPos = 0;
          maxNegSeq = Math.max(maxNegSeq, negSeq);
          sumNeg += variation;
          if (negSeq === maxNegSeq) {
            sumNegSequenc = sumNeg;
            // console.log("DATE >>> ", filteredData[i].date)
          }
          if (sumNeg < greatestDrawdown) {
            greatestDrawdown = sumNeg;
          }
        }

        if (variation >= 3) {
          count3plus++;
        } else if (variation <= -3) {
          count3minus++;
        } else if (variation >= 2) {
          count2plus++;
        } else if (variation <= -2) {
          count2minus++;
        } else if (variation >= 1.5) {
          count1_5plus++;
        } else if (variation <= -1.5) {
          count1_5minus++;
        } else if (variation >= 1) {
          count1plus++;
        } else if (variation <= -1) {
          count1minus++;
        }

      }

      const total = filteredData.length;
      return {
        year,
        maxPosSeq,
        maxNegSeq,
        sumPos: sumPosSequenc,
        sumNeg: sumNegSequenc,
        posSeqVariations,
        negSeqVariations,
        greatestDrawdown,
        greatestRecovery,

        count3plus,
        count3minus,
        count2plus,
        count2minus,
        count1_5plus,
        count1_5minus,
        count1plus,
        count1minus,

        total,
        percent3plus: (count3plus / total) * 100,
        percent3minus: (count3minus / total) * 100,
        percent2plus: (count2plus / total) * 100,
        percent2minus: (count2minus / total) * 100,
        percent1_5plus: (count1_5plus / total) * 100,
        percent1_5minus: (count1_5minus / total) * 100,
        percent1plus: (count1plus / total) * 100,
        percent1minus: (count1minus / total) * 100,
      };
    }

    // calculate the relevant information for each year and log it to the console
    const dataResult = [];
    for (let i = 0; i < years.length; i++) {
      const stats = calculateStatsForYear(years[i]); 
      if(stats.year !== 2020){
        dataResult.push(stats);
      }
      printData(stats);
    }


    console.log("============================");
    console.log("===========ALL DATA=========");
    console.log("============================");
    printData(calculateStatsForYear());


    console.log("============================");
    console.log("===========AVERAGES=========");
    console.log("============================");
    calculateAverages(dataResult);
  });

function printData(stats) {
  stats.year && console.log(`Year: ${stats.year}`);
  console.log(`Longest consecutive positive days: ${stats.maxPosSeq}`);
  console.log(`Total variation for longest consecutive positive days: ${stats.sumPos}`);
  console.log(`Longest consecutive negative days: ${stats.maxNegSeq}`);
  console.log(`Total variation for longest consecutive negative days: ${stats.sumNeg}`);
  console.log('')
  console.log(`Greatest recovery: ${stats.greatestRecovery}`);
  console.log(`Greatest drawdown: ${stats.greatestDrawdown}`);
  console.log('')

  console.log(`Total Trading days: ${stats.total}`);
  console.log(`>= 3: ${stats.count3plus} (${stats.percent3plus.toFixed(2)}%)`);
  console.log(`<= -3: ${stats.count3minus} (${stats.percent3minus.toFixed(2)}%)`);
  console.log('')
  console.log(`>= 2: ${stats.count2plus} (${stats.percent2plus.toFixed(2)}%)`);
  console.log(`<= -2: ${stats.count2minus} (${stats.percent2minus.toFixed(2)}%)`);
  console.log('')
  console.log(`>= 1.5: ${stats.count1_5plus} (${stats.percent1_5plus.toFixed(2)}%)`);
  console.log(`<= -1.5: ${stats.count1_5minus} (${stats.percent1_5minus.toFixed(2)}%)`);
  console.log('')
  console.log(`>= 1: ${stats.count1plus} (${stats.percent1plus.toFixed(2)}%)`);
  console.log(`<= -1: ${stats.count1minus} (${stats.percent1minus.toFixed(2)}%)`);
  console.log('')
  console.log('')
  console.log("============================");
}


function calculateAverages(data) {
  const averages = {};
  const numObjects = data.length;

  // Calculate average for each field
  const fieldsToInclude = ["maxPosSeq", "maxNegSeq", "greatestDrawdown", "greatestRecovery"];

  fieldsToInclude.forEach((field) => {
    const sum = data.reduce((acc, obj) => acc + obj[field], 0);
    averages[field] = (sum / numObjects).toFixed(2);
  });

  console.log("AVG Consecutive up days: ", averages.maxPosSeq);
  console.log("AVG Consecutive down days: ", averages.maxNegSeq);
  console.log()
  console.log("AVG greatest UP movement: ", averages.greatestRecovery);
  console.log("AVG greatest DOWN movement: ", averages.greatestDrawdown);
}


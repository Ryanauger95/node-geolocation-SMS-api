const common = require("./commonFunctions");
var CronJob = require("cron").CronJob;

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

module.exports.newNodeCronJob = (unixTimestamp, callback) => {
  console.log("Scheduled newNodeCronJob for " + unixTimestamp.toString());
  let timenow = common.timenow();

  //prevents issues of past dates
  if (timenow + 10 > unixTimestamp) {
    unixTimestamp = timenow + 10;
  }
  var date = new Date(unixTimestamp * 1000);
  const job = new CronJob(date, async function() {
    await sleep(2000);
    console.log("Running user callback!");
    callback();
  });
  job.start();
};

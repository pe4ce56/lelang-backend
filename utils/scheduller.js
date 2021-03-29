const schedule = require("node-schedule");
const knex = require("../config/database");
const status = (io, socket) =>
// */5 * * * * *
  schedule.scheduleJob("10 * * * *", async () => {
    try {
      const close = await knex("auctions")
        .where("end_date", "<", knex.fn.now())
        .where("status", "<>", "close")
        .update({ status: "close" });
      const open = await knex("auctions")
        .where("end_date", ">", knex.fn.now())
        .where("status", "<>", "open")
        .update({ status: "open" });
      if (open || close) {
        console.log("status changed", new Date().toISOString());
        io.emit("statusChanged", true);
      } else {
        console.log("No status changed", new Date().toISOString());
      }
    } catch (error) {
      console.log(error);
    }
  });

module.exports = status;

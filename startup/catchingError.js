

module.exports = function () {
  // for handling the unhandled rejection so any error
  // that is going to happened outside express will call this:
  // this will be call auto when detecting catch
  process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION! 💥 Shutting down...");
    console.error(err.name, err.message, err);
    process.exit(1);
  });
};

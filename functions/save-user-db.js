require("dotenv").config();
const dbConnect = require("./db/dbConnect");
const models = require("./db/models");
const mongoose = require("mongoose");

//Serverless function
exports.handler = async event => {
  return {
    statusCode: 401,
    body: "Participant registration is disabled at the moment."
  };
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
      headers: { Allow: "POST" }
    };
  }
  const databaseConnected = await dbConnect();
  if (databaseConnected) {
    try {
      const currentParticipantAmount = await models.Participant.find({});
      if (
        currentParticipantAmount.length ===
        Number(process.env.VUE_APP_EVENT_CAPACITY)
      ) {
        return {
          statusCode: 401,
          body: "Maximum event capacity reached."
        };
      }
      const data = JSON.parse(event.body);
      const participantVerification = await models.Participant.find({
        email: data.email
      }).exec();
      if (participantVerification.length) {
        mongoose.disconnect();
        return {
          statusCode: 401,
          body: "This email is already registered."
        };
      }

      //else
      const newParticipant = new models.Participant({
        ...data
      });
      await newParticipant.save();
      mongoose.disconnect();
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    } catch (error) {
      console.error("Error writing into the database: ", error);
      return {
        statusCode: 500,
        body: "Error writing into the database, see function log for details"
      };
    }
  }
  return {
    statusCode: 500,
    body: "Database connection failed, see function log for details"
  };
};

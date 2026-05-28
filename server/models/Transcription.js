const mongoose =
  require("mongoose")

const transcriptionSchema =
  new mongoose.Schema(

    {

      userEmail: {

        type: String,

        required: true,
      },

      fileName: {

        type: String,

        required: true,
      },

      transcription: {

        type: String,

        required: true,
      },
    },

    {
      timestamps: true,
    }
  )

module.exports =
  mongoose.model(

    "Transcription",

    transcriptionSchema
  )
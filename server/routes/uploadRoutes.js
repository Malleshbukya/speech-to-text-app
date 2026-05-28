const express = require("express")

const multer = require("multer")

const fs = require("fs")

const { Deepgram } =
  require("@deepgram/sdk")

const Transcription =
  require("../models/Transcription")

const router =
  express.Router()

const deepgram =
  new Deepgram(
    process.env.DEEPGRAM_API_KEY
  )

const storage =
  multer.diskStorage({

    destination:
      function (
        req,
        file,
        cb
      ) {

        cb(null, "uploads/")
      },

    filename:
      function (
        req,
        file,
        cb
      ) {

        cb(
          null,

          Date.now() +
            "-" +
            file.originalname
        )
      },
  })

const upload =
  multer({
    storage: storage,
  })

router.post(
  "/",

  upload.single("audio"),

  async (req, res) => {

    try {

      const audioFile =
        fs.readFileSync(
          req.file.path
        )

      const response =
        await deepgram.transcription.preRecorded(
          {
            buffer: audioFile,

            mimetype:
              req.file.mimetype,
          },

          {
            punctuate: true,
          }
        )

      const transcription =
        response.results.channels[0]
          .alternatives[0]
          .transcript

      const savedData =
        await Transcription.create({

          userEmail:
            req.body.userEmail,

          fileName:
            req.file.filename,

          transcription,
        })

      res.json(savedData)

    } catch (error) {

      console.log(error)

      res.status(500).json({

        message:
          "Transcription failed",
      })
    }
  }
)

router.get(
  "/transcriptions/:email",

  async (req, res) => {

    try {

      const data =
        await Transcription.find({

          userEmail:
            req.params.email,

        }).sort({
          createdAt: -1,
        })

      res.json(data)

    } catch (error) {

      console.log(error)

      res.status(500).json({

        message:
          "Failed to fetch transcriptions",
      })
    }
  }
)

module.exports = router
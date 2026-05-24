import { useState, useRef } from "react"
import axios from "axios"

function UploadAudio() {

  const [audio, setAudio] = useState(null)

  const [transcription, setTranscription] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [recording, setRecording] =
    useState(false)

  const mediaRecorderRef = useRef(null)

  const audioChunksRef = useRef([])

  const startRecording = async () => {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        })

      const mediaRecorder =
        new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.start()

      setRecording(true)

      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {

        if (event.data.size > 0) {

          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {

        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: "audio/webm",
          }
        )

        const audioFile = new File(
          [audioBlob],
          "recording.webm",
          {
            type: "audio/webm",
          }
        )

        setAudio(audioFile)

        console.log(audioFile)
      }

    } catch (error) {

      console.log(error)

      alert("Microphone access denied")
    }
  }

  const stopRecording = () => {

    mediaRecorderRef.current.stop()

    setRecording(false)
  }

  const handleUpload = async () => {

    if (!audio) {

      alert("Please select or record audio")

      return
    }

    const formData = new FormData()

    formData.append("audio", audio)

    try {

      setLoading(true)

      const response = await axios.post(
        "http://localhost:5000/upload",
        formData
      )

      console.log(response.data)

      setTranscription(
        response.data.transcription
      )

    } catch (error) {

      console.log(error)

      alert("Upload failed")
    }

    finally {

      setLoading(false)
    }
  }

  return (

    <div className="bg-white p-8 rounded-2xl shadow-lg w-[450px] flex flex-col gap-5">

      <input
        type="file"
        accept="audio/*"
        onChange={(e) =>
          setAudio(e.target.files[0])
        }
        className="border p-2 rounded"
      />

      <div className="flex gap-3">

        {
          !recording ? (

            <button
              onClick={startRecording}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Start Recording
            </button>

          ) : (

            <button
              onClick={stopRecording}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Stop Recording
            </button>
          )
        }

        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Upload Audio
        </button>

      </div>

      {
        loading && (

          <p className="text-blue-600 font-bold">
            Generating transcription...
          </p>
        )
      }

      {
        transcription && (

          <div className="bg-gray-100 p-4 rounded">

            <h2 className="font-bold mb-2">
              Transcription
            </h2>

            <p>{transcription}</p>

          </div>
        )
      }

    </div>
  )
}

export default UploadAudio
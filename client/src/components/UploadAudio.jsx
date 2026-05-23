import { useState } from "react"
import axios from "axios"

function UploadAudio() {

  const [audio, setAudio] = useState(null)

  const [transcription, setTranscription] =
    useState("")

  const handleUpload = async () => {

    if (!audio) {

      alert("Please select audio file")

      return
    }

    const formData = new FormData()

    formData.append("audio", audio)

    try {

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
  }

  return (

    <div className="flex flex-col items-center gap-5">

      <input
        type="file"
        accept="audio/*"
        onChange={(e) =>
          setAudio(e.target.files[0])
        }
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Upload Audio
      </button>

      {
        transcription && (

          <div className="bg-white p-4 rounded shadow w-[400px]">

            <h2 className="font-bold mb-2">
              Transcription:
            </h2>

            <p>{transcription}</p>

          </div>
        )
      }

    </div>
  )
}

export default UploadAudio
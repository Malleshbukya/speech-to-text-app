import {
  useState,
  useRef,
  useEffect
} from "react"

import axios from "axios"

function UploadAudio() {

  const [audio, setAudio] = useState(null)

  const [transcription, setTranscription] =
    useState("")

  const [history, setHistory] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [recording, setRecording] =
    useState(false)

  const mediaRecorderRef = useRef(null)

  const audioChunksRef = useRef([])

  const fetchHistory = async () => {

    try {

      const response =
        await axios.get(
          "http://localhost:5000/upload/transcriptions"
        )

      setHistory(response.data)

    } catch (error) {

      console.log(error)
    }
  }

  useEffect(() => {

    fetchHistory()

  }, [])

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

      fetchHistory()

    } catch (error) {

      console.log(error)

      alert(
        error.response?.data?.message ||
        "Upload failed"
      )
    }

    finally {

      setLoading(false)
    }
  }

  return (

    <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full flex flex-col gap-6 border border-gray-200">

      <input
        type="file"
        accept="audio/*"

        onChange={(e) => {

          const file = e.target.files[0]

          if (!file) return

          if (
            !file.type.startsWith("audio/")
          ) {

            alert(
              "Please upload audio files only"
            )

            return
          }

          if (
            file.size >
            10 * 1024 * 1024
          ) {

            alert(
              "File size must be below 10MB"
            )

            return
          }

          setAudio(file)
        }}

        className="border-2 border-dashed border-blue-400 p-4 rounded-xl bg-blue-50 cursor-pointer"
      />

      <div className="flex gap-3 flex-wrap">

        {
          !recording ? (

            <button
              onClick={startRecording}
              className="bg-green-600 hover:bg-green-700 transition-all duration-300 text-white px-5 py-3 rounded-xl shadow-md"
            >
              Start Recording
            </button>

          ) : (

            <button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 transition-all duration-300 text-white px-5 py-3 rounded-xl shadow-md"
            >
              Stop Recording
            </button>
          )
        }

        <button
          onClick={handleUpload}

          disabled={loading}

          className={`px-5 py-3 rounded-xl text-white shadow-md transition-all duration-300 ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >

          {
            loading
              ? "Uploading..."
              : "Upload Audio"
          }

        </button>

      </div>

      {
        loading && (

          <p className="text-blue-600 font-bold text-lg animate-pulse">
            Generating transcription...
          </p>
        )
      }

      {
        transcription && (

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-2xl shadow-md border border-blue-200">

            <h2 className="font-bold text-xl mb-3 text-blue-700">
              Transcription
            </h2>

            <p className="text-gray-700 leading-relaxed">
              {transcription}
            </p>

          </div>
        )
      }

      <div>

        <h2 className="text-2xl font-bold text-purple-700">
          Previous Transcriptions
        </h2>

        <div className="flex flex-col gap-3 mt-4">

          {
            history.map((item) => (

              <div
                key={item._id}
                className="bg-white shadow-md border border-gray-200 p-4 rounded-2xl hover:scale-[1.02] transition-all duration-300"
              >

                <p className="text-gray-700">
                  {item.transcription}
                </p>

              </div>
            ))
          }

        </div>

      </div>

    </div>
  )
}

export default UploadAudio
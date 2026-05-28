import {
  useState,
  useRef,
  useEffect
} from "react"

import axios from "axios"

import supabase
from "../supabase/supabaseClient"

import { io }
from "socket.io-client"

const socket =
  io("http://localhost:5000")

function UploadAudio() {

  const [uploadAudio,
    setUploadAudio] =
    useState(null)

  const [recordedAudio,
    setRecordedAudio] =
    useState(null)

  const [transcription,
    setTranscription] =
    useState("")

  const [history,
    setHistory] =
    useState([])

  const [showHistory,
    setShowHistory] =
    useState(false)

  const [loading,
    setLoading] =
    useState(false)

  const [recording,
    setRecording] =
    useState(false)

  const [liveText,
    setLiveText] =
    useState("")

  const mediaRecorderRef =
    useRef(null)

  const audioChunksRef =
    useRef([])

  const timeoutRef =
    useRef(null)

  const fetchHistory =
    async () => {

    try {

      const {
        data: { user }
      } =
        await supabase.auth.getUser()

      if (!user) return

      const response =
        await axios.get(

          `http://localhost:5000/upload/transcriptions/${user.email}`
        )

      setHistory(response.data)

    } catch (error) {

      console.log(error)
    }
  }

  useEffect(() => {

    socket.on(
      "live-transcription",

      (text) => {

        if (
          text.trim() !== ""
        ) {

          setLiveText(text)

          clearTimeout(
            timeoutRef.current
          )

          timeoutRef.current =
            setTimeout(() => {

              setLiveText("")

            }, 2000)
        }
      }
    )

    return () => {

      socket.off(
        "live-transcription"
      )
    }

  }, [])

  const startRecording =
    async () => {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        })

      const mediaRecorder =
        new MediaRecorder(stream)

      mediaRecorderRef.current =
        mediaRecorder

      mediaRecorder.start(250)

      setRecording(true)

      audioChunksRef.current = []

      mediaRecorder.ondataavailable =
        (event) => {

        if (event.data.size > 0) {

          audioChunksRef.current.push(
            event.data
          )

          socket.emit(
            "audio-stream",
            event.data
          )
        }
      }

      mediaRecorder.onstop = () => {

        const audioBlob =
          new Blob(
            audioChunksRef.current,
            {
              type: "audio/webm",
            }
          )

        const audioFile =
          new File(
            [audioBlob],
            "recording.webm",
            {
              type: "audio/webm",
            }
          )

        setRecordedAudio(
          audioFile
        )

        setRecording(false)
      }

    } catch (error) {

      console.log(error)

      alert(
        "Microphone access denied"
      )
    }
  }

  const stopRecording = () => {

    mediaRecorderRef.current.stop()
  }

  const handleUpload =
    async () => {

    if (
      !uploadAudio &&
      !recordedAudio
    ) {

      alert(
        "Please select or record audio"
      )

      return
    }

    const {
      data: { user }
    } =
      await supabase.auth.getUser()

    const formData =
      new FormData()

    formData.append(

      "audio",

      uploadAudio ||
      recordedAudio
    )

    formData.append(
      "userEmail",
      user.email
    )

    try {

      setLoading(true)

      setTranscription("")

      const response =
        await axios.post(
          "http://localhost:5000/upload",
          formData
        )

      setTranscription(
        response.data.transcription
      )

      setUploadAudio(null)

      setRecordedAudio(null)

      fetchHistory()

    } catch (error) {

      console.log(error)

      alert(
        error.response?.data?.message ||
        "Upload failed"
      )

    } finally {

      setLoading(false)
    }
  }

  return (

    <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full flex flex-col gap-8 border border-gray-200">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Upload Section */}

        <div className="bg-blue-50 p-5 rounded-2xl shadow-md flex flex-col gap-4">

          <h2 className="text-xl font-bold text-blue-700">

            Upload Audio

          </h2>

          <input
            type="file"
            accept="audio/*"

            onChange={(e) => {

              const file =
                e.target.files[0]

              if (!file) return

              setUploadAudio(file)
            }}

            className="border p-3 rounded-xl bg-white"
          />

          <button
            onClick={handleUpload}

            disabled={loading}

            className={`text-white p-3 rounded-xl ${
              loading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >

            {
              loading
                ? "Uploading..."
                : "Upload"
            }

          </button>

        </div>

        {/* Recording Section */}

        <div className="bg-green-50 p-5 rounded-2xl shadow-md flex flex-col gap-4">

          <h2 className="text-xl font-bold text-green-700">

            Recording

          </h2>

          {
            !recording ? (

              <button
                onClick={startRecording}

                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl"
              >

                Start Recording

              </button>

            ) : (

              <button
                onClick={stopRecording}

                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl"
              >

                Stop Recording

              </button>
            )
          }

          {
            recordedAudio && (

              <p className="text-green-700 font-semibold">

                ✅ Recording Ready

              </p>
            )
          }

        </div>

        {/* Live Speech Section */}

        <div className="bg-yellow-50 p-5 rounded-2xl shadow-md flex flex-col gap-4">

          <h2 className="text-xl font-bold text-yellow-700">

            Live Speech To Text

          </h2>

          <div className="bg-white rounded-xl p-4 min-h-[120px] border">

            <p className="text-gray-700">

              {
                liveText ||

                (
                  recording
                  ? "🟢 Listening..."
                  : "Start speaking..."
                )
              }

            </p>

          </div>

        </div>

      </div>

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

      <button
        onClick={async () => {

          if (!showHistory) {

            await fetchHistory()
          }

          setShowHistory(
            !showHistory
          )
        }}

        className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl"
      >

        {
          showHistory
            ? "Hide History"
            : "Show History"
        }

      </button>

      {
        showHistory && (

          <div>

            <h2 className="text-2xl font-bold text-purple-700">

              Previous Transcriptions

            </h2>

            <div className="flex flex-col gap-3 mt-4">

              {
                history.map((item) => (

                  <div
                    key={item._id}

                    className="bg-white shadow-md border border-gray-200 p-4 rounded-2xl"
                  >

                    <p className="text-gray-700">

                      {
                        item.transcription
                      }

                    </p>

                  </div>
                ))
              }

            </div>

          </div>
        )
      }

    </div>
  )
}

export default UploadAudio
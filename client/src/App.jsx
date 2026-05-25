import UploadAudio from "./components/UploadAudio"

function App() {

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-6">

      <div className="w-full max-w-3xl">

        <h1 className="text-5xl font-extrabold text-center text-blue-700 mb-10 drop-shadow-md">

          AI Speech To Text

        </h1>

        <UploadAudio />

      </div>

    </div>
  )
}

export default App
import UploadAudio from "./components/UploadAudio"

function App() {

  return (

    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">

      <h1 className="text-5xl font-bold text-blue-600 mb-10">

        Speech To Text App

      </h1>

      <UploadAudio />

    </div>
  )
}

export default App
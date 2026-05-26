import UploadAudio
from "./components/UploadAudio"

import Auth
from "./components/Auth"

function App() {

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center gap-10 p-6">

      <h1 className="text-5xl font-extrabold text-blue-700">

        AI Speech To Text

      </h1>

      <Auth />

      <UploadAudio />

    </div>
  )
}

export default App
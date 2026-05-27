import {
  useEffect,
  useState
} from "react"

import UploadAudio
from "./components/UploadAudio"

import Auth
from "./components/Auth"

import supabase
from "./supabase/supabaseClient"

function App() {

  const [session, setSession] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    supabase.auth.getSession()
      .then(({ data: { session } }) => {

        setSession(session)

        setLoading(false)
      })

    const {
      data: listener
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {

        setSession(session)
      }
    )

    return () => {

      listener.subscription.unsubscribe()
    }

  }, [])

  const handleLogout = async () => {

    await supabase.auth.signOut()
  }

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-3xl font-bold">

        Loading...

      </div>
    )
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center gap-10 p-6">

      <h1 className="text-5xl font-extrabold text-blue-700 text-center">

        AI Speech To Text

      </h1>

      {
        !session ? (

          <Auth />

        ) : (

          <div className="w-full flex flex-col items-center gap-6">

            <div className="flex items-center gap-4">

              <p className="font-semibold text-lg">

                {
                  session.user.email
                }

              </p>

              <button
                onClick={handleLogout}

                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl shadow-md"
              >

                Logout

              </button>

            </div>

            <UploadAudio />

          </div>
        )
      }

    </div>
  )
}

export default App
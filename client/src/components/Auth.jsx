import { useState } from "react"

import supabase
from "../supabase/supabaseClient"

function Auth() {

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [message, setMessage] =
    useState("")

  const [errorMsg, setErrorMsg] =
    useState("")

  const handleSignup = async () => {

    if (!email || !password) {

      setErrorMsg(
        "Please fill all fields"
      )

      return
    }

    try {

      setLoading(true)

      const { error } =
        await supabase.auth.signUp({

          email,

          password,
        })

      if (error) {

        setErrorMsg(error.message)

        setMessage("")

      } else {

        setMessage(
          "Signup successful"
        )

        setErrorMsg("")
      }

    } catch (error) {

      console.log(error)

    } finally {

      setLoading(false)
    }
  }

  const handleLogin = async () => {

    if (!email || !password) {

      setErrorMsg(
        "Please fill all fields"
      )

      return
    }

    try {

      setLoading(true)

      const { error } =
        await supabase.auth.signInWithPassword({

          email,

          password,
        })

      if (error) {

        setErrorMsg(
          "Invalid email or password"
        )

        setMessage("")

      } else {

        setMessage(
          "Login successful"
        )

        setErrorMsg("")
      }

    } catch (error) {

      console.log(error)

    } finally {

      setLoading(false)
    }
  }

  return (

    <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col gap-5 w-full max-w-md">

      <h2 className="text-3xl font-bold text-center text-blue-700">

        Authentication

      </h2>

      <input
        type="email"
        placeholder="Enter email"

        value={email}

        onChange={(e) =>
          setEmail(e.target.value)
        }

        className="border p-3 rounded-xl"
      />

      <input
        type="password"
        placeholder="Enter password"

        value={password}

        onChange={(e) =>
          setPassword(e.target.value)
        }

        className="border p-3 rounded-xl"
      />

      <button
        onClick={handleSignup}

        className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl"
      >

        Sign Up

      </button>

      <button
        onClick={handleLogin}

        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl"
      >

        {
          loading
            ? "Loading..."
            : "Login"
        }

      </button>

      {
        message && (

          <p className="text-green-600 font-bold text-center">

            {message}

          </p>
        )
      }

      {
        errorMsg && (

          <p className="text-red-600 font-bold text-center">

            {errorMsg}

          </p>
        )
      }

    </div>
  )
}

export default Auth
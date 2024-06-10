import { useEffect, useRef, useState } from "react"
import Client from "./Client"
import Editor from "./Editor"
import { initSocket } from "../Socket"
import { ACTIONS } from "../Actions"
import { useNavigate, useLocation, Navigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"

function EditorPage() {
  const [clients, setClients] = useState([])
  const codeRef = useRef(null)

  const Location = useLocation()
  const navigate = useNavigate()
  const { roomId } = useParams()

  const socketRef = useRef(null)
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket()
      socketRef.current.on("connect_error", (err) => handleErrors(err))
      socketRef.current.on("connect_failed", (err) => handleErrors(err))

      const handleErrors = (err) => {
        console.log("Error", err)
        toast.error("Socket connection failed, Try again later")
        navigate("/")
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username
      })

      // Listen for new clients joining the chatroom
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          // this insure that new user connected message do not display to that user itself
          if (username !== Location.state?.username) {
            toast.success(`${username} joined the room.`)
          }
          setClients(clients)
          // also send the code to sync
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId
          })
        }
      )

      // listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`)
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId)
        })
      })
    }
    init()

    // cleanup
    return () => {
      socketRef?.current?.disconnect()
      socketRef.current.off(ACTIONS.JOINED)
      socketRef.current.off(ACTIONS.DISCONNECTED)
    }
  }, [Location.state?.username, navigate, roomId])

  if (!Location.state) {
    return <Navigate to="/" />
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      toast.success(`roomIs is copied`)
    } catch (error) {
      console.log(error)
      toast.error("unable to copy the room Id")
    }
  }

  const leaveRoom = async () => {
    navigate("/")
  }

  return (
    // <div className="h-full">
    <div className="flex flex-row h-[100vh] max-h-[100vh]">
      <div className="h-full bg-blue-300 text-black flex flex-col">
        {/* Client list container */}
        <div className="my-3 mb-4 font-bold mx-auto text-xl">Room Members</div>
        <div className="flex-grow overflow-auto ml-2">
          {clients.map((client) => (
            <Client key={client.socketId} username={client.username} />
          ))}
        </div>
        {/* Buttons */}
        <div className="flex flex-col w-40 ml-2">
          <button
            type="button"
            onClick={copyRoomId}
            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Copy Room ID
          </button>
          <button
            type="button"
            onClick={leaveRoom}
            className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Leave Room
          </button>
        </div>
      </div>

      {/* Editor panel */}
      <div className="w-full text-light">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code
          }}
        />
      </div>
    </div>
    // </div>
  )
}

export default EditorPage

import { useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { Editor as MonacoEditor } from "@monaco-editor/react"
import { ACTIONS } from "../Actions"

export default function Editor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null)

  useEffect(() => {
    const handleEditorChange = (value) => {
      onCodeChange(value)
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code: value
      })
    }

    if (editorRef.current) {
      const editor = editorRef.current
      editor.onDidChangeModelContent(() => {
        const code = editor.getValue()
        handleEditorChange(code)
      })
    }
  }, [onCodeChange, roomId, socketRef])

  useEffect(() => {
    const socketCurrent = socketRef.current
    if (socketCurrent) {
      socketCurrent.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null && editorRef.current) {
          const editor = editorRef.current
          const currentValue = editor.getValue()
          if (currentValue !== code) {
            editor.setValue(code)
          }
        }
      })
    }
    return () => {
      if (socketCurrent) {
        socketCurrent.off(ACTIONS.CODE_CHANGE)
      }
    }
  }, [socketRef])

  const handleEditorMount = (editor) => {
    editorRef.current = editor
  }

  return (
    <div className="h-full">
      <MonacoEditor
        height="100%"
        defaultLanguage="javascript"
        theme="vs-dark"
        onMount={handleEditorMount}
      />
    </div>
  )
}

Editor.propTypes = {
  socketRef: PropTypes.shape({
    current: PropTypes.object
  }).isRequired,
  roomId: PropTypes.string.isRequired,
  onCodeChange: PropTypes.func.isRequired
}

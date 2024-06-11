import PropTypes from "prop-types"
import { classnames } from "../../utils/general"

export default function CustomInput({ customInput, setCustomInput }) {
  return (
    <>
      <h1 className="font-bold text-xl">Input</h1>
      <textarea
        rows="10"
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        placeholder={`Custom input`}
        className={classnames(
          "focus:outline-none w-full border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white mt-2"
        )}
      />
    </>
  )
}

CustomInput.propTypes = {
  customInput: PropTypes.string.isRequired,
  setCustomInput: PropTypes.func.isRequired
}

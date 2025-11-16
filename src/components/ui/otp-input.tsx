/*eslint-disable */
import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion, useAnimationControls, Transition } from "framer-motion"
import { Check } from "lucide-react"

interface OTPInputBoxProps {
  index: number
  verifyOTP: () => void
  state: "idle" | "error" | "success"
}

const OTPInputBox = ({ index, verifyOTP, state }: OTPInputBoxProps) => {
  const animationControls = useAnimationControls()
  const springTransition: Transition = {
    type: "spring",
    stiffness: 700,
    damping: 20,
    delay: index * 0.05,
  }
  const noDelaySpringTransition: Transition = {
    type: "spring",
    stiffness: 700,
    damping: 20,
  }
  const slowSuccessTransition: Transition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    delay: index * 0.06,
  }

  useEffect(() => {
    animationControls.start({
      opacity: 1,
      y: 0,
      transition: springTransition,
    })
    if (index === 0) {
      setTimeout(() => {
        document.getElementById(`input-0`)?.focus()
      }, 100)
    }
    return () => animationControls.stop()
  }, [])

  useEffect(() => {
    if (state === "success") {
      const transitionX = index * 48
      animationControls.start({
        x: -transitionX,
        transition: slowSuccessTransition,
      })
    }
  }, [state, index, animationControls])

  const onFocus = () => {
    animationControls.start({ y: -5, transition: noDelaySpringTransition })
  }

  const onBlur = () => {
    animationControls.start({ y: 0, transition: noDelaySpringTransition })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    const { value } = target
    if (e.key === "Backspace" && !value && index > 0) {
      document.getElementById(`input-${index - 1}`)?.focus()
    } else if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`input-${index - 1}`)?.focus()
    } else if (e.key === "ArrowRight" && index < 5) {
      document.getElementById(`input-${index + 1}`)?.focus()
    }
  }

  const onInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    const { value } = target
    if (value.match(/^[0-9]$/)) {
      target.value = value
      if (index < 5) {
        document.getElementById(`input-${index + 1}`)?.focus()
      }
    } else {
      target.value = ""
    }
    verifyOTP()
  }

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6)
    const digits = pastedData.split("").filter((char) => /^[0-9]$/.test(char))

    digits.forEach((digit, i) => {
      const targetIndex = index + i
      if (targetIndex < 6) {
        const input = document.getElementById(`input-${targetIndex}`) as HTMLInputElement
        if (input) {
          input.value = digit
        }
      }
    })

    const nextFocusIndex = Math.min(index + digits.length, 5)
    document.getElementById(`input-${nextFocusIndex}`)?.focus()

    setTimeout(verifyOTP, 0)
  }

  return (
    <motion.div
      className={`w-10 h-12 sm:w-11 sm:h-14 rounded-lg ring-2 ring-transparent focus-within:shadow-inner overflow-hidden transition-all duration-300 ${
        state === "error"
          ? "ring-red-400 dark:ring-red-500"
          : state === "success"
            ? "ring-green-500"
            : "focus-within:ring-gray-400 dark:focus-within:ring-gray-500 ring-gray-200 dark:ring-gray-700"
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={animationControls}
    >
      <input
        id={`input-${index}`}
        type="text"
        inputMode="numeric"
        maxLength={1}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full h-full text-center text-xl sm:text-2xl font-semibold outline-none caret-slate-900 text-slate-900 bg-white"
        disabled={state === "success"}
      />
    </motion.div>
  )
}

const OTPSuccess = () => {
  return (
    <div className="flex items-center justify-center gap-4 w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 500, damping: 30 }}
        className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500 ring-4 ring-green-100 dark:ring-green-900 text-white flex items-center justify-center rounded-full"
      >
        <Check size={28} strokeWidth={3} className="sm:w-8 sm:h-8" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-green-700 font-semibold text-base sm:text-lg"
      >
        OTP Verified!
      </motion.p>
    </div>
  )
}

const OTPError = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="text-center text-red-600 font-medium mt-2 absolute -bottom-8 w-full text-xs sm:text-sm"
    >
      Invalid OTP. Please try again.
    </motion.div>
  )
}

interface OTPVerificationProps {
  email: string
  onVerify: (otp: string) => Promise<boolean>
  onResend: () => Promise<void>
  isLoading?: boolean
  error?: string
}

export function OTPVerification({ email, onVerify, onResend, isLoading = false, error }: OTPVerificationProps) {
  const [state, setState] = useState<"idle" | "error" | "success">("idle")
  const [countdown, setCountdown] = useState(60)
  const [isResendDisabled, setIsResendDisabled] = useState(true)
  const animationControls = useAnimationControls()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isResendDisabled) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(timer)
            setIsResendDisabled(false)
            return 0
          }
          return prevCountdown - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isResendDisabled])

  useEffect(() => {
    if (error) {
      setState("error")
      errorAnimation()
    } else if (state === "error") {
      setState("idle")
    }
  }, [error])

  const getCode = () => {
    let code = ""
    for (let i = 0; i < 6; i++) {
      const input = document.getElementById(`input-${i}`) as HTMLInputElement
      if (input) code += input.value
    }
    return code
  }

  const verifyOTP = async () => {
    const code = getCode()
    if (code.length < 6) {
      setState("idle")
      return
    }

    const result = await onVerify(code)
    if (result) {
      setState("success")
    } else {
      errorAnimation()
    }
  }

  const errorAnimation = async () => {
    setState("error")
    await animationControls.start({
      x: [0, 5, -5, 5, -5, 0],
      transition: { duration: 0.3 },
    })
    setTimeout(() => {
      if (getCode().length < 6) setState("idle")
    }, 500)
  }

  const handleResend = async () => {
    await onResend()
    setCountdown(60)
    setIsResendDisabled(true)
    for (let i = 0; i < 6; i++) {
      const input = document.getElementById(`input-${i}`) as HTMLInputElement
      if (input) input.value = ""
    }
    setState("idle")
  }

  return (
    <div
      className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-lg dark:shadow-gray-900/50 relative overflow-hidden"
      style={{
        backgroundImage: "url(https://media.giphy.com/media/3owypkjxtrXUvhJiCY/giphy.gif)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/97 rounded-2xl sm:rounded-3xl"></div>

      <div className="relative z-10">
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black dark:bg-white rounded-full flex items-center justify-center">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-semibold text-center text-slate-900 mb-2">
          {state === "success" ? "Verification Successful!" : "Enter Verification Code"}
        </h1>

        <AnimatePresence mode="wait">
          {state === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
              style={{ height: "232px" }}
            >
              <OTPSuccess />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-center text-slate-800 mt-2 mb-6 sm:mb-8 text-sm sm:text-base">
                We've sent a 6-digit code to
                <br /> <span className="font-medium text-slate-900 break-all">{email}</span>
              </p>

              <div className="flex flex-col items-center justify-center gap-2 mb-8 sm:mb-10 relative h-16 sm:h-20">
                <motion.div animate={animationControls} className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <OTPInputBox key={`input-${index}`} index={index} verifyOTP={verifyOTP} state={state} />
                  ))}
                </motion.div>
                <AnimatePresence>{state === "error" && <OTPError />}</AnimatePresence>
              </div>

              <div className="text-center">
                <span className="text-slate-700 text-sm sm:text-base">Didn't get a code? </span>
                {isResendDisabled ? (
                  <span className="text-slate-600 text-sm sm:text-base">Resend in {countdown}s</span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={isLoading}
                    className="font-medium text-slate-900 hover:underline focus:outline-none focus:ring-2 focus:ring-slate-400 rounded text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Click to resend
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}


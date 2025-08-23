'use client';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../ui/button/Button";
import { callbackSignIn, signIn } from "../../lib/canisters";
import LoadingOverlay from "../ui/LoadingOverlay";

export default function SignInForm() {
  const [open, setOpen] = useState(false)
  const [variant, _] = useState<"mosaic" | "dots" | "blinkBlur" | "spinner">('mosaic')
  const navigate = useNavigate()
  const callbackAfter = async () => {
        setOpen(true)
        const sign = await callbackSignIn()
        if (sign !== 'init') {
            if (sign) {
                navigate('/')
            } else {
                navigate('/signup')
            }
        }
        setOpen(false)
    }
    useEffect(() => {
        callbackAfter()
    }, [])
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <LoadingOverlay open={open} variant={variant} backdrop="dim" size="lg" color="#3145cc" />
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign in with internet identity!
            </p>
          </div>
          <div>
            <div className="space-y-6">
              <div>
                <Button className="w-full" size="sm" onClick={signIn}>
                  Sign in
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

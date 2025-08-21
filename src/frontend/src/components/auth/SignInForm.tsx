'use client';
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { Mosaic } from "react-loading-indicators";
import LoadingOverlay from "../ui/LoadingOverlay";
import { createActor } from 'declarations/user';

export default function SignInForm() {
  const [open, setOpen] = useState(true);
  const [variant, setVariant] = useState<'mosaic'|'dots'|'blinkBlur'|'spinner'>('mosaic');
  useEffect(() => {
    console.log(process.env);
  }, [])
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* <LoadingOverlay open={open} variant={variant} backdrop="dim" size="lg" color="#3145cc" /> */}
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign in with internet identity!
            </p>
          </div>
          <div>
            <form>
              <div className="space-y-6">
                <div>
                  <Button className="w-full" size="sm">
                    Sign in
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

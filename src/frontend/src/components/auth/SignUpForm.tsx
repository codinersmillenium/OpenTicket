
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import { useState } from "react";
import { initActor } from "../../lib/canisters";
import LoadingOverlay from "../ui/LoadingOverlay";
import { toast } from "react-toastify";

export default function SignUpForm() {
  const [open, setOpen] = useState(false)
  const options = [
    { value: "buyer", label: "Buyer" },
    { value: "seller", label: "Seller" },
  ];
  const [formData, setFormData]: any = useState({
      userName: '',
      lastName: '',
      firstName: '',
      role_: '',
  })

  const handleChange = (e: any) => {
      const { name, value } = e.target
      setFormData({
          ...formData,
          [name]: value
      })
  }

  const signUp = async (e: any) => {
    e.preventDefault();
    try {
        setOpen(true)
        const actor = await initActor()
        formData.role = {[formData.role_]: null}
        console.log(formData)
        await actor.registerUser(formData)
        setOpen(false)
        toast.success('Success register user...')
        setTimeout(() => {
            window.location.href = '/'
        }, 300);
    } catch (error) {
      toast.error('Failed register user...')
    }
  }
  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <LoadingOverlay open={open} />
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your profile to sign up!
            </p>
          </div>
          <div>
            <form onSubmit={signUp}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      First Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="fname"
                      name="firstName"
                      placeholder="Enter your first name"
                      onChange={handleChange}
                      required={true}
                    />
                  </div>
                  {/* <!-- Last Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Last Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="lname"
                      name="lastName"
                      placeholder="Enter your last name"
                      onChange={handleChange}
                      required={true}
                    />
                  </div>
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Username<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="username"
                    name="userName"
                    placeholder="Enter your username"
                    onChange={handleChange}
                    required={true}
                  />
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    For as<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <div>
                      <Select
                        options={options}
                        placeholder="Select Option"
                        onChange={handleChange}
                        className="dark:bg-dark-900"
                        name="role_"
                        required={true}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600" >
                    Sign Up
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

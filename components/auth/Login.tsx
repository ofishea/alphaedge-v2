"use client";
import Button from "@/components/Button";
import TextInput from "@/components/TextInput";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AiFillMail } from "react-icons/ai";
import Logo from "../Logo";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Container from "./Container";
import useTheme from "../hooks/useTheme";
import ThemeToggle from "../ThemeToggle";
import { signIn } from "next-auth/react";
import Link from "next/link";

const Login = () => {
  const router = useRouter();
  const { mode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    emailInput: "",
    passwordInput: "",
    isSecure: true,
  });

  const loginHandler = async () => {
    try {
      setLoading(true);
      const res = await signIn("credentials", {
        email: inputs.emailInput,
        password: inputs.passwordInput,
        redirect: false,
      });

      if (res?.error) throw new Error(res.error);
      router.replace("/home");
      toast.success("login successful");
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="flex flex-col gap-4 w-full items-center p-5">
        <Logo />

        {/* <ThemeToggle /> */}
      </div>

      <form
        className="flex flex-col gap-4 w-full p-5"
        onSubmit={(e) => {
          e.preventDefault();
          loginHandler();
        }}
      >
        <div className="flex flex-col gap-4 w-full">
          <TextInput
            id="email"
            icon={AiFillMail}
            placeholder="Enter Your Email or Username"
            value={inputs.emailInput}
            onChange={(e) =>
              setInputs({ ...inputs, emailInput: e.target.value })
            }
          />

          <TextInput
            id="password"
            icon={inputs.isSecure ? FaEye : FaEyeSlash}
            placeholder="Enter Your Password"
            secureEntry={inputs.isSecure}
            iconAction={() =>
              setInputs({ ...inputs, isSecure: !inputs.isSecure })
            }
            value={inputs.passwordInput}
            onChange={(e) =>
              setInputs({ ...inputs, passwordInput: e.target.value })
            }
          />
        </div>

        <Button
          type="submit"
          outline={false}
          small={false}
          label={"Sign In"}
          loading={loading}
          primaryColor="#7439b8"
        />
      </form>

      <div className="flex flex-col gap-4 w-full items-center">
        <div
          onClick={() => router.push("/forgot-password")}
          className={`text-sm text-gray-500 text-center underline 
          font-semibold sm:cursor-pointer hover:text-gray-400 
          active:scale-[.95] transition-all select-none w-fit`}
        >
          Forgot your password?
        </div>

        <div
          className={`font-semibold 
        ${mode === "light" ? "text-gray-500" : "text-gray-500 underline"}`}
        >
          <Link href={"/register"}>
            {" "}
            Don&apos;t have an account? create one.{" "}
          </Link>
        </div>

        {/* <Button
          outline
          label={"Create new acccount"}
          onClick={() => {
            router.push("/register");
          }}
        /> */}
      </div>
    </Container>
  );
};
export default Login;

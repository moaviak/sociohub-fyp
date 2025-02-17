import { z } from "zod";
import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signInSchema } from "@/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { Google } from "../components/google";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (values: z.infer<typeof signInSchema>) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="b4-medium">Email</FormLabel>
              <FormControl>
                <Input
                  className="outline-1 outline-neutral-300"
                  placeholder="john@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="b4-medium">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    className="outline-1 outline-neutral-300 pr-10"
                    placeholder="********"
                    type={showPassword ? "text" : "password"}
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <Eye className="w-5 h-5 text-neutral-500" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-neutral-500" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                />
              </FormControl>
              <div className="flex items-center justify-between w-full">
                <div className="space-y-1 leading-none">
                  <FormLabel className="b4-medium">Remember me</FormLabel>
                </div>
                <Link
                  to="/forgot-password"
                  className="b4-medium text-neutral-600"
                >
                  Forgot Password?
                </Link>
              </div>
            </FormItem>
          )}
        />

        <div className="space-y-4 pt-4">
          <Button type="submit" className="w-full" size="lg">
            Sign In
          </Button>

          <Google text="Sign In with Google" />
        </div>
      </form>
    </Form>
  );
};
export default SignIn;

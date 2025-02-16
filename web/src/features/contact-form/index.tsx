import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { contactFormSchema } from "@/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ContactForm = () => {
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "Society Registration",
      message: "",
    },
  });

  const onSubmit = (values: z.infer<typeof contactFormSchema>) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="b4-medium">First Name</FormLabel>
                <FormControl>
                  <Input
                    className="outline-1 outline-neutral-300"
                    placeholder="John"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="b4-medium">Last Name</FormLabel>
                <FormControl>
                  <Input
                    className="outline-1 outline-neutral-300"
                    placeholder="Doe"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="b4-medium">Email</FormLabel>
                <FormControl>
                  <Input
                    className="outline-1 outline-neutral-300"
                    placeholder="johndoe@example.com"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="b4-regular">
                  If you are a Society Advisor, please enter your official
                  email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="b4-medium">Phone Number</FormLabel>
                <FormControl>
                  <Input
                    className="outline-1 outline-neutral-300"
                    placeholder="+923xxxxxxxxx"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="b4-medium">Select Subject</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-12"
                >
                  <FormItem className="flex items-center gap-x-2">
                    <FormControl>
                      <RadioGroupItem
                        value="Society Registration"
                        className="m-0"
                      />
                    </FormControl>
                    <FormLabel className="b3-regular">
                      Society Registration
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-x-2">
                    <FormControl>
                      <RadioGroupItem value="General Inquiry" className="m-0" />
                    </FormControl>
                    <FormLabel className="b3-regular">
                      General Inquiry
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {form.getValues().subject === "Society Registration" && (
          <FormField
            control={form.control}
            name="societyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="b4-medium">Society Name</FormLabel>
                <FormControl>
                  <Input
                    className="outline-1 outline-neutral-300"
                    placeholder="Softech Society"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="b4-medium">Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your query in detail here."
                  className="resize-none outline-1 outline-neutral-300 h-20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="cursor-pointer ml-auto block"
        >
          Send Message
        </Button>
      </form>
    </Form>
  );
};
export default ContactForm;

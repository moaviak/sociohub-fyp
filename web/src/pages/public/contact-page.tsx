import { Mail, MapPin, PhoneCall } from "lucide-react";

import ContactForm from "@/features/contact-form";

function ContactPage() {
  return (
    <div className="flex flex-col justify-center py-10 px-20 w-ful gap-9">
      <div className="text-center">
        <h1 className="h1-bold">
          Need <span className="text-primary-600">Assistance?</span> We're Here
          to Help!
        </h1>
        <p className="b2-regular text-neutral-700">
          Any question or remarks? Just write us a message!
        </p>
      </div>

      <div className="w-full bg-white drop-shadow-e1 flex p-3 rounded-md">
        <div
          className="bg-cover bg-center flex flex-col gap-12 p-8 rounded-md w-md min-h-full"
          style={{ backgroundImage: "url('/assets/images/contact-bg.png')" }}
        >
          <div>
            <h4 className="h4-semibold text-white">Contact Information</h4>
            <p className="b2-regular text-neutral-300 mt-2">
              Say something to start a live chat!
            </p>
          </div>

          <div className="flex flex-col gap-y-2 py-4">
            <div className="flex gap-4 my-4 items-center">
              <PhoneCall className="w-5 text-white" />
              <p className="text-white b2-regular">+92-304-5818377</p>
            </div>
            <div className="flex gap-4 my-4 items-center">
              <Mail className="w-5 text-white" />
              <p className="text-white b2-regular">sociohub.site@gmail.com</p>
            </div>
            <div className="flex gap-4 my-4 items-center">
              <MapPin className="w-6 text-white" />
              <p className="text-white b2-regular">
                COMSATS University Islamabad, Attock Campus, Kamra Rd, Attock
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 py-6 px-12">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
export default ContactPage;

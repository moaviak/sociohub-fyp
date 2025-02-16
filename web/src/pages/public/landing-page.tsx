import { Button } from "@/components/ui/button";
import { Link } from "react-router";

function LandingPage() {
  return (
    <div className="w-full flex justify-center gap-x-4 p-10">
      <div className="flex-1 px-12 py-14">
        <div className="flex flex-col gap-y-4 mb-8">
          <h1 className="h1-bold">
            Simplify Society Management, Enhance Campus Life.
          </h1>
          <p className="b2-regular text-neutral-700">
            SocioHub streamlines event management, communication, and
            collaboration for societies at CUI Attock.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link to="/sign-up">Get Started</Link>
        </Button>
      </div>
      <div className="flex-1 flex justify-center">
        <img
          src="/assets/images/mobile-mockup.png"
          alt="mobile-mockup"
          className="bg-contain w-[320px]"
        />
      </div>
    </div>
  );
}
export default LandingPage;

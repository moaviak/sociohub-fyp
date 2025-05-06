import SocietySettings from "@/features/app/society-settings";

const SocietySettingsPage = () => {
  return (
    <div className="flex flex-col gap-y-4 px-4 py-2 max-h-full overflow-hidden h-full">
      <div className="">
        <h3 className="h3-semibold">Society Settings</h3>
        <p className="b3-regular">Update society settings.</p>
      </div>
      <div className="flex-1 flex min-h-0 overflow-hidden w-3xl m-auto">
        <SocietySettings />
      </div>
    </div>
  );
};
export default SocietySettingsPage;

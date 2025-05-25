export const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <div className="w-full flex items-center">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div
            key={stepNumber}
            className="flex items-center flex-1 last:flex-none"
          >
            {/* Step circle */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                isActive || isCompleted
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              } shrink-0`}
            >
              {stepNumber}
            </div>

            {/* Connector line */}
            {stepNumber < totalSteps && (
              <div className="h-1 bg-gray-200 flex-1 mx-2 relative rounded-lg">
                <div
                  className="h-1 bg-blue-600 absolute left-0 top-0 rounded-md"
                  style={{
                    width: isCompleted ? "100%" : isActive ? "50%" : "0%",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

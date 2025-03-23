interface EmptyStateProps {
  title: string;
  label: string;
}

export const EmptyState = ({ title, label }: EmptyStateProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-y-6 py-8">
      <img
        src="/assets/images/not-found.svg"
        alt="not-found"
        className="w-2xs"
      />
      <div className="text-center">
        <h4 className="h4-semibold">{title}</h4>
        <p className="b3-regular text-neutral-600">{label}</p>
      </div>
    </div>
  );
};

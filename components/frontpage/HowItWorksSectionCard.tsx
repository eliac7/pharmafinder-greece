function HowItWorksSectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-900 p-4 text-left shadow-lg tablet:rounded-br-lg tablet:rounded-tr-lg">
      <p className="text-sm leading-6">{children}</p>
    </div>
  );
}

export default HowItWorksSectionCard;

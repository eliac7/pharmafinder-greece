interface IHowItWorksSectionCardProps {
  icon: React.ReactNode;
  text: string;
}

function HowItWorksSectionCard({ icon, text }: IHowItWorksSectionCardProps) {
  return (
    <>
      <div className="flex items-center justify-center rounded-tl-lg rounded-tr-lg bg-gray-700 px-2 tablet:rounded-bl-lg tablet:rounded-tl-lg tablet:rounded-tr-none">
        <div className="h-full w-8 py-2 tablet:w-6 tablet:py-0">{icon}</div>
      </div>
      <div className="flex h-full w-full flex-col items-center justify-center bg-gray-900 p-4 text-left shadow-lg tablet:rounded-br-lg tablet:rounded-tr-lg">
        <p className="text-sm leading-6">{text}</p>
      </div>
    </>
  );
}

export default HowItWorksSectionCard;

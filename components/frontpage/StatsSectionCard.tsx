interface StatsProps {
  title: string;
  data: {
    total: number;
    title?: string;
  };
  isLoading: boolean;
}

function StatsCard({ title, data, isLoading }: StatsProps) {
  let total = data?.total ? data.total.toLocaleString("el-GR") : 0;

  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow-md transition duration-300 ease-in-out hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700">
      {isLoading ? (
        <div className="mb-4 h-4 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
      ) : (
        <p className="text-3xl font-bold text-gray-800 dark:text-white">
          {total}
        </p>
      )}
      <p className="text-md mt-2 text-center text-gray-500 dark:text-gray-300 tablet:mt-0 tablet:text-lg">
        {title}{" "}
        {data?.title ? <span className="font-bold">{data.title}</span> : null}
      </p>
    </div>
  );
}

export default StatsCard;

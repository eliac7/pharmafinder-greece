"use client";

export default function LoadingAnimation() {
  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm backdrop-filter dark:bg-gray-800 dark:bg-opacity-50">
      <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-white" />
    </div>
  );
}

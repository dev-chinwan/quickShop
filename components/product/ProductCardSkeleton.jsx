export default function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 skeleton rounded-full" />
        <div className="h-4 w-full skeleton rounded-lg" />
        <div className="h-3 w-10 skeleton rounded-full" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-14 skeleton rounded-lg" />
          <div className="h-8 w-16 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}

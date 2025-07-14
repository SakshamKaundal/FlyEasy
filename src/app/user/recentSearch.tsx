'use client';

interface SearchEntry {
  id?: number;
  query: {
    from: string;
    to: string;
    date: string;
    returnDate?: string;
  };
}

interface Props {
  searchHistory: SearchEntry[];
  onSelectSearch: (query: SearchEntry['query']) => void;
}

const RecentSearches: React.FC<Props> = ({ searchHistory, onSelectSearch }) => {
  if (!searchHistory || searchHistory.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mt-8">
      <h3 className="text-md font-medium mb-2 text-gray-700">Recent Searches</h3>
      <div className="flex flex-wrap gap-3">
        {searchHistory.map((entry, idx) => (
          <div
            key={idx}
            onClick={() => onSelectSearch(entry.query)}
            className="border px-4 py-2 rounded-md shadow-sm bg-white text-sm min-w-[160px] cursor-pointer hover:scale-[1.02] hover:-translate-x-1 hover:border-l-4 hover:border-l-blue-500 transform duration-150 border-blue-200"
          >
            <p className="font-semibold text-black">
              {entry.query.from} → {entry.query.to}
            </p>
            <p className="text-gray-600 text-xs">{entry.query.date}</p>
            {entry.query.returnDate && (
              <p className="text-gray-600 text-xs">Return: {entry.query.returnDate}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentSearches;

import { useRouter } from "next/router";
import { useState, useEffect } from "react";

interface SearchFormProps {
  keyword?: string;
  onSearch: (keyword: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ keyword = "", onSearch }) => {
  const [value, setValue] = useState(keyword);

  useEffect(() => {
    setValue(keyword);
  }, [keyword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(value);
  };
  return (
    <div className="pb-2">
      <form onSubmit={handleSubmit}>
        <input
          name="q"
          value={value}
          placeholder="원하는 클래스를 검색하세요!"
          onChange={handleChange}
          className="rounded-md bg-gray-600 bg-opacity-10 border border-gray-100 px-3 h-7 text-sm "
        />
        <button className="px-1">🔍</button>
      </form>
    </div>
  );
};

export default SearchForm;

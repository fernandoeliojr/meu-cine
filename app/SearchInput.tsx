const SearchInput = ({ searchQuery, setSearchQuery, handleSearch, hideIcon = false }: any) => (
  <form onSubmit={handleSearch} className="flex items-center gap-2">
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Pesquisar..."
      className="search-input text-sm"
    />
    {!hideIcon && (
      <button type="submit" className="text-white hover:text-[#e50914] p-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    )}
  </form>
);

export default SearchInput;

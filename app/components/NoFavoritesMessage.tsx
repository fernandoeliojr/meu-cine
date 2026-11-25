import React from 'react';

type NoFavoritesMessageProps = {
  message: string;
};

const NoFavoritesMessage: React.FC<NoFavoritesMessageProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-white font-times text-lg">
        {message}
      </p>
    </div>
  );
};

export default NoFavoritesMessage;
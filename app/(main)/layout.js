import React from "react";

const MainLayout = ({ children }) => {
  return (
    <div className="container mx-auto flex px-2 md:px-4 lg:px-0">
      {children}
    </div>
  );
};

export default MainLayout;

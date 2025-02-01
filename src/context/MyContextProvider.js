// src/context/MyContextProvider.js
import React, { createContext, useContext, useState } from 'react'; 

const MyContext = createContext();

const MyContextProvider = ({ children }) => {
  const [state, setState] = useState(null); 
  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
};

const useMyContext = () => useContext(MyContext);

export { MyContextProvider, useMyContext };

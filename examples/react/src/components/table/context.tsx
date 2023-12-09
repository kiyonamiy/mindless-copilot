/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState } from 'react';

const TableContext = createContext<{
  params: Record<string, any>;
  setParams?: (params: Record<string, any>) => void;
  initialValue?: object;
  initialParams?: object;
}>({
  params: {},
  setParams: undefined,
  initialValue: {},
  initialParams: {},
});

interface TableContextProviderProps {
  children: React.ReactNode;
  initialValue?: object;
  initialParams?: object;
}

export const TableContextProvider = ({
  children,
  initialValue,
  initialParams,
}: TableContextProviderProps) => {
  const [params, setParams] = useState<Record<string, any>>(
    initialParams ? initialParams : {},
  );
  return (
    <TableContext.Provider value={{ params, setParams, initialValue }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTableContext = () => {
  return useContext(TableContext);
};

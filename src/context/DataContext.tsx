import React, { createContext, useContext } from "react";
import { Property } from "../types/Property";
import { PROPS } from "../data/properties";

export const DataContext = createContext<Property[]>(PROPS);
export function useProperties() {
  return useContext(DataContext);
}

"use client";
import React, { useState, useMemo } from "react";

type StringKeys<T> = {
  [K in keyof T]: T[K] extends string | string[] ? K : never;
}[keyof T];
interface UseSearchProps<T> {
  data: T[];
  accessorKey: (StringKeys<T> | string)[];
}

const getNestedValue = (obj: any, path: string): any => {
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const useSearch = <T>({ data, accessorKey }: UseSearchProps<T>) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const searchedData = useMemo(() => {
    console.log(searchTerm);
    return data.filter((item) =>
      accessorKey.some((key) => {
        if (!searchTerm) return true;

        const value = getNestedValue(item, key);
        if (!value) return false;

        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (Array.isArray(value)) {
          return value.some((innerValue) =>
            typeof innerValue === "string"
              ? innerValue.toLowerCase().includes(searchTerm.toLowerCase())
              : false
          );
        }
        return false;
      })
    );
  }, [data, accessorKey, searchTerm]);

  return { searchedData, searchTerm, setSearchTerm };
};

export default useSearch;

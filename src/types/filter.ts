// Improved useFilter types/interfaces (renamed for clarity to filter.types.ts or similar)
import React from "react";

export type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;

export type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<
          DotNestedKeys<T[K]>
        >}`;
      }[Exclude<keyof T, symbol>]
    : ""
) extends infer D
  ? Extract<D, string>
  : never;

export interface FilterProps<T> {
  className?: string;
  applyFilter: applyFilterProps<T>;
  filters: TFilter<T>[];
  selectedFilters: TSelectedFilter<T>[];
  type?: "dropdown" | "menu";
  showLabels: boolean;
}

export type TSelectedFilter<T> = {
  key: DotNestedKeys<T>;
  label: string;
  value: Date | [Date, Date] | number[] | string[] | string | boolean;
  type?: TFilterType;
  onFilter: onFilterProps<T> | null;
};

export interface TFilter<T> {
  options?: TOption[];
  accessor: DotNestedKeys<T>;
  label: string;
  onFilter?: onFilterProps<T>;
  type?: TFilterType;
  steps?: number;
  max?: number;
  optionsFromData?: boolean;
  icon?: React.ReactNode;
  order?: number;
  defaultValue?: TSelectedFilter<T>["value"];
}

export type TFilterType =
  | "single"
  | "multiple"
  | "range"
  | "slider"
  | "dateSingle"
  | "dateRange"
  | "boolean";

export type TOption = {
  label: string;
  value: any;
};

export type onFilterProps<T> = (data: T, value: any[] | any) => boolean;

export type applyFilterProps<T> = (
  key: DotNestedKeys<T>,
  label: string,
  value: TSelectedFilter<T>["value"],
  onFilter?: onFilterProps<T>,
  type?: TFilterType
) => void;

export interface FilterOptionsProps<T> {
  filter: TFilter<T>;
  selectedFilters: TSelectedFilter<T>[];
  applyFilter: applyFilterProps<T>;
}

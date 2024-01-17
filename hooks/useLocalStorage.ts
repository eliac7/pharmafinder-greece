"use client";

import { useState } from "react";

type UseLocalStorageResult<T> = [T, (value: T) => void, () => void];

// Function to get an item from local storage
function useLocalStorage<T>(
  key: string,
  initialValue: T,
): UseLocalStorageResult<T> {
  const getItem = (): T => {
    // Check if running in a browser environment
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      console.error(`Error retrieving data from local storage: ${error}`);
      return initialValue;
    }
  };

  // Function to set an item in local storage
  const setItem = (value: T): void => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error storing data in local storage: ${error}`);
    }
  };

  // Function to remove an item from local storage
  const removeItem = (): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data from local storage: ${error}`);
    }
  };

  // Initialize state with the value from local storage
  const [storedValue, setStoredValue] = useState<T>(() => getItem());

  // Function to update state and local storage
  const updateValue = (value: T): void => {
    setStoredValue(value);
    setItem(value);
  };

  return [storedValue, updateValue, removeItem];
}

export default useLocalStorage;

"use client";

import { useState } from "react";
import { AirportsData } from "@/types/flight-data";
import { getAllAirportCodes, getAirportName } from "@/utils/airport-utils";
import {
  formatDateForInput,
  getMinSelectableDate,
  getMaxSelectableDate,
  isDateInAvailableRange,
  parseDateFromInput,
} from "@/utils/date-utils";
import styles from "./SearchForm.module.css";

export interface SearchFormData {
  origin: string;
  destination: string;
  departureDate: Date;
}

interface SearchFormProps {
  airports: AirportsData;
  onSearch: (formData: SearchFormData) => void;
}

export default function SearchForm({ airports, onSearch }: SearchFormProps) {
  const [origin, setOrigin] = useState("AMS"); // Default to Amsterdam since data is AMS-only
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableAirportCodes = getAllAirportCodes(airports);
  const minDate = formatDateForInput(getMinSelectableDate());
  const maxDate = formatDateForInput(getMaxSelectableDate());

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Origin validation
    if (!origin) {
      newErrors.origin = "Please select an origin airport";
    } else if (!availableAirportCodes.includes(origin.toUpperCase())) {
      newErrors.origin = "Please select a valid origin airport";
    }

    // Destination validation
    if (!destination) {
      newErrors.destination = "Please select a destination airport";
    } else if (!availableAirportCodes.includes(destination.toUpperCase())) {
      newErrors.destination = "Please select a valid destination airport";
    } else if (destination.toUpperCase() === origin.toUpperCase()) {
      newErrors.destination = "Destination must be different from origin";
    }

    // Departure date validation
    if (!departureDate) {
      newErrors.departureDate = "Please select a departure date";
    } else {
      const selectedDate = parseDateFromInput(departureDate);
      if (!isDateInAvailableRange(selectedDate)) {
        newErrors.departureDate =
          "Selected date is outside available range (Nov 10-30, 2022)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const formData: SearchFormData = {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departureDate: parseDateFromInput(departureDate),
      };

      onSearch(formData);
    }
  };

  return (
    <div className={styles.searchFormContainer}>
      <h1 className={styles.title}>Find Your Flight</h1>

      <form className={styles.formWrapper} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="origin" className={styles.label}>
            Origin Airport
          </label>
          <select
            id="origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className={`${styles.select} ${errors.origin ? styles.inputError : ""}`}
            aria-describedby={errors.origin ? "origin-error" : undefined}
          >
            <option value="">Select origin airport</option>
            {availableAirportCodes.map((code) => (
              <option key={code} value={code}>
                {code} - {getAirportName(airports, code)}
              </option>
            ))}
          </select>
          {errors.origin && (
            <span id="origin-error" className={styles.errorMessage}>
              {errors.origin}
            </span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="destination" className={styles.label}>
            Destination Airport
          </label>
          <select
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={`${styles.select} ${errors.destination ? styles.inputError : ""}`}
            aria-describedby={
              errors.destination ? "destination-error" : undefined
            }
          >
            <option value="">Select destination airport</option>
            {availableAirportCodes.map((code) => (
              <option key={code} value={code}>
                {code} - {getAirportName(airports, code)}
              </option>
            ))}
          </select>
          {errors.destination && (
            <span id="destination-error" className={styles.errorMessage}>
              {errors.destination}
            </span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="departureDate" className={styles.label}>
            Departure Date
          </label>
          <input
            type="date"
            id="departureDate"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className={`${styles.dateInput} ${errors.departureDate ? styles.inputError : ""}`}
            aria-describedby={errors.departureDate ? "date-error" : undefined}
          />
          {errors.departureDate && (
            <span id="date-error" className={styles.errorMessage}>
              {errors.departureDate}
            </span>
          )}
        </div>

        <button
          type="submit"
          className={styles.searchButton}
          onClick={handleSubmit}
        >
          Search Flights
        </button>
      </form>
    </div>
  );
}

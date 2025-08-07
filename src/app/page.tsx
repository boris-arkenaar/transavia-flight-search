"use client";

import { useState, useEffect } from "react";
import SearchForm, { SearchFormData } from "@/components/SearchForm";
import FlightResults from "@/components/FlightResults";
import { AirportsData, FlightsData, FlightOffer } from "@/types/flight-data";
import {
  searchFlights,
  sortFlightsByDepartureTime,
} from "@/utils/flight-utils";
import styles from "./page.module.css";

export default function FlightSearchPage() {
  const [airports, setAirports] = useState<AirportsData | null>(null);
  const [flights, setFlights] = useState<FlightsData | null>(null);
  const [searchResults, setSearchResults] = useState<FlightOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  // Load the JSON data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load airports data
        const airportsResponse = await fetch("/data/airports.json");
        if (!airportsResponse.ok) {
          throw new Error("Failed to load airports data");
        }
        const airportsData: AirportsData = await airportsResponse.json();
        if (!airportsData) {
          throw new Error("Airports data is empty or invalid");
        }
        setAirports(airportsData);

        // Load flights data
        const flightsResponse = await fetch("/data/flights-from-AMS.json");
        if (!flightsResponse.ok) {
          throw new Error("Failed to load flights data");
        }
        const flightsData: FlightsData = await flightsResponse.json();
        if (!flightsData) {
          throw new Error("Flights data is empty or invalid");
        }
        setFlights(flightsData);
      } catch (error) {
        setDataLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load flight data. Please refresh the page to try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = async (searchData: SearchFormData) => {
    if (!flights) {
      console.error("Flights data not available while searching");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    // Simulate a brief loading delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Check if origin is AMS (the only supported origin in our data)
      if (searchData.origin !== "AMS") {
        // Handle non-AMS origins gracefully
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      const results = searchFlights(
        flights,
        searchData.destination,
        searchData.departureDate,
      );

      const sortedResults = sortFlightsByDepartureTime(results);

      setSearchResults(sortedResults);
    } catch (error) {
      console.error("Error during flight search:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while initial data loads
  if (isLoading && !(airports && flights)) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <h2>Loading flight search...</h2>
          <p>Please wait while we prepare your flight search experience.</p>
        </div>
      </div>
    );
  }

  // Show error state if data loading failed
  if (dataLoadError) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Unable to Load Flight Data</h2>
          <p>{dataLoadError}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show main application once data is loaded
  if (!airports || !flights) {
    return null; // This shouldn't happen, but TypeScript safety
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.brandTitle}>
            <span className={styles.brandIcon}>✈️</span>
            Transavia Flight Search
          </h1>
          <p className={styles.tagline}>Find your perfect flight with ease</p>
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.searchSection}>
          <SearchForm airports={airports} onSearch={handleSearch} />
        </section>

        {hasSearched && (
          <section className={styles.resultsSection}>
            <FlightResults
              flights={searchResults}
              airports={airports}
              isLoading={isLoading}
            />
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>
            This is a technical demonstration built for Transavia&apos;s
            front-end developer assessment.
          </p>
          <p className={styles.dataInfo}>
            Flight data available for Amsterdam (AMS) departures from November
            10-30, 2022.
          </p>
        </div>
      </footer>
    </div>
  );
}

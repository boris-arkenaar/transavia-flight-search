import {
  findAirportByCode,
  getAirportName,
  getAllAirportCodes,
} from "@/utils/airport-utils";
import { AirportsData } from "@/types/flight-data";

const mockAirportsData: AirportsData = {
  Airports: [
    {
      ItemName: "AMS",
      AirportName: "Amsterdam (Schiphol)",
      Description: "Amsterdam (Schiphol), Netherlands",
    },
    {
      ItemName: "CDG",
      AirportName: "Paris Charles de Gaulle",
      Description: "Paris Charles de Gaulle, France",
    },
    {
      ItemName: "LHR",
      AirportName: "London Heathrow",
      Description: "London Heathrow, United Kingdom",
    },
    {
      ItemName: "FNC",
      AirportName: "Funchal",
      Description: "Funchal, Portugal",
    },
  ],
};

describe("Airport Utilities", () => {
  describe("findAirportByCode", () => {
    it("returns airport when code matches exactly", () => {
      const result = findAirportByCode(mockAirportsData, "AMS");

      expect(result).toBeDefined();
      expect(result?.ItemName).toBe("AMS");
      expect(result?.AirportName).toBe("Amsterdam (Schiphol)");
    });

    it("returns airport when code matches case-insensitively", () => {
      const result = findAirportByCode(mockAirportsData, "ams");

      expect(result).toBeDefined();
      expect(result?.ItemName).toBe("AMS");
    });

    it("returns airport when code is in mixed case", () => {
      const result = findAirportByCode(mockAirportsData, "AmS");

      expect(result).toBeDefined();
      expect(result?.ItemName).toBe("AMS");
    });

    it("returns undefined when airport code is not found", () => {
      const result = findAirportByCode(mockAirportsData, "XYZ");

      expect(result).toBeUndefined();
    });

    it("returns undefined when airport code is empty", () => {
      const result = findAirportByCode(mockAirportsData, "");

      expect(result).toBeUndefined();
    });
  });

  describe("getAirportName", () => {
    it("returns airport name when code is found", () => {
      const result = getAirportName(mockAirportsData, "CDG");

      expect(result).toBe("Paris Charles de Gaulle");
    });

    it("returns airport name case-insensitively", () => {
      const result = getAirportName(mockAirportsData, "cdg");

      expect(result).toBe("Paris Charles de Gaulle");
    });

    it("returns the code itself when airport is not found (fallback)", () => {
      const result = getAirportName(mockAirportsData, "XYZ");

      expect(result).toBe("XYZ");
    });

    it("returns empty string when code is empty", () => {
      const result = getAirportName(mockAirportsData, "");

      expect(result).toBe("");
    });

    it("handles non-existent codes gracefully", () => {
      const result = getAirportName(mockAirportsData, "INVALID");

      expect(result).toBe("INVALID");
    });
  });

  describe("getAllAirportCodes", () => {
    it("returns all airport codes from the data", () => {
      const result = getAllAirportCodes(mockAirportsData);

      expect(result).toHaveLength(4);
      expect(result).toEqual(["AMS", "CDG", "LHR", "FNC"]);
    });

    it("handles empty airports data", () => {
      const emptyData: AirportsData = { Airports: [] };
      const result = getAllAirportCodes(emptyData);

      expect(result).toEqual([]);
    });

    it("returns new array (does not mutate original)", () => {
      const result1 = getAllAirportCodes(mockAirportsData);
      const result2 = getAllAirportCodes(mockAirportsData);

      // Should be equal but not the same reference
      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2);
    });
  });

  describe("Integration Tests", () => {
    it("getAllAirportCodes works with findAirportByCode", () => {
      const codes = getAllAirportCodes(mockAirportsData);

      // Every code returned should be findable
      codes.forEach((code) => {
        const airport = findAirportByCode(mockAirportsData, code);
        expect(airport).toBeDefined();
        expect(airport?.ItemName).toBe(code);
      });
    });

    it("getAirportName works with getAllAirportCodes", () => {
      const codes = getAllAirportCodes(mockAirportsData);

      // Every code should have a display name
      codes.forEach((code) => {
        const displayName = getAirportName(mockAirportsData, code);
        expect(displayName).toBeDefined();
        expect(displayName).not.toBe(code); // Should be the full name, not the code
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles special characters in airport names", () => {
      const specialData: AirportsData = {
        Airports: [
          {
            ItemName: "TEST",
            AirportName: "Test Airport (São Paulo)",
            Description: "Test Airport, São Paulo, Brazil",
          },
        ],
      };

      const displayName = getAirportName(specialData, "TEST");
      expect(displayName).toBe("Test Airport (São Paulo)");
    });

    it("handles duplicate airport codes (uses first occurrence)", () => {
      const duplicateData: AirportsData = {
        Airports: [
          {
            ItemName: "DUP",
            AirportName: "First Airport",
            Description: "First Airport",
          },
          {
            ItemName: "DUP",
            AirportName: "Second Airport",
            Description: "Second Airport",
          },
        ],
      };

      const airport = findAirportByCode(duplicateData, "DUP");
      expect(airport?.AirportName).toBe("First Airport");
    });

    it("handles airports data with missing properties gracefully", () => {
      const incompleteData: AirportsData = {
        Airports: [
          {
            ItemName: "INC",
            AirportName: "",
            Description: "Incomplete Airport",
          },
        ],
      };

      const displayName = getAirportName(incompleteData, "INC");
      expect(displayName).toBe(""); // Should return empty string, not fall back to code
    });
  });
});

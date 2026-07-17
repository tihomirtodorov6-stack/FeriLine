import { countries } from "../config/countries";

export default function CountrySelector() {
  return (
    <select>
      {countries.map((country) => (
        <option key={country.code}>
          {country.flag} {country.name} {country.code}
        </option>
      ))}
    </select>
  );
}

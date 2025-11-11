
import 'dotenv/config';
import axios from "axios";

const apiKey = process.env.OPENWEATHER_API_KEY;

async function getLocation() {
  const res = await axios.get("https://ipapi.co/json/");
  const data = res.data;
  return {
    city: data.city,
    region: data.region,
    country: data.country_name,
  };
}


async function getWeather(city) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("OpenWeather API error:", data);
    return;
  }

  console.log(`City: ${city}`);
  console.log(`Temp: ${data.main.temp}°F`);
  console.log(`Condition: ${data.weather[0].main}`);

}

async function main() {
  try {
    const location = await getLocation();
    if (!location.city) {
      console.log("Could not detect location.");
      return;
    }

    console.log(`Detected location: ${location.city}, ${location.country}`);
    await getWeather(location.city);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();

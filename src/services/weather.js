import { WEATHER_API_KEY, WEATHER_CITY } from '../constants';

const BASE = 'https://api.openweathermap.org/data/2.5';

export const getWeather = async () => {
  try {
    const res  = await fetch(`${BASE}/weather?q=${WEATHER_CITY}&appid=${WEATHER_API_KEY}&units=metric&lang=es`);
    const data = await res.json();

    if (data.cod !== 200) throw new Error('No se pudo obtener el clima');

    const temp        = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon        = data.weather[0].main;

    let recommendation = '';
    if (temp >= 28) {
      recommendation = '🧊 Hace calor, te recomendamos un Frappé o Café Frío';
    } else if (temp >= 20) {
      recommendation = '☕ Clima perfecto para un Cappuccino';
    } else {
      recommendation = '🍵 Día fresco, ideal para un Latte o Té caliente';
    }

    return { temp, description, icon, recommendation, city: WEATHER_CITY };
  } catch (err) {
    console.error('Error clima:', err.message);
    return null;
  }
};

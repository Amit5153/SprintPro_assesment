import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Calendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [starColors, setStarColors] = useState<{ [key: string]: string }>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const response = await axios.get<any>(
        `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`
      );
      setEvents(response.data.births);
    } catch (error) {
      console.error('Error when fetching API:', error);
    }
  };

  const handleSearch = () => {
    const filteredEvents = events.filter((event: any) => event.text.toLowerCase().includes(search.toLowerCase()));
    setEvents(filteredEvents);
  };

  const addToFavorites = (text: string) => {
    let isDuplicate = false;
    for (const favorite of favorites) {
      if (favorite === text) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      setFavorites([...favorites, text]);
      setStarColors({ ...starColors, [text]: 'yellow' });
    }
  };

  const handleDateChange = async (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const selectedMonth = String(date.getMonth() + 1).padStart(2, '0');
      const selectedDay = String(date.getDate()).padStart(2, '0');
      try {
        const response = await axios.get<any>(
          `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${selectedMonth}/${selectedDay}`
        );
        setEvents(response.data.births);
      } catch (error) {
        console.error('Error when fetching API:', error);
      }
    }
  };

  return (
    <div className="container">
      <div className="calendar">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar value={selectedDate} onChange={handleDateChange} />
        </LocalizationProvider>
      </div>

      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name" />
      <button onClick={handleSearch}>Search</button>

      <div className="boxes" style={{ display: 'flex' }}>
        <ul>
          {events.map((event: any, idx: number) => (
            <div className="table" style={{ display: 'flex' }} key={idx}>
              <li>{event.text}</li>
              <span
                onClick={() => addToFavorites(event.text)}
                style={{ color: starColors[event.text] ? starColors[event.text] : '' }}
              >
                <StarIcon />
              </span>
            </div>
          ))}
        </ul>

        <div>
          <h2>Favorites</h2>
          <ul>
            {favorites.map((favorite: string, idx: number) => (
              <li key={idx}>{favorite}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

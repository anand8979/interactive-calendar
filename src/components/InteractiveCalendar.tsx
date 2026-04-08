import { useEffect, useMemo, useState } from 'react';

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Different scenic images for each month
const monthImages: string[] = [
  '/images/image.jpg',    // January
  '/images/image1.jpg',   // February
  '/images/image2.jpg',   // March
  '/images/image3.jpg',   // April
  '/images/image4.jpg',   // May
  '/images/image5.jpg',   // June
  '/images/image6.jpg',   // July
  '/images/image7.jpg',   // August
  '/images/image8.jpg',   // September
  '/images/image9.jpg',   // October
  '/images/image10.jpg',  // November
  '/images/image11.jpg',  // December
];

function getCalendarCells(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const monthStartWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: Array<{ date: Date; currentMonth: boolean }> = [];

  for (let i = 0; i < monthStartWeekday; i += 1) {
    cells.push({
      date: new Date(year, month - 1, prevMonthDays - monthStartWeekday + 1 + i),
      currentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), currentMonth: true });
  }

  const nextMonthDayCount = 42 - cells.length;
  for (let day = 1; day <= nextMonthDayCount; day += 1) {
    cells.push({ date: new Date(year, month + 1, day), currentMonth: false });
  }

  return cells;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateInRange(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  return date >= start && date <= end;
}

const storageKey = 'tuf-calendar-notes';

function loadNotes() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveNotes(notes: Record<string, string>) {
  localStorage.setItem(storageKey, JSON.stringify(notes));
}

export default function InteractiveCalendar() {
  const [selectedYear, setSelectedYear] = useState(2022);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(() => loadNotes());
  const [draftNote, setDraftNote] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('calendar-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('calendar-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const cells = useMemo(
    () => getCalendarCells(selectedYear, selectedMonth),
    [selectedYear, selectedMonth],
  );

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];

  const selectedRangeKey = useMemo(() => {
    if (!startDate) return null;
    if (!endDate) return formatDate(startDate);
    return `${formatDate(startDate)}_${formatDate(endDate)}`;
  }, [startDate, endDate]);

  useEffect(() => {
    if (selectedRangeKey && notes[selectedRangeKey]) {
      setDraftNote(notes[selectedRangeKey]);
    } else {
      setDraftNote('');
    }
  }, [selectedRangeKey, notes]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((year) => year - 1);
    } else {
      setSelectedMonth((month) => month - 1);
    }
    setStartDate(null);
    setEndDate(null);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((year) => year + 1);
    } else {
      setSelectedMonth((month) => month + 1);
    }
    setStartDate(null);
    setEndDate(null);
  };

  const handleDayClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      return;
    }

    if (startDate && !endDate) {
      if (date < startDate) {
        setStartDate(date);
        return;
      }

      if (date.getTime() === startDate.getTime()) {
        setStartDate(date);
        setEndDate(null);
        return;
      }

      setEndDate(date);
    }
  };

  const handleNoteSave = () => {
    if (!selectedRangeKey) return;
    const trimmed = draftNote.trim();
    const updated = { ...notes };

    if (trimmed === '') {
      delete updated[selectedRangeKey];
    } else {
      updated[selectedRangeKey] = trimmed;
    }

    setNotes(updated);
    saveNotes(updated);
  };

  return (
    <section className="calendar-container">
      <button
        type="button"
        className="theme-toggle-button"
        onClick={() => setIsDarkMode(!isDarkMode)}
        aria-label="Toggle dark mode"
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <div className="spiral-binding" aria-hidden="true" />

      <div className={`calendar-card${isDarkMode ? ' dark' : ''}`}>
        <div className="calendar-header">
          <div className="hero-section">
            <div
              className="hero-image"
              aria-hidden="true"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(91, 122, 204, 0.4), rgba(61, 90, 158, 0.5)), url('${monthImages[selectedMonth]}')`,
              }}
            />
          </div>

          <div className="month-banner">
            <div className="banner-shape" aria-hidden="true" />
            <div className="banner-content">
              <span className="year">{selectedYear}</span>
              <span className="month">{monthNames[selectedMonth]}</span>
            </div>
          </div>
        </div>

        <div className="calendar-body">
            <div className="notes-section">
            <h2 className="notes-title">Notes</h2>
            <div className="notes-display">
              <div className="note-lines">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="note-line" />
                ))}
              </div>
              {selectedRangeKey && notes[selectedRangeKey] && (
                <div className="note-preview">
                  <p>{notes[selectedRangeKey]}</p>
                </div>
              )}
            </div>
            <textarea
              value={draftNote}
              onChange={(event) => setDraftNote(event.target.value)}
              placeholder={selectedRangeKey ? 'Write a note for the selected date or range...' : 'Select a date or range to add a note.'}
              className="notes-textarea"
              disabled={!selectedRangeKey}
            />
            <button
              type="button"
              className="save-note-button"
              onClick={handleNoteSave}
              disabled={!selectedRangeKey}
            >
              Save Note
            </button>
          </div>

          <div className="grid-panel">
            <div className="grid-header">
              <button type="button" className="nav-button" onClick={handlePrevMonth}>
                &#8249;
              </button>
              <span className="month-year-display">
                {monthNames[selectedMonth]} {selectedYear}
              </span>
              <button type="button" className="nav-button" onClick={handleNextMonth}>
                &#8250;
              </button>
            </div>

            <div className="calendar-grid">
              <div className="weekdays">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className={`weekday-cell ${day === 'Sat' || day === 'Sun' ? 'weekend' : ''}`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="dates-grid">
                {cells.map(({ date, currentMonth }) => {
                  const inRange = dateInRange(date, startDate, endDate);
                  const isStart = startDate?.getTime() === date.getTime();
                  const isEnd = endDate?.getTime() === date.getTime();
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <button
                      key={`${date.toISOString()}`}
                      type="button"
                      onClick={() => handleDayClick(date)}
                      className={`date-cell day-button ${currentMonth ? 'current-month' : 'other-month'} ${inRange || isStart || isEnd ? 'highlighted' : ''} ${isWeekend ? 'weekend-date' : ''}`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

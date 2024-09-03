'use client'
import React, { useState } from 'react'
import Calendar from './calendar';

const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Initialize with today's date

  const handleDateChange = (date: Date) => {
    const correctedDate = new Date(date);
    correctedDate.setMinutes(correctedDate.getMinutes() - correctedDate.getTimezoneOffset());
    setSelectedDate(correctedDate.toISOString().split('T')[0]);
  };

  return (
    <div>
      <Calendar onDateChange={handleDateChange} />
    </div>
  )
}

export default HomePage
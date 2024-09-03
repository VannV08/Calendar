"use client";

// components/Calendar.tsx
import React, { useState, useEffect } from "react";
import "./calendar.css";
import ProfileButton from "./components/profile-button";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";


const Calendar: React.FC<{ onDateChange: (date: Date) => void }> = ({
  onDateChange,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showFullCalendar, setShowFullCalendar] = useState<boolean>(false);
  const [showTodayButton, setShowTodayButton] = useState<boolean>(false);
  const [eventDates, setEventDates] = useState<Set<string>>(new Set()); // Store date with events
  const [eventCounts, setEventCounts] = useState<Map<string, number>>(new Map());
  const [holidays, setHolidays] = useState<{ name: string; date: string }[]>([]);
  const [selectedHoliday, setSelectedHoliday] = useState<string | null>(null); // To track the holiday name

  const nextPeriod = (): void => {
    if (showFullCalendar) {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const prevPeriod = (): void => {
    if (showFullCalendar) {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const toggleFullCalendar = (): void => {
    setShowFullCalendar(!showFullCalendar);
  };

  const goToToday = (): void => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ensure the time is set to midnight for accurate comparison

    setCurrentDate(today);
    setSelectedDate(today); // Ensure today is selected

    handleDateClick(today); // Manually trigger the date click to fetch events for today
    checkTodayHoliday(); // Optional: If you also want to check if today is a holiday
  };

  const isTodayVisible = (): boolean => {
    if (showFullCalendar) {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart);
      const endDate = endOfWeek(monthEnd);

      let day = startDate;
      while (day <= endDate) {
        if (isToday(day)) {
          return true;
        }
        day = addDays(day, 1);
      }
      return false;
    } else {
      const startDate = startOfWeek(currentDate);
      for (let i = 0; i < 7; i++) {
        if (isToday(addDays(startDate, i))) {
          return true;
        }
      }
      return false;
    }
  };

  useEffect(() => {
    setShowTodayButton(!isTodayVisible());
  }, [currentDate, showFullCalendar]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch(
          "http://localhost:8011/api/holidays?countryCode=KH&year=2023"
        );
        const data = await response.json();

        // Adjust holidays to 2024
        const adjustedHolidays = data.map(
          (holiday: { name: string; date: string }) => {
            const holidayDate = new Date(holiday.date);
            holidayDate.setFullYear(2024); // Adjust to 2024
            return {
              ...holiday,
              date: holidayDate.toISOString().split("T")[0],
            };
          }
        );

        setHolidays(adjustedHolidays);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };

    fetchHolidays();
    checkTodayHoliday(); // Check if today is a holiday when component mounts
  }, []);

  // useEffect(() => {
  //   const fetchEvents = async () => {
  //     try {
  //       const response = await fetch("http://localhost:8010/api/events");
  //       const data: Event[] = await response.json();

  //       // Extract dates from events
  //       const datesWithEvents = new Set(
  //         data.map((event) => new Date(event.date).toISOString().split("T")[0])
  //       );
  //       setEventDates(datesWithEvents);
  //     } catch (error) {
  //       console.error("Error fetching events:", error);
  //     }
  //   };

  //   fetchEvents();
  // }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:8010/api/events');
        const data: { date: string }[] = await response.json();
  
        const counts = new Map<string, number>();
  
        data.forEach(event => {
          const eventDate = new Date(event.date).toISOString().split('T')[0];
          counts.set(eventDate, (counts.get(eventDate) || 0) + 1);
        });
  
        setEventCounts(counts);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
  
    fetchEvents();
  }, []);
  

  const getHolidayDetails = (day: Date) => {
    return holidays.find((holiday) => isSameDay(day, new Date(holiday.date)));
  };

  const checkTodayHoliday = () => {
    const todayHoliday = getHolidayDetails(new Date());
    if (todayHoliday) {
      setSelectedHoliday(todayHoliday.name);
    } else {
      setSelectedHoliday(null);
    }
  };

  const handleDateClick = (date: Date) => {
    const cloneDate = new Date(date);
    setSelectedDate(cloneDate);
    onDateChange(cloneDate); // Notify parent of the selected date in YYYY-MM-DD format
  };

  // const handleDateClick = (date: Date) => {
  //   const adjustedDate = new Date(date);
  //   adjustedDate.setMinutes(adjustedDate.getMinutes() - adjustedDate.getTimezoneOffset());
  //   setSelectedDate(adjustedDate);
  //   setCurrentDate(adjustedDate);
  //   onDateChange(adjustedDate);
  // };

  const renderHeader = (): JSX.Element => {
    const isPast = currentDate < new Date(); // Check if the current date is in the past

    return (
      <div className="flex justify-between items-center w-full h-[50px]">
        <div className="flex gap-5 justify-center items-center w-auto">
          <button
            className="w-[27px] h-[27px] flex items-center justify-center rounded-l-lg cursor-pointer"
            onClick={prevPeriod}
          >
            <svg
              width="25"
              height="24"
              viewBox="0 0 25 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.5 12.0001V15.5601C20.5 19.9801 17.37 21.7901 13.54 19.5801L10.45 17.8001L7.36 16.0201C3.53 13.8101 3.53 10.1901 7.36 7.9801L10.45 6.20011L13.54 4.4201C17.37 2.2101 20.5 4.0201 20.5 8.4401V12.0001Z"
                stroke="#6B4EFF"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span
            onClick={toggleFullCalendar}
            className="cursor-pointer flex justify-center items-center text-[#6B4EFF] text-[18px] font-semibold"
          >
            {format(currentDate, "MMMM yyyy")}
          </span>
          <button
            className="w-[27px] h-[27px] flex items-center justify-center rounded-r-lg cursor-pointer"
            onClick={nextPeriod}
          >
            <svg
              width="25"
              height="24"
              viewBox="0 0 25 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.5 11.9999V8.43989C4.5 4.01989 7.63 2.2099 11.46 4.4199L14.55 6.1999L17.64 7.9799C21.47 10.1899 21.47 13.8099 17.64 16.0199L14.55 17.7999L11.46 19.5799C7.63 21.7899 4.5 19.9799 4.5 15.5599V11.9999Z"
                stroke="#6B4EFF"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {showTodayButton && (
          <button
            className={`btn1 flex items-center ${isPast ? "before-today" : "after-today"}`}
            onClick={goToToday}
          >
            {isPast ? (
              <>
                <span>Back</span>
                <svg
                  height="16"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  viewBox="0 0 1024 1024"
                  className="ml-2 rotate-180" // Adds space between text and arrow
                >
                  <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path>
                </svg>
              </>
            ) : (
              <>
                <svg
                  height="16"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  viewBox="0 0 1024 1024"
                  className="mr-2" // Adds space between arrow and text
                >
                  <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path>
                </svg>
                <span>Back</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  const renderDays = (): JSX.Element => {
    const days = [];
    const startDate = startOfWeek(new Date());

    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          key={i}
          className="w-[56px] h-[56px] mt-[0.1px] font-medium flex justify-center items-center"
        >
          {format(addDays(startDate, i), "eee")}
        </div>
      );
    }

    return <div className="flex">{days}</div>;
  };

  // const renderCells = (): JSX.Element => {
  //   const monthStart = startOfMonth(currentDate);
  //   const monthEnd = endOfMonth(monthStart);
  //   const startDate = startOfWeek(monthStart);
  //   const endDate = endOfWeek(monthEnd);

  //   const rows = [];
  //   let days = [];
  //   let day = startDate;

  //   while (day <= endDate) {
  //     for (let i = 0; i < 7; i++) {
  //       const cloneDay = new Date(day);
  //       const formattedDate = format(day, "d");

  //       // Check if the day has an event
  //       const hasEvent = eventDates.has(format(cloneDay, "yyyy-MM-dd"));
  //       const holiday = getHolidayDetails(cloneDay);
  //       const holidayClass = holiday ? "text-Bright-Yellow-Orange" : "";

  //       days.push(
  //         <div
  //           key={day.toISOString()}
  //           onClick={() => {
  //             handleDateClick(cloneDay);
  //             if (holiday) {
  //               setSelectedHoliday(holiday.name);
  //             } else {
  //               setSelectedHoliday(null);
  //             }
  //           }}
  //           className={`relative w-[56px] h-[56px] items-center justify-center font-semibold flex flex-col cursor-pointer ${
  //             !isSameMonth(day, monthStart)
  //               ? "text-gray-400"
  //               : isToday(day) && !selectedDate
  //                 ? "bg-[#6B4EFF] text-[18px] font-semibold text-white rounded-full "
  //                 : selectedDate && isSameDay(day, selectedDate)
  //                   ? "bg-[#6B4EFF] text-[18px] font-semibold text-white rounded-full"
  //                   : isToday(day)
  //                     ? "text-[#6B4EFF]"
  //                     : holidayClass
  //           }`}
  //         >
  //           <span>{formattedDate}</span>
  //           {hasEvent && (
  //             <div
  //               className={`absolute top-10 w-[6px] h-[6px] rounded-full ${
  //                 selectedDate && isSameDay(cloneDay, selectedDate)
  //                   ? "bg-white"
  //                   : isToday(cloneDay) && !selectedDate
  //                     ? "bg-white"
  //                     : "bg-[#6B4EFF]"
  //               }`}
  //             >
  //               {" "}
  //             </div>
  //           )}
  //         </div>
  //       );
  //       day = addDays(day, 1);
  //     }
  //     rows.push(
  //       <div className="flex" key={day.toISOString()}>
  //         {days}
  //       </div>
  //     );
  //     days = [];
  //   }
  //   return <div>{rows}</div>;
  // };

  const renderCells = (): JSX.Element => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
  
    const rows = [];
    let days = [];
    let day = startDate;
  
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const formattedDate = format(cloneDay, 'yyyy-MM-dd');
  
        // Get the number of events for this day
        const eventCount = eventCounts.get(formattedDate) || 0;
        const holiday = getHolidayDetails(cloneDay);
        const holidayClass = holiday ? 'text-Bright-Yellow-Orange' : '';
  
        days.push(
          <div
            key={day.toISOString()}
            onClick={() => {
              handleDateClick(cloneDay);
              if (holiday) {
                setSelectedHoliday(holiday.name);
              } else {
                setSelectedHoliday(null);
              }
            }}
            className={`relative w-[56px] h-[56px] items-center justify-center font-semibold flex flex-col cursor-pointer ${
              !isSameMonth(day, monthStart)
                ? 'text-gray-400'
                : isToday(day) && !selectedDate
                ? 'bg-[#6B4EFF] text-[18px] font-semibold text-white rounded-full '
                : selectedDate && isSameDay(day, selectedDate)
                ? 'bg-[#6B4EFF] text-[18px] font-semibold text-white rounded-full'
                : isToday(day)
                ? 'text-[#6B4EFF]'
                : holidayClass
            }`}
          >
            <span>{format(day, 'd')}</span>
            {eventCount > 0 && (
              <div className="absolute top-10 flex space-x-1">
                {Array.from({ length: Math.min(eventCount, 3) }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-[6px] h-[6px] rounded-full ${
                      selectedDate && isSameDay(cloneDay, selectedDate)
                        ? 'bg-white'
                        : isToday(cloneDay) && !selectedDate
                        ? 'bg-white'
                        : 'bg-[#6B4EFF]'
                    }`}
                  ></div>
                ))}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex" key={day.toISOString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };
  

  // const renderCurrentWeek = (): JSX.Element => {
  //   const startDate = startOfWeek(currentDate);
  //   const days = [];

  //   for (let i = 0; i < 7; i++) {
  //     const day = addDays(startDate, i);
  //     const hasEvent = eventDates.has(format(day, "yyyy-MM-dd"));
  //     const holiday = getHolidayDetails(day);

  //     days.push(
  //       <div
  //         key={day.toString()}
  //         onClick={() => {
  //           handleDateClick(day);
  //           if (holiday) {
  //             setSelectedHoliday(holiday.name);
  //           } else {
  //             setSelectedHoliday(null);
  //           }
  //         }}
  //         className={`relative w-[50px] h-[85px] flex flex-col font-medium mx-[3px] items-center gap-y-1 justify-center cursor-pointer ${
  //           isToday(day) && !selectedDate
  //             ? "bg-[#6B4EFF] text-[18px] font-semibold rounded-[25px]"
  //             : selectedDate && isSameDay(day, selectedDate)
  //               ? "bg-[#6B4EFF] text-[18px] font-semibold rounded-[25px]"
  //               : holiday
  //                 ? "text-Bright-Yellow-Orange"
  //                 : ""
  //         }`}
  //       >
  //         <span
  //           className={`${
  //             isToday(day) && !selectedDate
  //               ? "text-white"
  //               : selectedDate && isSameDay(day, selectedDate)
  //                 ? "text-white"
  //                 : ""
  //           }`}
  //         >
  //           {format(day, "eee")}
  //         </span>
  //         <span
  //           className={`mt-1 ${
  //             isToday(day) && !selectedDate
  //               ? "bg-white w-[40px] h-[40px] text-[#6B4EFF] rounded-[50%] flex items-center justify-center"
  //               : selectedDate && isSameDay(day, selectedDate)
  //                 ? "bg-white w-[40px] h-[40px] text-[#6B4EFF] rounded-[50%] flex items-center justify-center"
  //                 : isToday(day)
  //                   ? "text-[#6B4EFF]"
  //                   : holiday
  //                     ? "text-Bright-Yellow-Orange"
  //                     : ""
  //           }`}
  //         >
  //           {format(day, "d")}
  //         </span>
  //         {hasEvent && (
  //           <div className="absolute top-[70px] w-[6px] h-[6px] bg-[#6B4EFF] rounded-full"></div>
  //         )}
  //       </div>
  //     );
  //   }

  //   return <div className="flex justify-between">{days}</div>;
  // };

  const renderCurrentWeek = (): JSX.Element => {
    const startDate = startOfWeek(currentDate);
    const days = [];
  
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      const formattedDate = format(day, 'yyyy-MM-dd');
  
      // Get the number of events for this day
      const eventCount = eventCounts.get(formattedDate) || 0;
      const holiday = getHolidayDetails(day);
  
      days.push(
        <div
          key={day.toString()}
          onClick={() => {
            handleDateClick(day);
            if (holiday) {
              setSelectedHoliday(holiday.name);
            } else {
              setSelectedHoliday(null);
            }
          }}
          className={`relative w-[50px] h-[85px] flex flex-col font-medium mx-[3px] items-center gap-y-1 justify-center cursor-pointer ${
            isToday(day) && !selectedDate
              ? 'bg-[#6B4EFF] text-[18px] font-semibold rounded-[25px]'
              : selectedDate && isSameDay(day, selectedDate)
              ? 'bg-[#6B4EFF] text-[18px] font-semibold rounded-[25px]'
              : holiday
              ? 'text-Bright-Yellow-Orange'
              : ''
          }`}
        >
          <span
            className={`${
              isToday(day) && !selectedDate
                ? 'text-white'
                : selectedDate && isSameDay(day, selectedDate)
                ? 'text-white'
                : ''
            }`}
          >
            {format(day, 'eee')}
          </span>
          <span
            className={`mt-1 ${
              isToday(day) && !selectedDate
                ? 'bg-white w-[40px] h-[40px] text-[#6B4EFF] rounded-[50%] flex items-center justify-center'
                : selectedDate && isSameDay(day, selectedDate)
                ? 'bg-white w-[40px] h-[40px] text-[#6B4EFF] rounded-[50%] flex items-center justify-center'
                : isToday(day)
                ? 'text-[#6B4EFF]'
                : holiday
                ? 'text-Bright-Yellow-Orange'
                : ''
            }`}
          >
            {format(day, 'd')}
          </span>
          {eventCount > 0 && (
            <div className="absolute top-[70px] flex space-x-1">
              {Array.from({ length: Math.min(eventCount, 3) }).map((_, index) => (
                <div
                  key={index}
                  className={`w-[6px] h-[6px] rounded-full ${
                    selectedDate && isSameDay(day, selectedDate)
                      ? 'bg-[#6B4EFF]'
                      : isToday(day) && !selectedDate
                      ? 'bg-[#6B4EFF]'
                      : 'bg-[#6B4EFF]'
                  }`}
                ></div>
              ))}
            </div>
          )}
        </div>
      );
    }
  
    return <div className="flex justify-between">{days}</div>;
  };
  

  // const renderCells = (): JSX.Element => {
  //   const monthStart = startOfMonth(currentDate);
  //   const monthEnd = endOfMonth(monthStart);
  //   const startDate = startOfWeek(monthStart);
  //   const endDate = endOfWeek(monthEnd);

  //   const rows = [];
  //   let days = [];
  //   let day = startDate;
  //   // let formattedDate = '';

  //   while (day <= endDate) {
  //     for (let i = 0; i < 7; i++) {
  //       // formattedDate = format(day, 'd');
  //       // const cloneDay = day;
  //       const cloneDay = new Date(day);
  //       const formattedDate = format(day, 'd')

  //       const holiday = getHolidayDetails(cloneDay);
  //       const holidayClass = holiday ? 'text-Bright-Yellow-Orange' : ''; // Highlight holidays

  //       days.push(
  //         // Calendar while being shown full
  //         <div
  //           key={day.toISOString()}
  //             onClick={() => {
  //               // handleDateClick(new Date(day));  // Handle date selection
  //               handleDateClick(cloneDay);  // Handle date selection
  //               if (holiday) {
  //                   setSelectedHoliday(holiday.name);  // Handle holiday selection
  //               } else {
  //                   setSelectedHoliday(null);  // Clear holiday if none
  //               }
  //           }}
  //           className={`w-[56px] h-[56px] items-center justify-center font-semibold flex flex-col cursor-pointer ${
  //             !isSameMonth(day, monthStart)
  //               ? 'text-gray-400 '
  //               : isToday(day) && !selectedDate
  //               ? 'bg-[#6B4EFF] text-[18px] font-semibold text-white rounded-full '
  //               : selectedDate && isSameDay(day, selectedDate)
  //               ? 'bg-[#6B4EFF] text-[18px] font-semibold text-white rounded-full'
  //               : isToday(day)
  //               ? 'text-[#6B4EFF]'
  //               : holidayClass // Apply holiday styles here
  //           }`}
  //         >
  //           <span>{formattedDate}</span>
  //         </div>
  //       );
  //       day = addDays(day, 1);
  //     }
  //     rows.push(
  //       <div className="flex" key={day.toISOString()}>
  //         {days}
  //       </div>
  //     );
  //     days = [];
  //   }
  //   return <div>{rows}</div>;
  // };

  // const renderCurrentWeek = (): JSX.Element => {
  //   const startDate = startOfWeek(currentDate);
  //   const days = [];

  //   for (let i = 0; i < 7; i++) {
  //     const day = addDays(startDate, i);
  //     const holiday = getHolidayDetails(day);

  //     // const adjustedDay = new Date(day);
  //     // adjustedDay.setMinutes(adjustedDay.getMinutes() - adjustedDay.getTimezoneOffset());

  //     days.push(
  //       // Calendar while being shown current week (Small)
  //       <div
  //         key={day.toString()}
  //         // key={adjustedDay.toISOString()}
  //         onClick={() => {
  //             handleDateClick(day);  // Handle date selection
  //             if (holiday) {
  //                 setSelectedHoliday(holiday.name);  // Handle holiday selection
  //             } else {
  //                 setSelectedHoliday(null);  // Clear holiday if none
  //             }
  //         }}
  //         className={`w-[50px] h-[85px] flex flex-col font-medium mx-[3px] items-center gap-y-1 justify-center cursor-pointer ${
  //           isToday(day) && !selectedDate
  //             ? 'bg-[#6B4EFF] text-[18px] font-semibold rounded-[25px]'
  //             : selectedDate && isSameDay(day, selectedDate)
  //             ? 'bg-[#6B4EFF] text-[18px] font-semibold rounded-[25px]'
  //             : holiday ? 'text-Bright-Yellow-Orange'
  //             : '' // Highlight holidays
  //         }`}
  //       >
  //         <span
  //           className={`${
  //             isToday(day) && !selectedDate
  //               ? 'text-white'
  //               : selectedDate && isSameDay(day, selectedDate)
  //               ? 'text-white'
  //               : ''
  //           }`}
  //         >
  //           {format(day, 'eee')}
  //         </span>
  //         <span
  //           className={`${
  //             isToday(day) && !selectedDate
  //               ? 'bg-white w-[35px] h-[35px] text-[#6B4EFF] rounded-[50%] flex items-center justify-center'
  //               : selectedDate && isSameDay(day, selectedDate)
  //               ? 'bg-white w-[35px] h-[35px] text-[#6B4EFF] rounded-[50%] flex items-center justify-center'
  //               : isToday(day)
  //               ? 'text-[#6B4EFF]'
  //               : holiday
  //               ? 'text-Bright-Yellow-Orange' // Highlight holiday number in red
  //               : ''
  //           }`}
  //         >
  //           {format(day, 'd')}
  //         </span>
  //       </div>
  //     );
  //   }

  //   return <div className="flex justify-between">{days}</div>;
  // };

  return (
    <div className="w-full flex flex-col justify-center items-center  rounded-[28px]">
      {renderHeader()}
      {showFullCalendar ? (
        <>
          {renderDays()}
          {renderCells()}
        </>
      ) : (
        renderCurrentWeek()
      )}

      {/* Display the holiday details in ProfileButton */}
      {selectedHoliday && <ProfileButton text={selectedHoliday} />}
    </div>
  );
};

export default Calendar;

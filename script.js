document.addEventListener('DOMContentLoaded', () => {
    const currentDayDateEl = document.getElementById('current-day-date');
    const currentPeriodNameEl = document.getElementById('current-period-name');
    const countdownTimerEl = document.getElementById('countdown-timer');
    const nextPeriodInfoEl = document.getElementById('next-period-info');

    // Define school terms (Year, Month-1, Day) - Using 2025 as an example as per previous context
    const terms = [
        { name: "Term 3", start: new Date(2025, 6, 22), end: new Date(2025, 8, 24) }, // July 22 to September 24
        { name: "Term 4", start: new Date(2025, 9, 13), end: new Date(2025, 11, 3) }  // October 13 to December 3
    ];

    // Define school schedule
    // Format: [Period Name, Start Hour, Start Minute, End Hour, End Minute]
    // Note: All times are in 24-hour format.
    // Movement times removed, and preceding period extended.
    const mondayToThursdaySchedule = [
        ["Period 1", 8, 39, 9, 22],   // Was 9:19, now 9:22 (incl. 3 min movement)
        ["Period 2", 9, 22, 10, 5],   // Was 10:02, now 10:05 (incl. 3 min movement)
        ["Period 3", 10, 5, 10, 48],  // Was 10:45, now 10:48 (incl. 3 min movement)
        ["Recess", 10, 48, 11, 8],
        ["Period 4", 11, 8, 11, 51],  // Was 11:49, now 11:51 (incl. 2 min movement)
        ["Period 5", 11, 51, 12, 33], // Was 12:30, now 12:33 (incl. 3 min movement)
        ["Registration", 12, 33, 12, 44],
        ["Lunch", 12, 44, 13, 34],
        ["Period 6", 13, 34, 14, 17], // Was 14:14, now 14:17 (incl. 3 min movement)
        ["Period 7", 14, 17, 15, 0],
        // Special "After School" period from end of last period until next day's 6:00 AM
        ["After School", 15, 0, 24, 0] // Covers rest of the day until midnight
    ];

    const fridaySchedule = [
        ["Period 1", 8, 39, 9, 17],   // Was 9:14, now 9:17 (incl. 3 min movement)
        ["Period 2", 9, 17, 9, 55],   // Was 9:52, now 9:55 (incl. 3 min movement)
        ["Period 3", 9, 55, 10, 33],  // Was 10:30, now 10:33 (incl. 3 min movement)
        ["Recess", 10, 33, 10, 53],
        ["Assembly", 10, 56, 11, 31], // Assembly time remains fixed, the "movement to Assembly" (10:53-10:56) is absorbed by Recess, ensuring Assembly starts on time.
        ["Period 4", 11, 31, 12, 6],
        ["Period 5", 12, 6, 12, 43],
        ["Registration", 12, 43, 12, 54],
        ["Lunch", 12, 54, 13, 44],
        ["Period 6", 13, 44, 14, 22],
        ["Period 7", 14, 22, 15, 0],
        ["After School", 15, 0, 24, 0]
    ];

    // Define the reference date for the A-F cycle
    // Wednesday, July 30th, 2025 is E Day. Month is 0-indexed (July is 6).
    const cycleStartReferenceDate = new Date(2025, 6, 30); // July 30, 2025 (Wednesday)
    const cycleStartReferenceLetter = 'E'; // Corresponding letter for the reference date
    const cycleLetters = ['A', 'B', 'C', 'D', 'E', 'F']; // The 6-day cycle

    function getLetterDay(currentDate) {
        // Ensure currentDate is a Date object and reset time for accurate day comparison
        const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const referenceDay = new Date(cycleStartReferenceDate.getFullYear(), cycleStartReferenceDate.getMonth(), cycleStartReferenceDate.getDate());

        // Check if it's a weekend (Saturday=6, Sunday=0) or outside school term
        const dayOfWeek = today.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return "Weekend";
        }

        let isInTerm = false;
        for (const term of terms) {
            const termEndDate = new Date(term.end);
            termEndDate.setHours(23, 59, 59, 999); // Include the whole end day

            if (today >= term.start && today <= termEndDate) {
                isInTerm = true;
                break;
            }
        }

        if (!isInTerm) {
            return "School Holidays";
        }

        // Calculate the difference in days, only counting weekdays (Monday-Friday)
        let totalSchoolDaysDiff = 0;
        let tempDate = new Date(referenceDay);

        // Loop from reference date to today (or vice-versa)
        if (today >= referenceDay) {
            while (tempDate < today) {
                tempDate.setDate(tempDate.getDate() + 1); // Move to the next day
                const d = tempDate.getDay();
                if (d >= 1 && d <= 5) { // If it's a weekday (Mon-Fri)
                    totalSchoolDaysDiff++;
                }
            }
        } else { // If today is before the reference date (unlikely but good for robustness)
             while (tempDate > today) {
                tempDate.setDate(tempDate.getDate() - 1); // Move to the previous day
                const d = tempDate.getDay();
                if (d >= 1 && d <= 5) { // If it's a weekday (Mon-Fri)
                    totalSchoolDaysDiff--;
                }
            }
        }

        // Find the index of the reference letter
        const refIndex = cycleLetters.indexOf(cycleStartReferenceLetter);
        if (refIndex === -1) {
            console.error("Cycle start reference letter not found in cycleLetters array.");
            return "Error";
        }

        // Calculate the current letter day index
        // Use modulo to wrap around the cycle (e.g., if F is last, next is A)
        // Add cycleLetters.length to handle negative totalSchoolDaysDiff correctly
        const currentIndex = (refIndex + totalSchoolDaysDiff % cycleLetters.length + cycleLetters.length) % cycleLetters.length;

        return cycleLetters[currentIndex];
    }


    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (num) => num.toString().padStart(2, '0');

        if (hours > 0) {
            return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        } else {
            return `${pad(minutes)}:${pad(seconds)}`;
        }
    }

    function updateCountdown() {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentSecond = now.getSeconds();
        const currentMs = (currentHour * 3600 + currentMinute * 60 + currentSecond) * 1000 + now.getMilliseconds();

        // Update day, date, and letter day display
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const letterDay = getLetterDay(now); // Get the letter day
        currentDayDateEl.textContent = `${now.toLocaleDateString(undefined, options)} (${letterDay} Day)`;

        let currentSchedule = [];
        let isSchoolDay = false;
        let isInTerm = false;

        // Check if current date is within a school term
        for (const term of terms) {
            // Adjust end date to include the whole day (until midnight)
            const termEndDate = new Date(term.end);
            termEndDate.setHours(23, 59, 59, 999);

            if (now >= term.start && now <= termEndDate) {
                isInTerm = true;
                break;
            }
        }

        if (isInTerm && dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday during a term
            isSchoolDay = true;
            if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday to Thursday
                currentSchedule = mondayToThursdaySchedule;
            } else { // Friday
                currentSchedule = fridaySchedule;
            }
        }

        if (!isSchoolDay) {
            currentPeriodNameEl.textContent = "Weekend";
            countdownTimerEl.textContent = "Enjoy!";
            nextPeriodInfoEl.textContent = "See you next school week!";
            if (!isInTerm) {
                currentPeriodNameEl.textContent = "School Holidays";
                countdownTimerEl.textContent = "Break Time!";
                nextPeriodInfoEl.textContent = "School resumes next term.";
            }
            // Ensure the letter day also reflects "Weekend" or "School Holidays"
            currentDayDateEl.textContent = `${now.toLocaleDateString(undefined, options)} (${letterDay})`;
            return; // Exit if it's not a school day/term
        }


        let foundPeriod = false;
        let currentPeriod = null;
        let nextPeriod = null;

        // Find current period or the next period to count down to
        for (let i = 0; i < currentSchedule.length; i++) {
            const [name, startH, startM, endH, endM] = currentSchedule[i];
            const periodStartMs = (startH * 3600 + startM * 60) * 1000;
            const periodEndMs = (endH * 3600 + endM * 60) * 1000;

            if (currentMs >= periodStartMs && currentMs < periodEndMs) {
                currentPeriod = { name, startMs: periodStartMs, endMs: periodEndMs };
                // Determine the next period
                if (i + 1 < currentSchedule.length) {
                     nextPeriod = {
                        name: currentSchedule[i + 1][0],
                        startMs: (currentSchedule[i + 1][1] * 3600 + currentSchedule[i + 1][2] * 60) * 1000
                    };
                } else {
                    nextPeriod = null; // Last period of the day
                }
                foundPeriod = true;
                break;
            } else if (currentMs < periodStartMs) {
                // If we haven't found a current period yet, this must be the next one
                nextPeriod = { name, startMs: periodStartMs };
                break;
            }
        }

        // Special handling for before 6 AM: Countdown to Period 1
        if (!foundPeriod && currentHour < 6) {
            const [p1Name, p1StartH, p1StartM] = currentSchedule[0];
            let p1StartToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), p1StartH, p1StartM, 0);
            let timeUntilP1 = p1StartToday.getTime() - now.getTime();

            currentPeriodNameEl.textContent = "Before School";
            countdownTimerEl.textContent = formatTime(timeUntilP1);
            nextPeriodInfoEl.textContent = `Until ${p1Name}`;
            return;
        }


        if (currentPeriod) {
            currentPeriodNameEl.textContent = currentPeriod.name;
            const timeLeft = currentPeriod.endMs - currentMs;
            countdownTimerEl.textContent = formatTime(timeLeft);
            if (nextPeriod && currentPeriod.name !== "After School") {
                nextPeriodInfoEl.textContent = `Next: ${nextPeriod.name}`;
            } else if (currentPeriod.name === "After School") {
                nextPeriodInfoEl.textContent = `School's out!`;
            }
        } else {
            // This case handles the gap between the last period of the day and "After School"
            // Or if no period is found but it's during school hours before P1
            currentPeriodNameEl.textContent = "Waiting...";
            if (nextPeriod) {
                const timeLeft = nextPeriod.startMs - currentMs;
                countdownTimerEl.textContent = formatTime(timeLeft);
                nextPeriodInfoEl.textContent = `Until ${nextPeriod.name}`;
            } else {
                currentPeriodNameEl.textContent = "After School";
                countdownTimerEl.textContent = "Done!";
                nextPeriodInfoEl.textContent = "Enjoy your evening!";
            }
        }
    }

    // Update every second
    setInterval(updateCountdown, 1000);
    // Run once immediately on load
    updateCountdown();
});

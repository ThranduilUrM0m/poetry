export const fillMissingDates = (
    data: { date: string; views: number }[],
    days: number = 7
): { date: string; views: number }[] => {
    const result: { date: string; views: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        const existing = data.find((d) => d.date === dateString);
        result.push(existing || { date: dateString, views: 0 });
    }

    return result;
};

export const getDateRange = (days: number): string[] => {
    const dates: string[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
};

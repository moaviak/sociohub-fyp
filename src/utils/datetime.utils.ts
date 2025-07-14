export class DateTimeUtils {
  static parseEventDateTime(
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string
  ) {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHours, startMinutes);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endHours, endMinutes);

    return { startDateTime, endDateTime };
  }

  static isWithinScanWindow(
    eventStart: Date,
    eventEnd: Date,
    scanTime: Date = new Date()
  ): boolean {
    const scanStart = new Date(eventStart.getTime() - 60 * 60 * 1000); // 1 hour before
    return scanTime >= scanStart && scanTime <= eventEnd;
  }
}

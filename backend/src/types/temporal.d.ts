declare global {
    namespace Temporal {
        interface PlainTime {
            hour: number;
            minute: number;
            second: number;
            millisecond: number;
            microsecond: number;
            nanosecond: number;
            toString(): string;
        }

        interface PlainDate {
            year: number;
            month: number;
            day: number;
            toString(): string;
        }

        const PlainTime: {
            new (
                hour?: number,
                minute?: number,
                second?: number,
                millisecond?: number,
                microsecond?: number,
                nanosecond?: number,
            ): PlainTime;
            from(
                item:
                    | string
                    | PlainTime
                    | {
                          hour?: number;
                          minute?: number;
                          second?: number;
                          millisecond?: number;
                          microsecond?: number;
                          nanosecond?: number;
                      },
            ): PlainTime;
        };

        const PlainDate: {
            new (year?: number, month?: number, day?: number): PlainDate;
            from(
                item:
                    | string
                    | PlainDate
                    | { year?: number; month?: number; day?: number },
            ): PlainDate;
        };
    }
}

export {};

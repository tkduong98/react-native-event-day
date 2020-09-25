import * as React from 'react';
import { DayJSConvertedEvent, Event, EventCellStyle } from './interfaces';
interface CalendarBodyProps<T> {
    event: DayJSConvertedEvent;
    onPressEvent?: (event: Event<T>) => void;
    eventCellStyle?: EventCellStyle<T>;
    showTime: boolean;
    eventCount?: number;
    eventOrder?: number;
}
export declare const CalendarEvent: React.MemoExoticComponent<({ event, onPressEvent, eventCellStyle, showTime, eventCount, eventOrder, }: CalendarBodyProps<any>) => JSX.Element>;
export {};

import dayjs from 'dayjs';
import * as React from 'react';
import { ViewStyle } from 'react-native';
import { Event } from './interfaces';
interface CalendarHeaderProps<T> {
    dateRange: dayjs.Dayjs[];
    cellHeight: number;
    style: ViewStyle;
    allDayEvents: Event<T>[];
    onPressDateHeader?: (date: Date) => void;
    onPressEventHeder? : (event: Event<T>) => void;
}
export declare const CalendarHeader: React.MemoExoticComponent<({ dateRange, cellHeight, style, allDayEvents, onPressDateHeader, onPressEventHeder }: CalendarHeaderProps<any>) => JSX.Element>;
export {};

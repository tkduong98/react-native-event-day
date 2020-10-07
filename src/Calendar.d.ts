import * as React from 'react';
import { ViewStyle } from 'react-native';
import { DateRangeHandler, Event, EventCellStyle, Mode, WeekNum } from './interfaces';
interface CalendarProps<T = {}> {
    events: Event<T>[];
    height: number;
    mode?: Mode;
    style?: ViewStyle;
    eventCellStyle?: EventCellStyle<T>;
    scrollOffsetMinutes?: number;
    date?: Date;
    swipeEnabled?: boolean;
    showTime?: boolean;
    refreshing : boolean;
    weekStartsOn?: WeekNum;
    locale?: string;
    onChangeDate?: DateRangeHandler;
    onPressEvent?: (event: Event<T>) => void;
    onPressDateHeader?: (date: Date) => void;
    onPressEventHeder? : (event: Event<T>) => void;
    onPressCell?: (date: Date) => void;
    onRefresh? : () => void;
}
export declare const Calendar: React.MemoExoticComponent<({ events, style, height, mode, locale, eventCellStyle, date, scrollOffsetMinutes, swipeEnabled, weekStartsOn, showTime, refreshing, onPressEvent, onPressDateHeader, onChangeDate, onPressCell, onPressEventHeder, onRefresh }: CalendarProps) => JSX.Element>;
export {};

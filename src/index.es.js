import dayjs from 'dayjs';
import { memo, useMemo, useCallback, createElement, Fragment, useRef, useState, useEffect } from 'react';
import { Platform, StyleSheet, TouchableOpacity, Text, View, PanResponder, ScrollView, TouchableWithoutFeedback } from 'react-native';
import isBetween from 'dayjs/plugin/isBetween';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var Color;
(function (Color) {
    Color["primary"] = "rgb(66, 133, 244)";
    Color["red"] = "#C80B22";
    Color["yellow"] = "#F8E71C";
    Color["green"] = "#4AC001";
    Color["orange"] = "#E26245";
    Color["pink"] = "#5934C7";
})(Color || (Color = {}));

var MIN_HEIGHT = 1200;
var HOUR_GUIDE_WIDTH = 50;
var OVERLAP_OFFSET = Platform.OS === 'web' ? 20 : 8;
var OVERLAP_PADDING = Platform.OS === 'web' ? 3 : 0;
var commonStyles = StyleSheet.create({
    dateCell: {
        borderWidth: 1,
        borderColor: '#eee',
        borderTopWidth: 0,
        borderRightWidth: 0,
    },
    guideText: {
        color: '#888',
        fontSize: 11,
        textAlign: 'center',
    },
    hourGuide: {
        backgroundColor: '#fff',
        zIndex: 1000,
        width: HOUR_GUIDE_WIDTH,
    },
    eventCell: {
        position: 'absolute',
        backgroundColor: Color.primary,
        zIndex: 100,
        start: 3,
        end: 3,
        borderRadius: 3,
        padding: 4,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
        minWidth: '33%',
    },
    eventTitle: {
        color: '#fff',
        fontSize: 12,
    },
});

var DAY_MINUTES = 1440;
function getDatesInWeek(date, weekStartsOn, locale) {
    if (date === void 0) { date = new Date(); }
    if (weekStartsOn === void 0) { weekStartsOn = 0; }
    if (locale === void 0) { locale = 'en'; }
    var subject = dayjs(date);
    var subjectDOW = subject.day();
    var days = Array(7)
        .fill(0)
        .map(function (_, i) {
        return subject.add(i - subjectDOW + weekStartsOn, 'day').locale(locale);
    });
    return days;
}
function getDatesInNextThreeDays(date, locale) {
    if (date === void 0) { date = new Date(); }
    if (locale === void 0) { locale = 'en'; }
    var subject = dayjs(date).locale(locale);
    var days = Array(3)
        .fill(0)
        .map(function (_, i) {
        return subject.add(i, 'day');
    });
    return days;
}
function getDatesInNextOneDay(date, locale) {
    if (date === void 0) { date = new Date(); }
    if (locale === void 0) { locale = 'en'; }
    var subject = dayjs(date).locale(locale);
    var days = Array(1)
        .fill(0)
        .map(function (_, i) {
        return subject.add(i, 'day');
    });
    return days;
}
var hours = Array(24)
    .fill(0)
    .map(function (_, i) { return i; });
function formatHour(hour) {
    return hour + ":00";
}
function isToday(date) {
    var today = dayjs();
    return today.isSame(date, 'day');
}
function getRelativeTopInDay(date) {
    if (date === void 0) { date = dayjs(); }
    return (100 * (date.hour() * 60 + date.minute())) / DAY_MINUTES;
}
function modeToNum(mode) {
    switch (mode) {
        case '3days':
            return 3;
        case 'week':
            return 7;
        default:
            throw new Error('undefined mode');
    }
}
function formatStartEnd(event) {
    return event.start.format('HH:mm') + " - " + event.end.format('HH:mm');
}
function isAllDayEvent(event) {
    return (event.start.hour() === 0 &&
        event.start.minute() === 0 &&
        event.end.hour() === 0 &&
        event.end.minute() === 0);
}
function getCountOfEventsAtEvent(event, eventList) {
    dayjs.extend(isBetween);
    return eventList.filter(function (e) {
        return event.start.isBetween(e.start, e.end, 'minute', '[)') ||
            e.start.isBetween(event.start, event.end, 'minute', '[)');
    }).length;
}
function getOrderOfEvent(event, eventList) {
    dayjs.extend(isBetween);
    var events = eventList
        .filter(function (e) {
        return event.start.isBetween(e.start, e.end, 'minute', '[)') ||
            e.start.isBetween(event.start, event.end, 'minute', '[)');
    })
        .sort(function (a, b) {
        if (a.start.isSame(b.start)) {
            return a.start.diff(a.end) < b.start.diff(b.end) ? -1 : 1;
        }
        else {
            return a.start.isBefore(b.start) ? -1 : 1;
        }
    });
    return events.indexOf(event);
}
function getColorForEventPosition(eventPosition) {
    switch (eventPosition % 5) {
        case 0:
            return Color.primary;
        case 1:
            return Color.orange;
        case 2:
            return Color.green;
        case 3:
            return Color.red;
        case 4:
            return Color.pink;
        default:
            return Color.primary;
    }
}
function getStyleForOverlappingEvent(eventCount, eventPosition) {
    var overlapStyle = {};
    if (eventCount > 1) {
        var normalizedPosition = eventPosition + 1;
        var start = eventPosition * OVERLAP_OFFSET;
        var end = eventCount === normalizedPosition ? 0 : (eventCount - normalizedPosition) * OVERLAP_OFFSET;
        var zIndex = 100 + eventPosition;
        overlapStyle = {
            start: start + OVERLAP_PADDING,
            end: end + OVERLAP_PADDING,
            backgroundColor: getColorForEventPosition(eventPosition),
            zIndex: zIndex,
        };
    }
    return overlapStyle;
}

function getEventCellPositionStyle(_a) {
    var end = _a.end, start = _a.start;
    var relativeHeight = 100 * (1 / DAY_MINUTES) * end.diff(start, 'minute');
    var relativeTop = getRelativeTopInDay(start);
    return {
        height: relativeHeight + "%",
        top: relativeTop + "%",
    };
}
var CalendarEvent = memo(function (_a) {
    var event = _a.event, onPressEvent = _a.onPressEvent, eventCellStyle = _a.eventCellStyle, showTime = _a.showTime, _b = _a.eventCount, eventCount = _b === void 0 ? 1 : _b, _c = _a.eventOrder, eventOrder = _c === void 0 ? 0 : _c;
    var getEventStyle = useMemo(function () { return (typeof eventCellStyle === 'function' ? eventCellStyle : function (_) { return eventCellStyle; }); }, [eventCellStyle]);
    var _onPress = useCallback(function (event) {
        onPressEvent && onPressEvent(event);
    }, [event]);
    return (createElement(TouchableOpacity, { delayPressIn: 20, key: event.start.toString(), style: [
            commonStyles.eventCell,
            getEventCellPositionStyle(event),
            getStyleForOverlappingEvent(eventCount, eventOrder),
            getEventStyle(event),
        ], onPress: function () { return _onPress(event); }, disabled: !onPressEvent }, event.end.diff(event.start, 'minute') < 32 && showTime ? (createElement(Text, { style: commonStyles.eventTitle },
        event.title,
        ",",
        createElement(Text, { style: styles.eventTime }, event.start.format('HH:mm')))) : (createElement(Fragment, null,
        createElement(Text, { style: commonStyles.eventTitle }, event.title),
        showTime && createElement(Text, { style: styles.eventTime }, formatStartEnd(event)),
        event.children && event.children))));
});
var styles = StyleSheet.create({
    eventTime: {
        color: '#fff',
        fontSize: 10,
    },
});

var SWIPE_THRESHOLD = 50;
var HourGuideColumn = memo(function (_a) {
    var cellHeight = _a.cellHeight, hour = _a.hour;
    return (createElement(View, { style: { height: cellHeight } },
        createElement(Text, { style: commonStyles.guideText }, formatHour(hour))));
}, function () { return true; });
function HourCell(_a) {
    var cellHeight = _a.cellHeight, onPress = _a.onPress, date = _a.date, hour = _a.hour;
    return (createElement(TouchableWithoutFeedback, { onPress: function () { return onPress(date.hour(hour).minute(0)); } },
        createElement(View, { style: [commonStyles.dateCell, { height: cellHeight }] })));
}
var CalendarBody = memo(function (_a) {
    var containerHeight = _a.containerHeight, cellHeight = _a.cellHeight, dateRange = _a.dateRange, _b = _a.style, style = _b === void 0 ? {} : _b, onPressCell = _a.onPressCell, dayJsConvertedEvents = _a.dayJsConvertedEvents, onPressEvent = _a.onPressEvent, eventCellStyle = _a.eventCellStyle, showTime = _a.showTime, scrollOffsetMinutes = _a.scrollOffsetMinutes, onSwipeHorizontal = _a.onSwipeHorizontal;
    var scrollView = useRef(null);
    var _c = useState(dayjs()), now = _c[0], setNow = _c[1];
    var _d = useState(false), panHandled = _d[0], setPanHandled = _d[1];
    useEffect(function () {
        if (scrollView.current && scrollOffsetMinutes) {
            setTimeout(function () {
                scrollView.current.scrollTo({
                    y: (cellHeight * scrollOffsetMinutes) / 60,
                    animated: false,
                });
            }, Platform.OS === 'web' ? 0 : 10);
        }
    }, [scrollView.current]);
    useEffect(function () {
        var pid = setInterval(function () { return setNow(dayjs()); }, 2 * 60 * 1000);
        return function () { return clearInterval(pid); };
    }, []);
    var panResponder = useMemo(function () {
        return PanResponder.create({
            onMoveShouldSetPanResponder: function (_, _a) {
                var dx = _a.dx, dy = _a.dy;
                return dx > 2 || dx < -2 || dy > 2 || dy < -2;
            },
            onPanResponderMove: function (_, _a) {
                var dy = _a.dy, dx = _a.dx;
                if (dy < -1 * SWIPE_THRESHOLD || SWIPE_THRESHOLD < dy || panHandled) {
                    return;
                }
                if (dx < -1 * SWIPE_THRESHOLD) {
                    onSwipeHorizontal && onSwipeHorizontal('LEFT');
                    setPanHandled(true);
                    return;
                }
                if (dx > SWIPE_THRESHOLD) {
                    onSwipeHorizontal && onSwipeHorizontal('RIGHT');
                    setPanHandled(true);
                    return;
                }
            },
            onPanResponderEnd: function () {
                setPanHandled(false);
            },
        });
    }, [panHandled, onSwipeHorizontal]);
    var _onPressCell = useCallback(function (date) {
        onPressCell && onPressCell(date.toDate());
    }, [onPressCell]);
    return (createElement(ScrollView, __assign({ style: [
            {
                height: containerHeight - cellHeight * 3,
            },
            style,
        ], ref: scrollView, scrollEventThrottle: 32 }, (Platform.OS !== 'web' ? panResponder.panHandlers : {}), { showsVerticalScrollIndicator: false }),
        createElement(View, __assign({ style: [styles$1.body] }, (Platform.OS === 'web' ? panResponder.panHandlers : {})),
            createElement(View, { style: [commonStyles.hourGuide] }, hours.map(function (hour) { return (createElement(HourGuideColumn, { key: hour, cellHeight: cellHeight, hour: hour })); })),
            dateRange.map(function (date) { return (createElement(View, { style: [{ flex: 1 }], key: date.toString() },
                hours.map(function (hour) { return (createElement(HourCell, { key: hour, cellHeight: cellHeight, date: date, hour: hour, onPress: _onPressCell })); }),
                dayJsConvertedEvents
                    .filter(function (_a) {
                    var start = _a.start, end = _a.end;
                    return start.isAfter(date.startOf('day')) && end.isBefore(date.endOf('day'));
                })
                    .map(function (event) { return (createElement(CalendarEvent, { key: "" + event.start + event.title, event: event, onPressEvent: onPressEvent, eventCellStyle: eventCellStyle, showTime: showTime, eventCount: getCountOfEventsAtEvent(event, dayJsConvertedEvents), eventOrder: getOrderOfEvent(event, dayJsConvertedEvents) })); }),
                isToday(date) && (createElement(View, { style: [styles$1.nowIndicator, { top: getRelativeTopInDay(now) + "%" }] })))); }))));
});
var styles$1 = StyleSheet.create({
    body: {
        flexDirection: 'row',
        flex: 1,
    },
    nowIndicator: {
        position: 'absolute',
        zIndex: 10000,
        backgroundColor: 'red',
        height: 2,
        width: '100%',
    },
});

var CalendarHeader = memo(function (_a) {
    var dateRange = _a.dateRange, cellHeight = _a.cellHeight, _b = _a.style, style = _b === void 0 ? {} : _b, allDayEvents = _a.allDayEvents, onPressDateHeader = _a.onPressDateHeader;
    var _onPress = useCallback(function (date) {
        onPressDateHeader && onPressDateHeader(date);
    }, [onPressDateHeader]);
    return (createElement(View, { style: [styles$2.container, style] },
        createElement(View, { style: [commonStyles.hourGuide, styles$2.hourGuideSpacer] }),
        dateRange.map(function (date) {
            var _isToday = isToday(date);
            return (createElement(TouchableOpacity, { style: { flex: 1, paddingTop: 2 }, onPress: function () { return _onPress(date.toDate()); }, disabled: onPressDateHeader === undefined, key: date.toString() },
                createElement(View, { style: { height: cellHeight, justifyContent: 'space-between' } },
                    createElement(Text, { style: [commonStyles.guideText, _isToday && { color: Color.primary }] }, date.format('ddd')),
                    createElement(View, { style: _isToday && styles$2.todayWrap },
                        createElement(Text, { style: [styles$2.dateText, _isToday && { color: '#fff' }] }, date.format('D')))),
                createElement(View, { style: [commonStyles.dateCell, { height: cellHeight }] }, allDayEvents.map(function (event) {
                    if (!event.start.isSame(date, 'day')) {
                        return null;
                    }
                    return (createElement(View, { style: commonStyles.eventCell },
                        createElement(Text, { style: commonStyles.eventTitle }, event.title)));
                }))));
        })));
});
var styles$2 = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    dateText: {
        color: '#444',
        fontSize: 22,
        textAlign: 'center',
        marginTop: 6,
    },
    todayWrap: {
        backgroundColor: Color.primary,
        width: 36,
        height: 36,
        borderRadius: 50,
        marginTop: 6,
        paddingBottom: 4,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    hourGuideSpacer: {
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
});

var Calendar = memo(function (_a) {
    var events = _a.events, _b = _a.style, style = _b === void 0 ? {} : _b, height = _a.height, _c = _a.mode, mode = _c === void 0 ? 'week' : _c, _d = _a.locale, locale = _d === void 0 ? 'en' : _d, eventCellStyle = _a.eventCellStyle, date = _a.date, _e = _a.scrollOffsetMinutes, scrollOffsetMinutes = _e === void 0 ? 0 : _e, _f = _a.swipeEnabled, swipeEnabled = _f === void 0 ? true : _f, _g = _a.weekStartsOn, weekStartsOn = _g === void 0 ? 0 : _g, _h = _a.showTime, showTime = _h === void 0 ? true : _h, onPressEvent = _a.onPressEvent, onPressDateHeader = _a.onPressDateHeader, onChangeDate = _a.onChangeDate, onPressCell = _a.onPressCell;
    var _j = useState(dayjs(date)), targetDate = _j[0], setTargetDate = _j[1];
    useEffect(function () {
        if (date) {
            setTargetDate(dayjs(date));
        }
    }, [date]);
    var dayJsConvertedEvents = useMemo(function () { return events.map(function (e) { return (__assign(__assign({}, e), { start: dayjs(e.start), end: dayjs(e.end) })); }); }, [events]);
    var allDayEvents = useMemo(function () { return dayJsConvertedEvents.filter(isAllDayEvent); }, [
        dayJsConvertedEvents,
    ]);
    var daytimeEvents = useMemo(function () { return dayJsConvertedEvents.filter(function (x) { return !isAllDayEvent(x); }); }, [dayJsConvertedEvents]);
    var dateRange = useMemo(function () {
        switch (mode) {
            case '3days':
                return getDatesInNextThreeDays(targetDate, locale);
            case 'week':
                return getDatesInWeek(targetDate, weekStartsOn, locale);
            case 'day':
                return getDatesInNextOneDay(targetDate, locale);
            default:
                throw new Error('undefined mode');
        }
    }, [mode, targetDate]);
    useEffect(function () {
        if (onChangeDate) {
            onChangeDate([dateRange[0].toDate(), dateRange.slice(-1)[0].toDate()]);
        }
    }, [dateRange, onChangeDate]);
    var cellHeight = useMemo(function () { return Math.max(height - 30, MIN_HEIGHT) / 24; }, [height]);
    var onSwipeHorizontal = useCallback(function (direction) {
        if (!swipeEnabled) {
            return;
        }
        if (direction === 'LEFT') {
            setTargetDate(targetDate.add(modeToNum(mode), 'day'));
        }
        else {
            setTargetDate(targetDate.add(modeToNum(mode) * -1, 'day'));
        }
    }, [swipeEnabled, targetDate]);
    var commonProps = {
        cellHeight: cellHeight,
        dateRange: dateRange,
        style: style,
    };
    return (createElement(Fragment, null,
        createElement(CalendarHeader, __assign({}, commonProps, { allDayEvents: allDayEvents, onPressDateHeader: onPressDateHeader })),
        createElement(CalendarBody, __assign({}, commonProps, { dayJsConvertedEvents: daytimeEvents, containerHeight: height, onPressEvent: onPressEvent, onPressCell: onPressCell, eventCellStyle: eventCellStyle, scrollOffsetMinutes: scrollOffsetMinutes, showTime: showTime, onSwipeHorizontal: onSwipeHorizontal }))));
});

export { Calendar };
//# sourceMappingURL=index.es.js.map

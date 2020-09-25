import { Color } from './theme';
export declare const MIN_HEIGHT = 1200;
export declare const HOUR_GUIDE_WIDTH = 50;
export declare const OVERLAP_OFFSET: number;
export declare const OVERLAP_PADDING: number;
export declare const commonStyles: {
    dateCell: {
        borderWidth: number;
        borderColor: string;
        borderTopWidth: number;
        borderRightWidth: number;
    };
    guideText: {
        color: string;
        fontSize: number;
        textAlign: "center";
    };
    hourGuide: {
        backgroundColor: string;
        zIndex: number;
        width: number;
    };
    eventCell: {
        position: "absolute";
        backgroundColor: Color;
        zIndex: number;
        start: number;
        end: number;
        borderRadius: number;
        padding: number;
        overflow: "hidden";
        shadowColor: string;
        shadowOffset: {
            width: number;
            height: number;
        };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
        minWidth: string;
    };
    eventTitle: {
        color: string;
        fontSize: number;
    };
};

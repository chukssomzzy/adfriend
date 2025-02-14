#!/usr/bin/env node 


export function customSortDays(arr: Array<string>): Array<string> {
    const order = ["M", "T", "W", "TH", "FR", "SA", "SU"];
    const orderMap = new Map(order.map((day, index) => [day, index]));
    
    return arr.sort((a, b) => (orderMap.get(a) ?? -1) - (orderMap.get(b) ?? -1));
}

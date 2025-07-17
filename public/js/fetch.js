// 获取当前页面的根URL
const baseUrl = window.location.origin;

export async function fetchHeatmapData() {
    const data = await fetch(baseUrl + '/api/database/data')
        .then(resp => resp.json())
        .then(data => Object.entries(data).map(([date, cnt]) => ({ date, cnt })));
        // { date1: cnt1, date2: cnt2, ...} -> [ { date1, cnt1 }, { date2, cnt2 }, ...]
    return data;
}

export async function fetchLastEditedTime() {
    const data = await fetch(baseUrl + '/api/database/last_edited_time')
        .then(resp => resp.json());
    return data;
}
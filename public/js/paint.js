import { calculateMonthsToShow } from './resize.js';

export let cal;  // 可全局共享，存储 cal-heatmap 实例
// 自适应页面宽度时，每次重新绘制都会销毁旧实例，返回新实例

export function paintHeatmap(mapData) {
    // 如果已经存在实例，先销毁它 
    if (cal) cal.destroy();

    // 创建新实例
    cal = new CalHeatmap();

    // 计算应该显示的月份数
    const monthsToShow = calculateMonthsToShow();

    // 绘制
    cal.paint({
        data: {
            source: mapData,
            type: 'json',
            x: 'date',
            y: 'cnt',
            groupY: 'sum',
        },
        date: {
            start: new Date(new Date().getFullYear(), new Date().getMonth() - (monthsToShow - 2)),
            min: new Date("2021-01-01"),
        },
        range: monthsToShow,  // 设置显示的月份数量
        scale: {
            color: {
                scheme: 'Greens',
                type: 'linear',
                domain: [0, 5],
            },
        },
        domain: {
            type: "month",
            gutter: 4,
            label: { text: "YY/MM", position: "top", textAlign: "start" },
        },
        subDomain: { type: "day", radius: 2, width: 11, height: 11, gutter: 4 },
    }, [
        [
            Tooltip,
            {
                text: function (date, value, dayjsDate) {
                    return (
                        (value ? value : '0') +
                        ' updates on ' +
                        dayjsDate.format('dddd, MMMM D, YYYY')
                    );
                },
            },
        ],
        [
            CalendarLabel,
            {
                width: 30,
                textAlign: 'start',
                text: () => dayjs.weekdaysShort().map((d, i) => (i % 2 == 0 ? '' : d)),
                padding: [25, 0, 0, 0],
            },
        ],
    ]);

    // 返回新实例
    return cal;
}
import ExcelJs from "exceljs";

export const enum Tables  {
    TODO="TODO",
    BLOG="BLOG",
}

export const exportToExcel = (data:any) => {
    const sheetName = "Allen_test.xlsx";
    const headerName = "RequestsList";

    // 获取sheet对象，设置当前sheet的样式
    // showGridLines: false 表示不显示表格边框
    const workbook = new ExcelJs.Workbook();
    const sheet = workbook.addWorksheet(sheetName, {
        views: [{ showGridLines: true }]
    });
    // 获取每一列的header
    const columnArr = [];
    for (const i in data[0]) {
        const tempObj = { name: "" };
        tempObj.name = i;
        columnArr.push(tempObj);
    }

    // 设置表格的主要数据部分
    sheet.addTable({
        name: headerName,
        ref: "A1", // 主要数据从A5单元格开始
        headerRow: true,
        totalsRow: false,
        columns: columnArr ? columnArr : [{ name: "" }],
        rows: data.map((e:any) => {
            const arr = [];
            for (const i in e) {
                arr.push(e[i]);
            }
            return arr;
        })
    });

    const table = sheet.getTable(headerName);
    table.commit();

    const writeFile = (fileName: string, content: string | ExcelJs.Buffer | ArrayBufferView | Blob) => {
        const link = document.createElement("a");
        const blob = new Blob([content], {
            type: "application/vnd.ms-excel;charset=utf-8;"
        });
        link.download = fileName;
        link.href = URL.createObjectURL(blob);
        link.click();
    };

    // 表格的数据绘制完成，定义下载方法，将数据导出到Excel文件
    workbook.xlsx.writeBuffer().then((buffer) => {
        writeFile(sheetName, buffer);
    });
};
"use client";

import { useState } from "react";
import {
  useGenerateReportMutation,
  useExportReportMutation,
} from "@/store/api/reportsApi";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SiteData {
  siteId: number;
  siteName: string;
  categories: Record<
    string,
    {
      categoryId: number;
      categoryName: string;
      total: number;
      deployed: number;
      onHand: number;
    }
  >;
}

export default function ReportsPage() {
  const [generateReport, { isLoading, isError, error }] =
    useGenerateReportMutation();
  const [exportReport, { isLoading: isExporting }] = useExportReportMutation();
  const [reportData, setReportData] = useState<any>(null);
  const [reportId, setReportId] = useState<number | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [letterDetails, setLetterDetails] = useState({
    to: "",
    from: "IT Service Operations",
    subject: "",
  });

  const handleGenerateReport = async () => {
    try {
      const result = await generateReport({
        reportType: "SUMMARY" as any,
        saveToHistory: true,
      }).unwrap();
      setReportData(result);
      if (result.reportId) {
        setReportId(result.reportId);
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    }
  };

  const handleExportCsv = async () => {
    if (!reportId) return;
    try {
      const result = await exportReport({
        reportId,
        format: "CSV" as any,
      }).unwrap();

      if (result.content) {
        const blob = new Blob([result.content], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename || "report.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Failed to export report:", err);
    }
  };

  const handleExportPdf = () => {
    setShowPdfModal(true);
  };

  const handleConfirmPdfExport = () => {
    setShowPdfModal(false);
    generatePdf();
  };

  const generatePdf = async () => {
    if (!reportData || !reportData.data) return;

    // Load jsPDF and autotable from CDN
    if (!(window as any).jspdf) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => {
        const script2 = document.createElement("script");
        script2.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js";
        script2.onload = () => generatePdfContent();
        script2.onerror = () => {
          alert("Failed to load PDF table plugin. Please try again.");
        };
        document.head.appendChild(script2);
      };
      script.onerror = () => {
        alert("Failed to load PDF generation library. Please try again.");
      };
      document.head.appendChild(script);
    } else {
      generatePdfContent();
    }
  };

  const generatePdfContent = async () => {
    if (!reportData || !reportData.data) return;

    try {
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF("p", "mm", "a4");

      const sortedSites = Object.values(reportData.data).sort(
        (a: any, b: any) => a.siteName.localeCompare(b.siteName),
      );
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const reportDate = new Date(reportData.generatedAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const leftMargin = 15;
      const rightMargin = 15;
      const footerY = pageHeight - 16;

      const loadLogo = async () => {
        const logoResponse = await fetch("/logo.png");
        const logoBlob = await logoResponse.blob();
        return await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
      };

      const drawHeader = async () => {
        try {
          const logoBase64 = await loadLogo();
          doc.addImage(logoBase64, "PNG", 12, 6, 75, 24);
        } catch {
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text("[Company Logo]", 15, 22);
        }

        doc.setTextColor(0, 0, 0);
        doc.setFont("Calibri", "bold");
        doc.setFontSize(11);
        doc.text(
          "ENTERPRISE INFORMATION & TECHNOLOGY DIVISION",
          pageWidth - rightMargin,
          16,
          { align: "right" },
        );
        doc.setFontSize(9);
        doc.text("Information Technology Service Operation", 145, 23, {
          align: "center",
        });
        doc.setFont("Calibri", "normal");
      };

      const drawFooter = () => {
        doc.setDrawColor(100, 130, 100);
        doc.setLineWidth(0.4);
        doc.line(18, footerY, pageWidth - 18, footerY);
        doc.setFontSize(5.8);
        doc.setTextColor(90, 110, 90);
        doc.text(
          "Don Mariano Cui Street, Corner J. Llorente Street, Brgy. Capitol Site, Cebu City, Cebu 6000",
          18,
          footerY + 3.3,
        );
        doc.text(
          "Tel no: +63 (32) 255-8000 | Fax no: +63 (32) 253-5639 | www.chonghua.com.ph",
          18,
          footerY + 6.6,
        );
        doc.text(
          "Mantawe Int'l Drive, City South Special Economic Administrative Zone, Mandaue City, Cebu 6014",
          pageWidth / 2 + 2,
          footerY + 3.3,
        );
        doc.text(
          "Tel no: +63 (32) 233-8000 | Fax no: +63 (32) 239-6125 | www.chonghua.com.ph",
          pageWidth / 2 + 2,
          footerY + 6.6,
        );
      };

      const drawPage1 = async () => {
        await drawHeader();

        let y = 40;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);

        doc.setFont(undefined, "bold");
        doc.text("DATE:", leftMargin, y);
        doc.setFont(undefined, "normal");
        doc.text(currentDate, 45, y);
        y += 10;
        doc.setFont(undefined, "bold");
        doc.text("TO:", leftMargin, y);
        doc.setFont(undefined, "normal");
        doc.text(letterDetails.to || "Finance Division", 45, y);
        y += 10;
        doc.setFont(undefined, "bold");
        doc.text("FROM:", leftMargin, y);
        doc.setFont(undefined, "normal");
        doc.text(letterDetails.from, 45, y);
        y += 10;
        doc.setFont(undefined, "bold");
        doc.text("SUBJECT:", leftMargin, y);
        doc.setFont(undefined, "normal");
        doc.text(
          letterDetails.subject || `IT Assets as of ${reportDate}`,
          45,
          y,
        );
        y += 8;

        doc.setLineWidth(0.8);
        doc.line(leftMargin, y, pageWidth - rightMargin, y);
        y += 10;

        doc.setFontSize(9.5);
        const summaryText = `Please find below the summary of IT assets for Chong Hua Mandaue, Cebu, and Medical Mall as of ${reportDate}. Detailed information about the devices listed in the table below is attached.`;
        const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 30);
        doc.text(splitSummary, leftMargin, y);
        y += splitSummary.length * 5 + 6;

        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text(
          `ASSET SUMMARY AS OF ${reportDate.toUpperCase()}`,
          pageWidth / 2,
          y,
          { align: "center" },
        );
        y += 4;

        const siteGroups = sortedSites.slice(0, 3).map((site: any) => ({
          siteName: site.siteName,
          categories: Object.values(site.categories).sort((a: any, b: any) =>
            a.categoryName.localeCompare(b.categoryName),
          ),
        }));

        const colWidths = [42, 16, 16, 16, 16, 16, 16, 15, 15, 15];
        const tableX = leftMargin;
        const topY = y + 4;
        const rowH = 7.5;
        const headH = 7.5;
        const subH = 6;
        const xAt = (idx: number) =>
          tableX + colWidths.slice(0, idx).reduce((a, b) => a + b, 0);
        const tableRight = pageWidth - rightMargin;
        const centerText = (
          text: string,
          x: number,
          w: number,
          yy: number,
          size = 8,
        ) => {
          doc.setFontSize(size);
          doc.text(text, x + w / 2, yy, { align: "center" });
        };

        doc.setLineWidth(0.25);
        doc.setFont(undefined, "normal");
        doc.setFontSize(10);
        doc.text("CATEGORY", xAt(0) + colWidths[0] / 2, topY + 10.5, {
          align: "center",
        });
        doc.rect(xAt(0), topY, colWidths[0], headH + subH);
        doc.rect(
          xAt(1),
          topY,
          colWidths[1] + colWidths[2] + colWidths[3],
          headH,
        );
        doc.rect(
          xAt(4),
          topY,
          colWidths[4] + colWidths[5] + colWidths[6],
          headH,
        );
        doc.rect(
          xAt(7),
          topY,
          colWidths[7] + colWidths[8] + colWidths[9],
          headH,
        );
        centerText(
          "CAPITOL",
          xAt(1),
          colWidths[1] + colWidths[2] + colWidths[3],
          topY + 5.0,
          9.5,
        );
        centerText(
          "MANDAUE",
          xAt(4),
          colWidths[4] + colWidths[5] + colWidths[6],
          topY + 5.0,
          9.5,
        );
        centerText(
          "MEDMALL",
          xAt(7),
          colWidths[7] + colWidths[8] + colWidths[9],
          topY + 5.0,
          9.5,
        );

        [
          "TOTAL",
          "DEPLOYED",
          "ONHAND",
          "TOTAL",
          "DEPLOYED",
          "ONHAND",
          "TOTAL",
          "DEPLOYED",
          "ONHAND",
        ].forEach((label, i) => {
          const x = xAt(i + 1);
          doc.rect(x, topY + headH, colWidths[i + 1], subH);
          centerText(label, x, colWidths[i + 1], topY + headH + 3.8, 5.9);
        });
        doc.rect(xAt(0), topY, colWidths[0], headH + subH);

        const rowLabels = Array.from(
          new Set(
            siteGroups.flatMap((group: any) =>
              group.categories.map((category: any) => category.categoryName),
            ),
          ),
        );

        const getWrappedCategoryLines = (categoryName: string) => {
          const maxWidth = colWidths[0] - 3;
          const lines = doc
            .splitTextToSize(categoryName.toUpperCase(), maxWidth)
            .slice(0, 2) as string[];
          if (lines.length === 2 && lines[1].length > 18) {
            lines[1] = `${lines[1].slice(0, 17).trimEnd()}...`;
          }
          return lines;
        };

        const drawSummaryRows = (labels: string[], startY: number) => {
          let rowY = startY;
          for (const categoryName of labels) {
            const labelLines = getWrappedCategoryLines(categoryName);
            const rowHeight = Math.max(rowH, labelLines.length * 3.4 + 1.5);
            doc.rect(xAt(0), rowY, colWidths[0], rowHeight);
            doc.setFont(undefined, "normal");
            labelLines.forEach((line, idx) => {
              const lineY = rowY + 4.0 + idx * 3.5;
              doc.setFontSize(7.0);
              doc.text(line, xAt(0) + colWidths[0] / 2, lineY, {
                align: "center",
              });
            });

            siteGroups.forEach((group: any, siteIndex: number) => {
              const category = group.categories.find(
                (item: any) => item.categoryName === categoryName,
              );
              const values = category
                ? [
                    category.total.toString(),
                    category.deployed.toString(),
                    category.onHand.toString(),
                  ]
                : ["0", "0", "0"];
              const siteBaseIndex = 1 + siteIndex * 3;
              for (let j = 0; j < 3; j++) {
                const width = colWidths[siteBaseIndex + j];
                if (typeof width !== "number") continue;
                const x = xAt(siteBaseIndex + j);
                doc.rect(x, rowY, width, rowHeight);
                doc.setFont(undefined, "normal");
                centerText(
                  values[j],
                  x,
                  width,
                  rowY + rowHeight / 2 + 0.9,
                  6.8,
                );
              }
            });
            rowY += rowHeight;
          }
          return rowY;
        };

        const noteSpace = 9;
        const firstPageRows: string[] = [];
        const remainingRows: string[] = [];
        let probeY = topY + headH + subH;
        for (const categoryName of rowLabels) {
          const labelLines = getWrappedCategoryLines(categoryName);
          const rowHeight = Math.max(rowH, labelLines.length * 3.4 + 1.5);
          if (probeY + rowHeight + noteSpace > footerY) {
            remainingRows.push(categoryName);
          } else {
            firstPageRows.push(categoryName);
            probeY += rowHeight;
          }
        }

        let rowY = drawSummaryRows(firstPageRows, topY + headH + subH);

        doc.setFont(undefined, "bold");
        doc.setFontSize(7.5);
        doc.text(
          "Note: Inventory On-Hand refers to brand new units still pending for deployment.",
          leftMargin,
          rowY + 4,
        );

        if (remainingRows.length > 0) {
          doc.addPage();
          await drawHeader();
          doc.setTextColor(0, 0, 0);
          doc.setLineWidth(0.25);
          doc.setFontSize(10);
          doc.setFont(undefined, "bold");
          doc.text(
            `ASSET SUMMARY AS OF ${reportDate.toUpperCase()}`,
            pageWidth / 2,
            38,
            { align: "center" },
          );
          const continuationTopY = 46;
          doc.setFont(undefined, "normal");
          doc.setFontSize(10);
          doc.text(
            "CATEGORY",
            xAt(0) + colWidths[0] / 2,
            continuationTopY + 10.5,
            { align: "center" },
          );
          doc.rect(xAt(0), continuationTopY, colWidths[0], headH + subH);
          doc.rect(
            xAt(1),
            continuationTopY,
            colWidths[1] + colWidths[2] + colWidths[3],
            headH,
          );
          doc.rect(
            xAt(4),
            continuationTopY,
            colWidths[4] + colWidths[5] + colWidths[6],
            headH,
          );
          doc.rect(
            xAt(7),
            continuationTopY,
            colWidths[7] + colWidths[8] + colWidths[9],
            headH,
          );
          centerText(
            "CAPITOL",
            xAt(1),
            colWidths[1] + colWidths[2] + colWidths[3],
            continuationTopY + 5.0,
            9.5,
          );
          centerText(
            "MANDAUE",
            xAt(4),
            colWidths[4] + colWidths[5] + colWidths[6],
            continuationTopY + 5.0,
            9.5,
          );
          centerText(
            "MEDMALL",
            xAt(7),
            colWidths[7] + colWidths[8] + colWidths[9],
            continuationTopY + 5.0,
            9.5,
          );
          [
            "TOTAL",
            "DEPLOYED",
            "ONHAND",
            "TOTAL",
            "DEPLOYED",
            "ONHAND",
            "TOTAL",
            "DEPLOYED",
            "ONHAND",
          ].forEach((label, i) => {
            const x = xAt(i + 1);
            doc.rect(x, continuationTopY + headH, colWidths[i + 1], subH);
            centerText(
              label,
              x,
              colWidths[i + 1],
              continuationTopY + headH + 3.8,
              5.9,
            );
          });
          doc.rect(xAt(0), continuationTopY, colWidths[0], headH + subH);
          rowY = drawSummaryRows(
            remainingRows,
            continuationTopY + headH + subH,
          );
          doc.setFont(undefined, "bold");
          doc.setFontSize(7.5);
          doc.text(
            "Note: Inventory On-Hand refers to brand new units still pending for deployment.",
            leftMargin,
            rowY + 4,
          );
          drawFooter();
        }

        drawFooter();
      };

      const drawPage2 = async () => {
        doc.addPage();
        await drawHeader();

        doc.setFont(undefined, "normal");
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(12);
        doc.text("Prepared By:", 20, 75);
        doc.text("Checked By:", 20, 114);
        doc.text("Noted By:", 20, 163);

        doc.setFontSize(11);
        doc.setFont(undefined, "bold");
        doc.text("Dexter Carin", 20, 95);
        doc.text("IT Specialist I", 20, 102);

        doc.text("Bonieber Orofeo", 20, 143);
        doc.setFont(undefined, "normal");
        doc.text("IT - Manager Capitol", 20, 150);

        doc.setFont(undefined, "bold");
        doc.text("Judah Aviles", 74, 143);
        doc.setFont(undefined, "normal");
        doc.text("IT - Manager Mandaue", 74, 150);

        doc.setFont(undefined, "bold");
        doc.text("Eliel Mark Pongasi", 138, 143);
        doc.setFont(undefined, "normal");
        doc.text("IT Service Operations - Senior Manager", 128, 150);

        doc.setFont(undefined, "bold");
        doc.text("Ethel Joy Querubin", 20, 182);
        doc.setFont(undefined, "normal");
        doc.text("VP - Enterprise Information & Technology Division", 20, 189);

        drawFooter();
      };

      const drawPage3 = async () => {
        doc.addPage();
        await drawHeader();

        const page3TitleY = 42;
        doc.setFont(undefined, "bold");
        doc.setFontSize(12);
        doc.text("Detailed summary of the Assets", pageWidth / 2, page3TitleY, {
          align: "center",
        });

        const detailRows: Array<[string, string, string, string, string]> = [];
        for (const site of sortedSites) {
          const categories = Object.values(site.categories).sort(
            (a: any, b: any) => a.categoryName.localeCompare(b.categoryName),
          );
          for (const category of categories) {
            detailRows.push([
              site.siteName,
              category.categoryName,
              category.total.toString(),
              category.deployed.toString(),
              category.onHand.toString(),
            ]);
          }
        }

        (doc as any).autoTable({
          startY: page3TitleY + 8,
          head: [["Site", "Category", "Total", "Deployed", "On-Hand"]],
          body: detailRows,
          margin: { left: leftMargin, right: rightMargin },
          styles: {
            fontSize: 8,
            cellPadding: 2.5,
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.2,
            valign: "middle",
          },
          headStyles: {
            fillColor: [37, 99, 235],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            lineColor: [0, 0, 0],
            lineWidth: 0.2,
          },
          theme: "grid",
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 50 },
            2: { cellWidth: 25, halign: "center" },
            3: { cellWidth: 25, halign: "center" },
            4: { cellWidth: 25, halign: "center" },
          },
        });

        drawFooter();
      };

      await drawPage1();
      await drawPage2();
      await drawPage3();
      doc.save(`Asset-Report-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error in generatePdfContent:", error);
      alert("An error occurred while generating the PDF.");
    }
  };

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>Reports</h1>
        <p className='text-muted-foreground'>
          Generate and view asset management reports
        </p>
      </div>

      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <h2 className='text-xl font-semibold mb-4'>Generate Report</h2>
        <div className='flex flex-wrap items-center gap-2'>
          <Button onClick={handleGenerateReport} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Asset Summary Report"}
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleExportPdf}
            disabled={!reportData?.data}
          >
            <FileText className='h-4 w-4 mr-2' />
            Export PDF
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleExportCsv}
            disabled={!reportId || isExporting}
          >
            <Download className='h-4 w-4 mr-2' />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>

        {isError && (
          <p className='text-red-500 mt-2'>
            Error generating report:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        )}
      </div>

      {reportData && reportData.data && (
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='mb-4'>
            <h2 className='text-xl font-semibold'>{reportData.title}</h2>
            <p className='text-sm text-muted-foreground'>
              Generated: {new Date(reportData.generatedAt).toLocaleString()}
            </p>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='border border-gray-300 px-4 py-2 text-left font-semibold'>
                    Site
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left font-semibold'>
                    Category
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-center font-semibold'>
                    Total
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-center font-semibold'>
                    Deployed
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-center font-semibold'>
                    On-Hand
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.values(reportData.data).map((site: SiteData) =>
                  Object.values(site.categories).map((category, idx) => (
                    <tr
                      key={`${site.siteId}-${category.categoryId}`}
                      className={idx === 0 ? "bg-blue-50" : ""}
                    >
                      {idx === 0 && (
                        <td
                          className='border border-gray-300 px-4 py-2 font-medium'
                          rowSpan={Object.keys(site.categories).length}
                        >
                          {site.siteName}
                        </td>
                      )}
                      <td className='border border-gray-300 px-4 py-2'>
                        {category.categoryName}
                      </td>
                      <td className='border border-gray-300 px-4 py-2 text-center'>
                        {category.total}
                      </td>
                      <td className='border border-gray-300 px-4 py-2 text-center'>
                        {category.deployed}
                      </td>
                      <td className='border border-gray-300 px-4 py-2 text-center'>
                        {category.onHand}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>PDF Export Details</DialogTitle>
            <DialogDescription>
              Enter the letter header details for the PDF export.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='to' className='text-right'>
                To
              </Label>
              <Input
                id='to'
                placeholder='Finance Division'
                value={letterDetails.to}
                onChange={(e) =>
                  setLetterDetails({ ...letterDetails, to: e.target.value })
                }
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='from' className='text-right'>
                From
              </Label>
              <Input
                id='from'
                value={letterDetails.from}
                onChange={(e) =>
                  setLetterDetails({ ...letterDetails, from: e.target.value })
                }
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='subject' className='text-right'>
                Subject
              </Label>
              <Input
                id='subject'
                placeholder='IT Assets as of...'
                value={letterDetails.subject}
                onChange={(e) =>
                  setLetterDetails({
                    ...letterDetails,
                    subject: e.target.value,
                  })
                }
                className='col-span-3'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowPdfModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPdfExport}>Export PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

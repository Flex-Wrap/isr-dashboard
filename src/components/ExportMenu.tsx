import { useState } from "react";
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";

interface ExportMenuProps {
  dashboardRef?: React.RefObject<HTMLDivElement | null>;
  showPDF?: boolean;
}

export function ExportMenu({ dashboardRef, showPDF = true }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportPDF = () => {
    let element: HTMLElement | null = null;

    if (dashboardRef?.current) {
      // Export entire dashboard
      element = dashboardRef.current;
    } else {
      // Export just the chart container (find parent from button click)
      const button = document.activeElement as HTMLElement;
      element = button?.closest(".chart-container") as HTMLElement;
    }

    if (!element) {
      console.error("Could not find element to export");
      return;
    }

    // Get element dimensions to preserve aspect ratio
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const opt = {
      margin: 10,
      filename: `export-${new Date().toLocaleDateString()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: {
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width + 20, height + 20],
      },
    };

    (html2pdf() as any).set(opt).from(element).save();
    setIsOpen(false);
  };

  const handleExportPNG = () => {
    let element: HTMLElement | null = null;

    if (dashboardRef?.current) {
      // Export entire dashboard
      element = dashboardRef.current;
    } else {
      // Export just the chart container (find parent from button click)
      const button = document.activeElement as HTMLElement;
      element = button?.closest(".chart-container") as HTMLElement;
    }

    if (!element) {
      console.error("Could not find element to export");
      return;
    }

    // Hide the export menu before taking screenshot
    setIsOpen(false);

    // Delay slightly to let menu close before screenshot
    setTimeout(() => {
      html2canvas(element!, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })
        .then((canvas) => {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `export-${new Date().toLocaleDateString()}.png`;
          link.click();
        })
        .catch((error) => {
          console.error("Error exporting PNG:", error);
        });
    }, 100);
  };

  const handleExportSVG = () => {
    let element: HTMLElement | null = null;

    if (dashboardRef?.current) {
      // Export entire dashboard
      element = dashboardRef.current;
    } else {
      // Export just the chart container (find parent from button click)
      const button = document.activeElement as HTMLElement;
      element = button?.closest(".chart-container") as HTMLElement;
    }

    if (!element) {
      console.error("Could not find element to export");
      return;
    }

    // Find SVG elements (nivo renders as SVG)
    const svgElement = element.querySelector("svg");

    if (svgElement) {
      // Clone the SVG to avoid modifying the original
      const svgClone = svgElement.cloneNode(true) as SVGElement;

      // Create a complete SVG document
      const svgString = new XMLSerializer().serializeToString(svgClone);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `export-${new Date().toLocaleDateString()}.svg`;
      link.click();

      URL.revokeObjectURL(url);
    } else {
      console.warn("No SVG found in element");
    }

    setIsOpen(false);
  };

  return (
    <div className="export-menu">
      <button
        className="export-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Export options"
      >
        ⋮
      </button>
      {isOpen && (
        <div className="export-menu-dropdown">
          {showPDF && (
            <button className="export-option" onClick={handleExportPDF}>
              Export as PDF
            </button>
          )}
          <button className="export-option" onClick={handleExportPNG}>
            Export as PNG
          </button>
          <button className="export-option" onClick={handleExportSVG}>
            Export as SVG
          </button>
        </div>
      )}
    </div>
  );
}

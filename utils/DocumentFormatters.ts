export const formatForPdf = (htmlContent: string) => {
  return `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; max-width: 800px; margin: 0 auto;">
      ${htmlContent}
    </div>
    `;
};

export const formatForWord = (htmlContent: string) => {
  return `
        <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif;">
        ${htmlContent}
      </body>
    </html>
    `;
};

export const getPdfOptions = (filename: string) => {
  return {
    margin: 0.75,
    filename: filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: {
      unit: "in" as const,
      format: "letter" as const,
      orientation: "portrait" as const,
    },
  };
};

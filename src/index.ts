import { createTemplateCompiler } from "./compiler";
import { childrenToText } from "./helpers";

const pdf = createTemplateCompiler();

pdf.defineConfig({ unit: "px" });

pdf.defineElement("pdf", ({ context, props, doc, children }) => {
  if (props.trim) context.trim = true;
  if (props.margin) {
    context.width = 50;
    context.height = 50;
    context.margin = 50;
  }

  if (props.fontSize) doc.setFontSize(props.fontSize);
  if (props.color) doc.setTextColor(props.color);

  console.log(children);
});

pdf.defineElement("pdf-title", ({ doc, context, children }) => {
  const text = typeof children == "string" ? children : childrenToText(children);

  let currentFontSize = doc.getFontSize();

  doc.setFontSize(16).text(text, context.width, context.height).setFontSize(currentFontSize);

  context.height += 9;
});

pdf.defineElement("pdf-subtitle", ({ doc, children, context }) => {
  const text = typeof children == "string" ? children : childrenToText(children);

  const font = doc.getFont();
  const textColor = doc.getTextColor();

  doc
    .setFont("Helvetica", "bold")
    .setTextColor("#808080")
    .text(text, context.width, context.height)
    .setFont(font.fontName, font.fontStyle)
    .setTextColor(textColor);

  return this;
});

pdf.defineElement("pdf-heading", ({ doc, children, context }) => {
  const text = typeof children == "string" ? children : childrenToText(children);
  doc
    .setFont("Helvetica", "bold")
    .text(text, context.width, context.height)
    .setFont("Helvetica", "normal");

  context.height += 15;
});

pdf.defineElement("pdf-text", ({ doc, children, context }) => {
  const text = typeof children == "string" ? children : childrenToText(children);
  doc.text(text, context.width, context.height);

  context.height += 15;
});

pdf.defineElement("pdf-row", ({ doc, context, self, props }) => {
  if (props.offset) context.height += +props.offset || 0;

  context.width = context.margin;
  context.height += 15;

  self.metadata = { height: context.height };
});

pdf.defineElement("pdf-column", ({ doc, context, parent, props }) => {
  let rowHeight = parent.metadata.height;
  if (rowHeight) context.height = rowHeight;

  if (props.offset) context.width += parseInt(props.offset) || 0;
});

pdf.defineElement("pdf-absolute", () => {});

pdf.defineElement("pdf-image", async ({ doc, context, props }) => {
  if (!props.src) return pdf.silentError("Src is required");

  const format = String(props.src).split(".").pop();

  var img = new Image();
  img.src = props.src;

  return doc.addImage(
    img,
    format.toUpperCase(),
    context.width,
    context.height,

    +props.width || 500,
    +props.height || 500
  );
});

pdf.defineElement("pdf-image", async ({ doc, context, props }) => {
  if (!props.src) return pdf.silentError("Src is required");

  const format = String(props.src).split(".").pop();

  var img = new Image();
  img.src = props.src;

  return doc.addImage(
    img,
    format.toUpperCase(),
    context.width,
    context.height,

    +props.width || 500,
    +props.height || 500
  );
});

pdf.defineElement("pdf-table", async ({ doc, context, parent, props, self }) => {
  self.metadata.startWidth = context.width;
});

pdf.defineElement("pdf-hr", async ({ doc, props, context, self }) => {
  const color = props.color || "#aaaaaa";
  const lineWidth = props.lineWidth || 1;

  context.height += 10;

  doc
    .setDrawColor(color)
    .setLineWidth(lineWidth)
    .moveTo(50, context.height)
    .lineTo(400, context.height)
    .stroke();
});

pdf.defineElement("pdf-tr", async ({ doc, context, parent, props, children }) => {
  const { startWidth } = parent.metadata || { startWidth: context.width };
  context.width = startWidth;
  context.height += +props?.height || 15;
});

pdf.defineElement("pdf-th", async ({ doc, context, parent, props, children }) => {
  const text = typeof children == "string" ? children : childrenToText(children);

  doc
    .setFont("Helvetica", "bold")
    .text(text, context.width, context.height)
    .setFont("Helvetica", "normal");

  context.width += +props.width || 50;
});

pdf.defineElement("pdf-td", async ({ doc, context, parent, props, children }) => {
  const text = typeof children == "string" ? children : childrenToText(children);
  if (text == "[object Object]") return;

  console.log(props);
  doc.text(text, context.width, context.height, {
    align: props?.align || "left",
    maxWidth: props.width,
  });

  context.width += +props.width || 50;
});

export const template = pdf.prepare();

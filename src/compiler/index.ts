import jsPDF, { jsPDFOptions } from "jspdf";
import { isIterable } from "../helpers";

export function createTemplateCompiler() {
  let config: jsPDFOptions = {};
  const handlers: ElementHandlers = {
    default: (x) => {
      // console.log("default fired");
    },
  };

  let hooks: any = {};

  let context = {
    height: 0,
    width: 0,
    margin: 0,
  };

  async function compile({
    doc,
    template,
    parent,
  }: {
    doc: jsPDF;
    template: PdfNode;
    parent: PdfNode;
  }) {
    // guard:  remove all Symbols as Symbol(Text) or undefined weird tags
    if (typeof template.type !== "string") return;

    const handler = handlers[template.type] || handlers.default;
    await handler({
      children: template.children,
      props: template.props,
      doc,
      context,
      parent,
      self: template,
    });

    const childrenless_elements = ["pdf-title", "pdf-heading", "pdf-text", "pdf-image", "pdf-hr"];
    if (childrenless_elements.includes(template.type)) return;

    if (!isIterable(template.children))
      return console.log(`content of ${template.type} not iterable `);

    //@ts-ignore
    template.children = template.children.flat();

    for (const child of template.children) {
      if (typeof child == "string") continue;
      if (typeof child == "number") continue;

      console.log(`${String(template?.type)} > ${String(child?.type)}`);
      if (!child || child.type === undefined) console.log({ template, child });

      await compile({ doc, template: extract(child || {}), parent: template });
    }
  }

  async function execute(root: PdfNode) {
    const doc = new jsPDF(config);

    await compile({ doc, template: root, parent: null });

    return {
      save: (filename: string) => doc.save(filename),
      debug: () => window.open(doc.output("bloburl"), "blank"),
      document: doc,
    };
  }

  return {
    beforeStart: (hook: Hook) => {
      hooks["before-start"].push(hook);
      return this;
    },
    beforeEnd: (hook: Hook) => {
      hooks["before-end"].push(hook);
      return this;
    },
    defineElement(key: string, callback: ElementCallback): void {
      handlers[key] = callback;
    },
    defineConfig(options: jsPDFOptions): void {
      config = { ...config, ...options };
    },
    silentError(message: string) {
      console.log(message);
    },
    prepare() {
      return execute;
    },
  };
}

function extract({ children = [], type, props, metadata = {} }: any): PdfNode {
  return { children, type, props: props || {}, metadata };
}

type Hook = (internals: Internals) => void;

type Internals = {
  doc: jsPDF;
};

export type ElementHandlers = {
  [key: string]: ElementCallback;
};

export type ElementCallback = (options: ElementOptions) => void;

export type ElementOptions = {
  doc: jsPDF;

  context: {
    height: number;
    width: number;
    margin: number;
    [key: string]: any;
  };

  props: any;
  parent: PdfNode | null;
  self: PdfNode;
  children: PdfNode["children"];
};

export type PdfNode = {
  type: string;
  props: any;
  children: PdfNode[] | string;
  metadata?: any;
};

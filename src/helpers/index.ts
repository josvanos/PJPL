export function childrenToText(children: any[]) {
  return children.reduce((acc: string, template: string | any) => {
    if (typeof template === "string") return acc + template;
    if (typeof template === "number") return acc + String(template);

    if (typeof template.children === "object" || Array.isArray(template.children)) return acc;

    return template?.children ? acc + template.children : acc;
  }, "");
}

export function isIterable(obj: any) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === "function";
}

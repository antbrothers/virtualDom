import "./styles.css";

document.getElementById("app").innerHTML = `
<h1>Hello Vanilla!</h1>
<div>
  We use the same configuration as Parcel to bundle this sandbox, you can find more
  info about Parcel 
  <text>1</text>
  <text>2</text>
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
</div>
`;
const content = document.documentElement.outerHTML;

createVirtualDom(content, false);

const SVG_NAMESPACE = "http://www.w3.org/svg";
const XML_NAMESPACES = ["xmlns", "xmlns:svg", "xmlns:xlink"];
function createVirtualDom(element, isSVG = false) {
  switch (element.nodeType) {
    case Node.TEXT_NODE:
      return createVirtualText(element);
    case Node.ELEMENT_NODE:
      return createVirtualElement(
        element,
        isSVG || element.tagName.toLowerCase() === "svg"
      );
    default:
      return null;
  }
}

function createVirtualText(element) {
  const vText = {
    text: element.nodeValue,
    type: "VirtualText"
  };
  if (typeof element.__flow !== "undefined") {
    vText.__flow = element.__flow;
  }
  return vText;
}

function createVirtualElement(element, isSVG = false) {
  const tagName = element.tagName.toLowerCase();
  const children = getNodeChildren(element, isSVG);
  const { attr, namespace } = getNodeAttributes(element, isSVG);
  const vElement = {
    tagName,
    type: "VirtualElment",
    children,
    attributes: attr,
    namespace
  };
  if (typeof element.__flow !== "undefined") {
    vElement.__flow = element.__flow;
  }
  return vElement;
}

function getNodeChildren(element, isSVG = false) {
  const childNode = element.childNode ? [...element.childNode] : [];
  const children = [];
  childNode.forEach((cnode) => {
    children.push(createVirtualDom(cnode, isSVG));
  });
  return children.filter((c) => !!c);
}
function getNodeAttributes(element, isSVG = false) {
  const attributes = element.attributes ? [...element.attributes] : [];
  const attr = {};
  let namespace;
  attributes.forEach(({ nodeName, nodeValue }) => {
    attr[nodeName] = nodeValue;
    if (XML_NAMESPACES.includes(nodeName)) {
      namespace = nodeValue;
    } else if (isSVG) {
      namespace = SVG_NAMESPACE;
    }
  });
  return { attr, namespace };
}

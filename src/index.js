import "./styles.css";

document.getElementById("app").innerHTML = `
<h1>Hello !</h1>
<div>
  【一】</br>   
    1.1. DOM 转虚拟dom </br>
    1.2. 虚拟dom 还原DOM </br>
    1.3. 监听dom结构变化 </br>
  【二】</br>
    2.1 Virtual Dom 对比 DOM </br>
    2.2 绘制 && 重绘
</div>
`;
const content = document.body;

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const XML_NAMESPACES = ["xmlns", "xmlns:svg", "xmlns:xlink"];

// 把DOM 转虚拟dom
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
    type: "VirtualElement",
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
  const childNodes = element.childNodes ? [...element.childNodes] : [];
  const children = [];
  childNodes.forEach((cnode) => {
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
let _res = createVirtualDom(content, false);
console.log(_res);

let _r = createElement(_res);
console.log(_r);
// 把虚拟dom 转 DOM
function createElement(vdom, nodeFilter = () => true) {
  let node;
  if (vdom.type === "VirtualText") {
    node = document.createTextNode(vdom.text);
  } else {
    node =
      typeof vdom.namespace === "undefined"
        ? document.createElement(vdom.tagName)
        : document.createElementNS(vdom.namespace, vdom.tagName);
    for (let name in vdom.attributes) {
      node.setAttribute(name, vdom.attributes[name]);
    }
    vdom.children.forEach((cnode) => {
      const childNode = createElement(cnode, nodeFilter);
      if (childNode && nodeFilter(childNode)) {
        node.appendChild(childNode);
      }
    });
  }
  if (vdom.__flow) {
    node.__flow = vdom.__flow;
  }
  return node;
}

// 监听DOM结构变化
const options = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeOldValue: true,
  characterData: true,
  characterDataOldValue: true
};
const observer = new MutationObserver((mutationList) => {
  console.log(mutationList);
});
observer.observe(document.documentElement, options);

const onMutationChange = (mutationList) => {
  const getFlowId = (node) => {
    if (node) {
      if (!node.__flow) node.__flow = { id: uuid() };
      return node.__flow.id;
    }
  };
  mutationList.forEach((mutation) => {
    const { target, type, attributeName } = mutation
  })
};

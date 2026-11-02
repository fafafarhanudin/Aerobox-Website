// Aerobox Assets for Figma: the UI (ui.html) browses the library and sends finished SVG or gradient paints here.
figma.showUI(__html__, { width: 400, height: 600, themeColors: true });

// put a new node in the middle of what the user is looking at, or inside the selected frame
function place(node) {
  const sel = figma.currentPage.selection;
  const host = sel.length === 1 && (sel[0].type === "FRAME" || sel[0].type === "SECTION") ? sel[0] : null;
  if (host) {
    host.appendChild(node);
    node.x = Math.round((host.width - node.width) / 2);
    node.y = Math.round((host.height - node.height) / 2);
  } else {
    const c = figma.viewport.center;
    node.x = Math.round(c.x - node.width / 2);
    node.y = Math.round(c.y - node.height / 2);
  }
  figma.currentPage.selection = [node];
}

figma.ui.onmessage = (msg) => {
  try {
    if (msg.type === "svg") {
      const node = figma.createNodeFromSvg(msg.svg);
      node.name = msg.name;
      if (msg.width) node.rescale(msg.width / node.width);
      // the illustrated hard shadow, as a native effect so it stays editable
      if (msg.shadow) {
        const [r, g, b] = [1, 3, 5].map((i) => parseInt(msg.shadow.slice(i, i + 2), 16) / 255);
        node.effects = [{ type: "DROP_SHADOW", color: { r, g, b, a: 1 }, offset: { x: -7.79 * (node.width / 240), y: 4.5 * (node.width / 240) }, radius: 0, spread: 0, visible: true, blendMode: "NORMAL", showShadowBehindNode: false }];
      }
      place(node);
      figma.notify(`Added ${msg.name}`);
    } else if (msg.type === "gradient") {
      const targets = figma.currentPage.selection.filter((n) => "fills" in n && n.type !== "GROUP");
      if (targets.length) {
        for (const n of targets) n.fills = msg.paints;
        figma.notify(`${msg.name} applied to ${targets.length} layer${targets.length > 1 ? "s" : ""}`);
      } else {
        const rect = figma.createRectangle();
        rect.name = msg.name;
        rect.resize(480, 300);
        rect.cornerRadius = 24;
        rect.fills = msg.paints;
        place(rect);
        figma.notify(`Added ${msg.name}`);
      }
    } else if (msg.type === "notify") {
      figma.notify(msg.text, { error: !!msg.error });
    }
  } catch (e) {
    figma.notify(`Could not add ${msg.name || "asset"}: ${e.message}`, { error: true });
  }
};

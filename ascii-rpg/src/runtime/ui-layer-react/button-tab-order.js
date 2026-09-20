function removeFromTabOrder(node) {
  if (node instanceof HTMLButtonElement) {
    node.tabIndex = -1;
  }
}

function removeDescendantButtonsFromTabOrder(node) {
  if (!(node instanceof Element)) return;
  removeFromTabOrder(node);
  node.querySelectorAll("button").forEach(removeFromTabOrder);
}

/**
 * Keeps UI buttons out of sequential keyboard navigation, including buttons
 * rendered after the initial application mount.
 */
export function removeButtonsFromTabOrder(root) {
  if (!(root instanceof Element)) return () => {};

  removeDescendantButtonsFromTabOrder(root);

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") {
        removeFromTabOrder(record.target);
        continue;
      }

      record.addedNodes.forEach(removeDescendantButtonsFromTabOrder);
    }
  });

  observer.observe(root, {
    attributes: true,
    attributeFilter: ["tabindex"],
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
}

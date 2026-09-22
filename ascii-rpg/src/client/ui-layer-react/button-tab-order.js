const FOCUSABLE_SELECTOR = "button, a, input, select, textarea, [tabindex], [contenteditable=\"true\"]";

function removeFromTabOrder(node) {
  if (node instanceof Element && node.matches(FOCUSABLE_SELECTOR) && node.tabIndex !== -1) {
    node.tabIndex = -1;
  }
}

function removeDescendantFocusableElementsFromTabOrder(node) {
  if (!(node instanceof Element)) return;
  removeFromTabOrder(node);
  node.querySelectorAll(FOCUSABLE_SELECTOR).forEach(removeFromTabOrder);
}

/**
 * Keeps game UI controls out of sequential keyboard navigation, including
 * controls rendered after the initial application mount.
 */
export function removeFocusableElementsFromTabOrder(root) {
  if (!(root instanceof Element)) return () => {};

  removeDescendantFocusableElementsFromTabOrder(root);

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") {
        removeFromTabOrder(record.target);
        continue;
      }

      record.addedNodes.forEach(removeDescendantFocusableElementsFromTabOrder);
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

export const removeButtonsFromTabOrder = removeFocusableElementsFromTabOrder;

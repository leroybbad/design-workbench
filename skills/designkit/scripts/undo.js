// Unified undo/redo stack for all canvas operations.
// Each entry stores enough info to undo and redo the operation.
window.DKUndo = (function () {
  const stack = [];
  let pointer = -1; // points to the last applied operation

  function push(entry) {
    // entry: { type: string, undo: function, redo: function, description: string }
    // Truncate forward history
    stack.length = pointer + 1;
    stack.push(entry);
    pointer = stack.length - 1;
  }

  function undo() {
    if (pointer < 0) return false;
    stack[pointer].undo();
    pointer--;
    return true;
  }

  function redo() {
    if (pointer >= stack.length - 1) return false;
    pointer++;
    stack[pointer].redo();
    return true;
  }

  function clear() {
    stack.length = 0;
    pointer = -1;
  }

  function canUndo() { return pointer >= 0; }
  function canRedo() { return pointer < stack.length - 1; }
  function count() { return stack.length; }

  return { push, undo, redo, clear, canUndo, canRedo, count };
})();

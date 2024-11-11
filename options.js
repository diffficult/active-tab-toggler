document.addEventListener("DOMContentLoaded", async () => {
  const commands = await browser.commands.getAll();
  const toggleCommand = commands.find((cmd) => cmd.name === "toggle-tabs");
  document.getElementById("shortcutInput").value = toggleCommand
    ? toggleCommand.shortcut
    : "Alt+W";

  // Handle shortcut changes
  const shortcutInput = document.getElementById("shortcutInput");
  shortcutInput.addEventListener("keydown", handleShortcutInput);
});

async function handleShortcutInput(e) {
  e.preventDefault();

  if (
    e.key === "Control" ||
    e.key === "Alt" ||
    e.key === "Shift" ||
    e.key === "Meta"
  ) {
    return;
  }

  const modifiers = [];
  if (e.ctrlKey) modifiers.push("Ctrl");
  if (e.altKey) modifiers.push("Alt");
  if (e.shiftKey) modifiers.push("Shift");
  if (e.metaKey) modifiers.push("Meta");

  if (modifiers.length === 0) {
    return;
  }

  const shortcut = [...modifiers, e.key.toUpperCase()].join("+");

  try {
    await browser.commands.update({
      name: "toggle-tabs",
      shortcut: shortcut,
    });
    e.target.value = shortcut;

    const status = document.getElementById("shortcutStatus");
    status.textContent = "Shortcut updated successfully!";
    status.style.color = "green";
    setTimeout(() => {
      status.textContent = "";
    }, 2000);
  } catch (error) {
    const status = document.getElementById("shortcutStatus");
    status.textContent = "This shortcut is already in use.";
    status.style.color = "red";
    setTimeout(() => {
      status.textContent = "";
    }, 2000);
  }
}

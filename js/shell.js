

function Shell(term, commands) {
  // Private shell state
  let currentUser = 'user';
  let hasRootPrivileges = false;
  let waitingForPassword = false;
  let queuedSudoCommand = null;
  let inputBuffer = '';
  const correctPassword = 'secret';

  /**
   * Show the prompt. If waiting for password, display a password prompt instead.
   */
  function showPrompt() {
    if (waitingForPassword) {
      term.write(`\r\n[sudo] password for ${currentUser}: `);
    } else {
      term.write(`\r\n\x1b[32m@devktor:~$ \x1b[0m`);
    }
  }

  /**
   * Initialize shell behavior: greet user, show prompt, hook up onKey events.
   */
  function init() {
    showPrompt();

    // Handle key events
    term.onKey(e => handleKey(e));
  }

  /**
   * Handle incoming keyboard events.
   */
  function handleKey(e) {
    const { key: char } = e;
    const ev = e.domEvent;
    const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

    if (ev.key === 'Enter') {
      if (waitingForPassword) {
        // Checking the password
        const enteredPassword = inputBuffer.trim();
        inputBuffer = '';
        waitingForPassword = false;
        checkPassword(enteredPassword);
        showPrompt();
      } else {
        // Normal command parsing
        const commandString = inputBuffer.trim();
        inputBuffer = '';
        if (commandString) {
          runCommand(commandString);
        }
        showPrompt();
      }
    }
    else if (ev.key === 'Backspace') {
      if (inputBuffer.length > 0) {
        inputBuffer = inputBuffer.slice(0, -1);
        term.write('\b \b');
      }
    }
    else if (printable) {
      // If waiting for password, mask the input
      if (waitingForPassword) {
        inputBuffer += char;
        term.write('*');
      } else {
        inputBuffer += char;
        term.write(char);
      }
    }
  }

  /**
   * Compare the entered password with the known correct password
   * and acquire privileges if valid.
   */
  function checkPassword(enteredPassword) {
    if (enteredPassword === correctPassword) {
      hasRootPrivileges = true;
      currentUser = 'root';
      term.write('\r\nPassword correct. You now have root privileges.');
      // If a command was queued by sudo, run it
      if (queuedSudoCommand) {
        const cmd = queuedSudoCommand;
        queuedSudoCommand = null;
        runCommand(cmd);
      }
    } else {
      term.write('\r\n\x1b[31mSorry, try again.\x1b[0m');
      queuedSudoCommand = null;
    }
  }

  /**
   * Main command dispatcher.
   */
  function runCommand(cmdString) {
    const [cmdName, ...args] = cmdString.split(/\s+/);

    // Check if it's a `sudo` invocation
    if (cmdName === 'sudo') {
      if (args.length < 1) {
        term.write(`\r\nUsage: sudo <command>\r\n`);
        return;
      }
      const subCommand = args.join(' ');
      handleSudo(subCommand);
      return;
    }

    // Otherwise, find a matching command
    const cmdObj = commands.find(c => c.name === cmdName);
    if (!cmdObj) {
      term.write(`\r\nCommand not found: ${cmdName}\r\n`);
      return;
    }

    // Check root privileges if needed
    if (cmdObj.requireRoot && !hasRootPrivileges) {
      term.write(`\r\n\x1b[31mPermission denied. Use "sudo ${cmdName}" and enter password.\x1b[0m\r\n`);
      return;
    }

    // Execute the command's handler
    cmdObj.handler(term, { currentUser, hasRootPrivileges }, args);
  }

  /**
   * If already root, run the command. Otherwise, prompt for a password.
   */
  function handleSudo(cmdString) {
    if (hasRootPrivileges) {
      runCommand(cmdString);
    } else {
      waitingForPassword = true;
      queuedSudoCommand = cmdString;
    }
  }

  // Return an object containing public methods
  return {
    init
  };
}


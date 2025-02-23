 //import { Shell } from './shell.js';  // <-- Update path as needed

    // 1. Define the commands list here or in another file

const services = [
  ["Enterprise Software Architecture", true], 
  ["Software Development", true],
  ["Distributed Applications", true],
  ["Service Oriented Architecture", true],
  ["Monkey Coding", false],
  ["Low Latency Services", true],
  ["High Performance Services", true],
  ["Blockchain Development", true]
];


const commands = [
  {
    name: 'help',
    description: 'show this help message',
    requireRoot: false,
    handler: (term, state) => {
    term.write(`\r\n\r\nAvailable commands:\r\n\r\n`);
    commands.forEach(cmd => {
      const rootTag = cmd.requireRoot ? ' (root)' : '';
        term.write(`\x1b[32m${cmd.name}${rootTag}\x1b[0m - ${cmd.description}\r\n`);
      });
      term.write(`\x1b[32msudo <command> \x1b[0m - acquire root privileges for <command>\r\n`);
    }
  },
  {
    name: 'who',
    description: 'show current user',
    requireRoot: false,
    handler: (term, state) => {
      term.write('\r\n linkedin: \x1b]8;;https://www.linkedin.com/in/devktor\x07https://www.linkedin.com/in/devktor\x1b]8;;\x07\r\n');
    }
  },
  {
    name: 'mail',
    description: 'read/write mail',
    requireRoot: true,
    handler: (term, state) => {
      term.write(`\r\n\r\n\x1b[32mmailto:pam@devktor.com\x1b[0m\r\n`);
    }
  },
  {
    name: "service",
    description: " manage system services",
    requrieRoot: false,
    handler: (term, state, args) =>{
      if (args.length === 0) {
        term.write(`\r\nUsage: service <option> | --status-all | [ service_name [ command | --full-restart ] ]\r\n`);
        return;
      }

      if (args[0] === '--status-all') {
        services.forEach(function(item){
          term.write("\r\n* "+item[0]+"   "+(item[1]?"\x1b[32mrunning\x1b[0m":"\x1b[31mnot running\x1b[0m"));
        });
        term.write("\r\n");
            
      } else {
        term.write('\r\n\x1b[31mAccess denied.\x1b[0m\r\n');
      }
    }
  },
  {
    name: "ifconfig",
    description: "network status",
    requireRoot: false,
    handler: (term, state) =>{
      term.write("\r\nbitcoin:1BsDN4ZP3XsTVvtRG4MgWFki7HKS2BYT9j\r\n");
    }
  }
];

const term = new Terminal({
  cursorBlink: true,
  rows: 25,
  cols: 80,
  fontSize: 18,
  fontFamily: 'monospace',
  theme: {
    foreground: '#fcee65',
    background: 'rgba(0,0,0,0)'
  }
});

const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);


const container = document.getElementById('terminal');
term.open(container);
fitAddon.fit();

const shell = new Shell(term, commands);
//shell.init();
term.attachCustomKeyEventHandler((e) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key ==='ArrowLeft' || e.key === 'ArrowRight') {
    return false;
  }

  return true;
});

function bootSequence(term, onDone) {

      let index = 0;

      term.writeln("Booting ...\r\n\r\n");
  
      function printNextLine() {
        if (index < services.length) {
          let service = services[index];
          term.writeln("[ "+(service[1]?"\x1b[32mOK":"\x1b[31mFail")+"\x1b[0m ] "+service[0]);
          index++;
          // Wait ~500ms before printing the next line
          setTimeout(printNextLine, 500);
        } else {
          // Boot finished, call onDone callback
          term.writeln("System boot completed.\r\n");
          onDone();
        }
      }

      // Start printing
      printNextLine();
}

bootSequence(term, ()=>{

  shell.init();
  term.focus();
})
  
//term.focus();

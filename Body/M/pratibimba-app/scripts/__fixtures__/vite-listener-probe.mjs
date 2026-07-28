/**
 * A real listener the port-sweep test can spawn. Its FILE NAME carries "vite"
 * on purpose: the sweep's allowlist matches on the process command line, so a
 * probe named this way exercises the recognised-holder path against a genuine
 * process holding a genuine port — not a stubbed matcher.
 */
import { createServer } from 'node:net';

const port = Number(process.argv[2]);
createServer(socket => socket.destroy()).listen(port, '127.0.0.1');
setInterval(() => {}, 60_000);
